'use server'

import { revalidatePath } from 'next/cache'
import { leadSchema } from '@/lib/validations/lead'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { verifyStaff } from '@/lib/server/verify-staff'
import { checkRateLimit } from '@/lib/rateLimit'
import { getClientIpHash } from '@/lib/request-ip'
import { CONSENT_VERSION } from '@/lib/consent'
import { sendLeadEmail } from '@/lib/notifications/email'
import { sendLeadWhatsApp } from '@/lib/notifications/whatsapp'
import { LEAD_STATUSES, type LeadStatus } from '@/lib/leads-config'

export type AdminActionState =
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
  | null

export async function updateLeadStatus(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const leadId = formData.get('leadId') as string | null
  const newStatus = formData.get('newStatus') as string | null

  if (!leadId || !newStatus) return { status: 'error', message: 'Data tidak valid.' }
  if (!LEAD_STATUSES.some((entry) => entry.value === newStatus)) {
    return { status: 'error', message: 'Status tidak valid.' }
  }

  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const { userId } = staff
  const supabase = await createClient()

  const { data: lead } = await supabase
    .from('leads')
    .select('status')
    .eq('id', leadId)
    .single()

  const { error } = await supabase
    .from('leads')
    .update({ status: newStatus as LeadStatus })
    .eq('id', leadId)

  if (error) return { status: 'error', message: 'Gagal memperbarui status.' }

  await supabase.from('lead_activities').insert({
    lead_id: leadId,
    actor_id: userId,
    action: 'status_changed',
    note: `Status diubah dari ${lead?.status ?? '?'} ke ${newStatus}`,
  })

  revalidatePath(`/admin/leads/${leadId}`)
  return { status: 'success', message: 'Status berhasil diperbarui.' }
}

export async function addLeadNote(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const leadId = formData.get('leadId') as string | null
  const note = (formData.get('note') as string | null)?.trim() ?? ''

  if (!leadId || !note) return { status: 'error', message: 'Catatan tidak boleh kosong.' }

  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const { userId } = staff
  const supabase = await createClient()

  const { error } = await supabase.from('lead_activities').insert({
    lead_id: leadId,
    actor_id: userId,
    action: 'note',
    note,
  })

  if (error) return { status: 'error', message: 'Gagal menyimpan catatan.' }

  revalidatePath(`/admin/leads/${leadId}`)
  return { status: 'success', message: 'Catatan berhasil disimpan.' }
}

export type SubmitLeadState =
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
  | null

// Trim and coerce empty strings to undefined for optional fields.
function str(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === 'string' ? v.trim() : ''
  return s === '' ? undefined : s
}

export async function submitLead(
  _prevState: SubmitLeadState,
  formData: FormData
): Promise<SubmitLeadState> {
  // 1. Honeypot — must be empty; any other value means bot.
  //    Return fake success to avoid tipping off bots. A missing field is not a
  //    bot signal (formData.get returns null), so only strings are checked.
  const honeypot = formData.get('website')
  if (typeof honeypot === 'string' && honeypot !== '') {
    return { status: 'success', message: 'Terima kasih, pesan Anda telah dikirim.' }
  }

  // 2. Build typed object then validate with Zod.
  const raw = {
    name: str(formData.get('name')) ?? '',
    email: str(formData.get('email')),
    phone: str(formData.get('phone'))?.replace(/[\s\-().]/g, ''),
    organization: str(formData.get('organization')),
    message: str(formData.get('message')),
    preferred_channel: str(formData.get('preferred_channel')) ?? 'whatsapp',
    segment_id: str(formData.get('segment_id')) ?? null,
    package_id: str(formData.get('package_id')) ?? null,
    segment_name: str(formData.get('segment_name')) ?? null,
    package_name: str(formData.get('package_name')) ?? null,
    consent: str(formData.get('consent')),
  }

  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? 'Data tidak valid'
    return { status: 'error', message: firstIssue }
  }

  const data = parsed.data

  // 3. Rate limit — short, non-reversible client identifier.
  const ipHash = await getClientIpHash()

  const { allowed } = checkRateLimit(ipHash)
  if (!allowed) {
    return {
      status: 'error',
      message: 'Terlalu banyak permintaan. Silakan coba lagi dalam 1 jam.',
    }
  }

  // 4. Insert via service-role. Anon client has zero access to leads (invariant).
  const supabase = createAdminClient()
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      organization: data.organization ?? null,
      message: data.message ?? null,
      preferred_channel: data.preferred_channel,
      segment_id: data.segment_id ?? null,
      package_id: data.package_id ?? null,
      segment_name: data.segment_name ?? null,
      package_name: data.package_name ?? null,
      ip_hash: ipHash,
      source: 'web',
    })
    .select(
      'id, name, organization, email, phone, message, segment_name, package_name, preferred_channel, created_at'
    )
    .single()

  if (error || !lead) {
    console.error('[leads] Insert failed:', error?.message)
    return { status: 'error', message: 'Gagal menyimpan pesan. Silakan coba lagi.' }
  }

  // 5. Consent evidence (UU PDP No. 27/2022). Written to dedicated columns by
  //    migration 20261113000001. Until that migration is applied the update
  //    fails, so fall back to admin_notes rather than dropping the evidence.
  const consentAt = new Date().toISOString()
  const { error: consentError } = await supabase
    .from('leads')
    .update({ consent_at: consentAt, consent_version: CONSENT_VERSION })
    .eq('id', lead.id)

  if (consentError) {
    console.warn(
      '[leads] consent columns unavailable, storing evidence in admin_notes:',
      consentError.message
    )
    await supabase
      .from('leads')
      .update({
        admin_notes: `Persetujuan Kebijakan Privasi diterima pada ${consentAt}.`,
      })
      .eq('id', lead.id)
  }

  // 6. Fail-soft notifications in parallel.
  //    Insert is NOT rolled back if these fail.
  await Promise.allSettled([
    sendLeadEmail(lead),
    sendLeadWhatsApp(lead),
  ])

  return {
    status: 'success',
    message: 'Terima kasih! Tim kami akan menghubungi Anda segera.',
  }
}
