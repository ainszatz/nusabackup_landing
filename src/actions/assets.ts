'use server'
import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_TYPES = new Set(['image/svg+xml', 'image/png', 'image/webp', 'image/jpeg'])
const MAX_SIZE = 500 * 1024

export async function uploadIcon(
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_TYPES.has(file.type))
    return { error: 'Format tidak didukung. Gunakan SVG, PNG, WEBP, atau JPEG.' }
  if (file.size > MAX_SIZE)
    return { error: 'Ukuran file maksimal 500KB.' }

  const ext = (file.name.split('.').pop() ?? 'png').toLowerCase()
  const path = `icons/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes = await file.arrayBuffer()

  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from('assets')
    .upload(path, bytes, { contentType: file.type, upsert: false })
  if (error) return { error: error.message }

  const { data } = supabase.storage.from('assets').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function deleteIcon(url: string): Promise<void> {
  if (!url) return
  const match = url.match(/\/storage\/v1\/object\/public\/assets\/(.+)$/)
  if (!match?.[1]) return
  const supabase = createAdminClient()
  await supabase.storage.from('assets').remove([match[1]])
}
