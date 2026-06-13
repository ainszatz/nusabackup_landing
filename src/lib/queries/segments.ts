import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { Segment } from '@/types'

function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const getActiveSegments = unstable_cache(
  async (): Promise<Segment[]> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('segments')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw new Error(error.message)
    return data ?? []
  },
  ['active-segments'],
  { tags: ['segments'] }
)

export const getSegmentBySlug = unstable_cache(
  async (slug: string): Promise<Segment | null> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('segments')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    if (error) return null
    return data
  },
  ['segment-by-slug'],
  { tags: ['segments'] }
)
