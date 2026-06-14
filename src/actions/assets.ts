'use server'
import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { verifyStaff } from '@/lib/server/verify-staff'

// SVG excluded: no server-side sanitizer available; serving user-supplied SVG from a
// public origin is a stored-XSS vector (inline <script> / event handlers execute).
const ALLOWED_TYPES = new Set(['image/png', 'image/webp', 'image/jpeg'])
const MAX_SIZE = 500 * 1024

// Derive extension from the validated MIME type — never trust file.name.
const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
}

export async function uploadIcon(
  file: File
): Promise<{ url: string } | { error: string }> {
  const staff = await verifyStaff()
  if (!staff) return { error: 'Tidak diizinkan.' }

  if (!ALLOWED_TYPES.has(file.type))
    return { error: 'Format tidak didukung. Gunakan PNG, WEBP, atau JPEG.' }
  if (file.size > MAX_SIZE)
    return { error: 'Ukuran file maksimal 500KB.' }

  const ext = MIME_TO_EXT[file.type]!
  // Use a server-controlled content-type constant, never the user-supplied file.type.
  const contentType = file.type as 'image/png' | 'image/webp' | 'image/jpeg'
  const path = `icons/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes = await file.arrayBuffer()

  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from('assets')
    .upload(path, bytes, { contentType, upsert: false })
  if (error) return { error: error.message }

  const { data } = supabase.storage.from('assets').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function deleteIcon(url: string): Promise<void> {
  const staff = await verifyStaff()
  if (!staff) return

  if (!url) return
  const match = url.match(/\/storage\/v1\/object\/public\/assets\/(.+)$/)
  if (!match?.[1]) return
  const supabase = createAdminClient()
  await supabase.storage.from('assets').remove([match[1]])
}
