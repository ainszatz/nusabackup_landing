'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkLoginRateLimit } from '@/lib/rateLimit'
import { getClientIpHash } from '@/lib/request-ip'

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) return 'Email dan password wajib diisi.'

  const ipHash = await getClientIpHash()
  if (!checkLoginRateLimit(ipHash).allowed) {
    return 'Terlalu banyak percobaan masuk. Silakan coba lagi dalam 15 menit.'
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return 'Email atau password salah.'

  redirect('/admin')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
