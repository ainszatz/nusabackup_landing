'use server'

import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyStaff } from '@/lib/server/verify-staff'
import { segmentSchema } from '@/lib/validations/segment'
import { uploadIcon, deleteIcon } from './assets'
import type { AdminActionState } from './leads'

function str(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === 'string' ? v.trim() : ''
  return s === '' ? undefined : s
}

export async function upsertSegment(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const parsed = segmentSchema.safeParse({
    id: str(formData.get('id')),
    slug: str(formData.get('slug')) ?? '',
    name: str(formData.get('name')) ?? '',
    tagline: str(formData.get('tagline')),
    description: str(formData.get('description')),
    hero_headline: str(formData.get('hero_headline')),
    hero_subheadline: str(formData.get('hero_subheadline')),
    meta_title: str(formData.get('meta_title')),
    meta_description: str(formData.get('meta_description')),
    sort_order: formData.get('sort_order') ?? '0',
    is_active: formData.get('is_active') ?? 'true',
  })

  if (!parsed.success)
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const data = parsed.data
  let iconUrl: string | null = (str(formData.get('existing_icon')) as string) ?? null
  const iconFile = formData.get('icon') as File | null

  if (iconFile && iconFile.size > 0) {
    const result = await uploadIcon(iconFile)
    if ('error' in result) return { status: 'error', message: result.error }
    iconUrl = result.url
  }

  const supabase = createAdminClient()
  const payload = {
    slug: data.slug,
    name: data.name,
    tagline: data.tagline ?? null,
    description: data.description ?? null,
    hero_headline: data.hero_headline ?? null,
    hero_subheadline: data.hero_subheadline ?? null,
    meta_title: data.meta_title ?? null,
    meta_description: data.meta_description ?? null,
    sort_order: data.sort_order,
    is_active: data.is_active,
    icon: iconUrl,
  }

  const { error } = data.id
    ? await supabase.from('segments').update(payload).eq('id', data.id)
    : await supabase.from('segments').insert(payload)

  if (error) return { status: 'error', message: error.message }

  revalidateTag('segments')
  return {
    status: 'success',
    message: `Segmen berhasil ${data.id ? 'diperbarui' : 'ditambahkan'}.`,
  }
}

export async function deleteSegment(id: string): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const supabase = createAdminClient()
  const { data: seg } = await supabase
    .from('segments')
    .select('icon')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('segments').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  if (seg?.icon) await deleteIcon(seg.icon)

  revalidateTag('segments')
  return { status: 'success', message: 'Segmen berhasil dihapus.' }
}

export async function toggleSegmentActive(
  id: string,
  is_active: boolean
): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('segments')
    .update({ is_active })
    .eq('id', id)
  if (error) return { status: 'error', message: error.message }

  revalidateTag('segments')
  return { status: 'success', message: '' }
}

