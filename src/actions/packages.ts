'use server'

import { revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyStaff } from '@/lib/server/verify-staff'
import { packageSchema, featuresArraySchema } from '@/lib/validations/package'
import { uploadIcon, deleteIcon } from './assets'
import type { AdminActionState } from './leads'

function str(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === 'string' ? v.trim() : ''
  return s === '' ? undefined : s
}

export async function upsertPackage(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const parsed = packageSchema.safeParse({
    id: str(formData.get('id')),
    segment_id: str(formData.get('segment_id')) ?? '',
    slug: str(formData.get('slug')) ?? '',
    name: str(formData.get('name')) ?? '',
    description: str(formData.get('description')),
    badge_label: str(formData.get('badge_label')),
    is_featured: formData.get('is_featured') ?? 'false',
    is_active: formData.get('is_active') ?? 'true',
    sort_order: formData.get('sort_order') ?? '0',
    price_prefix: str(formData.get('price_prefix')),
    price_amount: str(formData.get('price_amount')) ?? null,
    price_period: str(formData.get('price_period')),
    currency: str(formData.get('currency')),
  })

  if (!parsed.success)
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const featuresRaw = str(formData.get('features'))
  let features: { id?: string; label: string; is_included: boolean; sort_order: number }[] = []
  if (featuresRaw) {
    const featParsed = featuresArraySchema.safeParse(JSON.parse(featuresRaw))
    if (!featParsed.success)
      return { status: 'error', message: 'Data fitur tidak valid.' }
    features = featParsed.data
  }

  const data = parsed.data
  let iconUrl: string | null = str(formData.get('existing_icon')) ?? null
  const iconFile = formData.get('icon') as File | null

  if (iconFile && iconFile.size > 0) {
    const result = await uploadIcon(iconFile)
    if ('error' in result) return { status: 'error', message: result.error }
    iconUrl = result.url
  }

  const supabase = createAdminClient()
  const payload = {
    segment_id: data.segment_id,
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    badge_label: data.badge_label ?? null,
    is_featured: data.is_featured,
    is_active: data.is_active,
    sort_order: data.sort_order,
    price_prefix: data.price_prefix ?? null,
    price_amount: data.price_amount ?? null,
    price_period: data.price_period ?? null,
    currency: data.currency ?? null,
    icon: iconUrl,
  }

  let packageId = data.id
  if (packageId) {
    const { error } = await supabase.from('packages').update(payload).eq('id', packageId)
    if (error) return { status: 'error', message: error.message }
  } else {
    const { data: newPkg, error } = await supabase
      .from('packages')
      .insert(payload)
      .select('id')
      .single()
    if (error || !newPkg) return { status: 'error', message: error?.message ?? 'Gagal menyimpan paket.' }
    packageId = newPkg.id
  }

  // Replace all features for this package
  await supabase.from('package_features').delete().eq('package_id', packageId)
  if (features.length > 0) {
    const { error: featError } = await supabase.from('package_features').insert(
      features.map((f, i) => ({
        package_id: packageId!,
        label: f.label,
        is_included: f.is_included,
        sort_order: f.sort_order ?? i,
      }))
    )
    if (featError) return { status: 'error', message: featError.message }
  }

  revalidateTag('packages', 'default')
  return {
    status: 'success',
    message: `Paket berhasil ${data.id ? 'diperbarui' : 'ditambahkan'}.`,
  }
}

export async function deletePackage(id: string): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const supabase = createAdminClient()
  const { data: pkg } = await supabase
    .from('packages')
    .select('icon')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('packages').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  if (pkg?.icon) await deleteIcon(pkg.icon)

  revalidateTag('packages', 'default')
  return { status: 'success', message: 'Paket berhasil dihapus.' }
}

export async function upsertFeature(
  packageId: string,
  feature: { id?: string; label: string; is_included: boolean; sort_order: number }
): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const supabase = createAdminClient()
  const payload = {
    package_id: packageId,
    label: feature.label,
    is_included: feature.is_included,
    sort_order: feature.sort_order,
  }
  const { error } = feature.id
    ? await supabase.from('package_features').update(payload).eq('id', feature.id)
    : await supabase.from('package_features').insert(payload)

  if (error) return { status: 'error', message: error.message }

  revalidateTag('packages', 'default')
  return { status: 'success', message: 'Fitur berhasil disimpan.' }
}

export async function deleteFeature(id: string): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('package_features').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  revalidateTag('packages', 'default')
  return { status: 'success', message: 'Fitur berhasil dihapus.' }
}

export async function togglePackageActive(
  id: string,
  is_active: boolean
): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Anda tidak memiliki akses.' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('packages').update({ is_active }).eq('id', id)
  if (error) return { status: 'error', message: error.message }

  revalidateTag('packages', 'default')
  return { status: 'success', message: '' }
}

