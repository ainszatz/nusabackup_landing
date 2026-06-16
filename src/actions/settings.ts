'use server'
import 'server-only'

import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyStaff } from '@/lib/server/verify-staff'
import { settingsSchema } from '@/lib/validations/settings'
import type { AdminActionState } from './leads'

const IS_PUBLIC: Record<string, boolean> = {
  wa_number: true,
  email: true,
  address: true,
  social_instagram: true,
  social_linkedin: true,
  meta_title: false,
  meta_description: false,
  admin_notify_email: false,
  admin_notify_wa: false,
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : ''
}

export async function updateSettings(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const parsed = settingsSchema.safeParse({
    wa_number: str(formData.get('wa_number')),
    email: str(formData.get('email')),
    address: str(formData.get('address')),
    social_instagram: str(formData.get('social_instagram')),
    social_linkedin: str(formData.get('social_linkedin')),
    meta_title: str(formData.get('meta_title')),
    meta_description: str(formData.get('meta_description')),
    admin_notify_email: str(formData.get('admin_notify_email')),
    admin_notify_wa: str(formData.get('admin_notify_wa')),
  })

  if (!parsed.success)
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const supabase = createAdminClient()

  for (const [key, value] of Object.entries(parsed.data)) {
    const { error } = await supabase.from('site_settings').upsert(
      { key, value: value ?? '', is_public: IS_PUBLIC[key] ?? false },
      { onConflict: 'key' }
    )
    if (error) return { status: 'error', message: error.message }
  }

  revalidateTag('settings')
  return { status: 'success', message: 'Pengaturan berhasil disimpan.' }
}
