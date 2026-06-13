import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { PackageWithDetails } from '@/types'

function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const PACKAGE_SELECT = `
  *,
  segment:segments(id, slug, name),
  features:package_features(id, label, is_included, sort_order)
` as const

export const getFeaturedPackages = unstable_cache(
  async (): Promise<PackageWithDetails[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('packages')
      .select(PACKAGE_SELECT)
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw new Error(error.message)
    return (data ?? []) as PackageWithDetails[]
  },
  ['featured-packages'],
  { tags: ['packages'] }
)

export const getPackagesBySegment = unstable_cache(
  async (segmentSlug: string): Promise<PackageWithDetails[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('packages')
      .select(PACKAGE_SELECT)
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw new Error(error.message)
    const all = (data ?? []) as PackageWithDetails[]
    return all.filter((p) => p.segment?.slug === segmentSlug)
  },
  ['packages-by-segment'],
  { tags: ['packages'] }
)

export const getAllActivePackages = unstable_cache(
  async (): Promise<PackageWithDetails[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('packages')
      .select(PACKAGE_SELECT)
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw new Error(error.message)
    return (data ?? []) as PackageWithDetails[]
  },
  ['all-active-packages'],
  { tags: ['packages'] }
)

export const getPackageBySlug = unstable_cache(
  async (segmentSlug: string, packageSlug: string): Promise<PackageWithDetails | null> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('packages')
      .select(PACKAGE_SELECT)
      .eq('slug', packageSlug)
      .eq('is_active', true)
      .single()
    if (error) return null
    const pkg = data as PackageWithDetails
    if (pkg.segment?.slug !== segmentSlug) return null
    return pkg
  },
  ['package-by-slug'],
  { tags: ['packages'] }
)
