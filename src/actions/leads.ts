'use server'

import { headers } from 'next/headers'
import { createHash } from 'crypto'
import { leadSchema } from '@/lib/validations/lead'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rateLimit'
import { sendLeadEmail } from '@/lib/notifications/email'
import { sendLeadWhatsApp } from '@/lib/notifications/whatsapp'

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
  //    Return fake success to avoid tipping off bots.
  const honeypot = formData.get('website')
  if (honeypot !== '') {
    return { status: 'success', message: 'Terima kasih, pesan Anda telah dikirim.' }
  }

  // 2. Build typed object then validate with Zod.
  const raw = {
    name: str(formData.get('name')) ?? '',
    email: str(formData.get('email')),
    phone: str(formData.get('phone')),
    organization: str(formData.get('organization')),
    message: str(formData.get('message')),
    preferred_channel: str(formData.get('preferred_channel')) ?? 'whatsapp',
    segment_id: str(formData.get('segment_id')) ?? null,
    package_id: str(formData.get('package_id')) ?? null,
    segment_name: str(formData.get('segment_name')) ?? null,
    package_name: str(formData.get('package_name')) ?? null,
  }

  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? 'Data tidak valid'
    return { status: 'error', message: firstIssue }
  }

  const data = parsed.data

  // 3. Rate limit — IP hash from Cloudflare Tunnel header.
  const headersList = await headers()
  const rawIp =
    headersList.get('CF-Connecting-IP') ??
    headersList.get('x-forwarded-for') ??
    '127.0.0.1'
  const ip = rawIp.split(',')[0].trim()
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16)

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

  // 5. Fail-soft notifications in parallel.
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
