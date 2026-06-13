import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { PublicSettings } from '@/types'

function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const getPublicSettings = unstable_cache(
  async (): Promise<PublicSettings> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('is_public', true)
    if (error) throw new Error(error.message)
    const settings: PublicSettings = {}
    for (const row of data ?? []) {
      // jsonb values come back as parsed JS values; stringify non-strings
      settings[row.key] =
        typeof row.value === 'string' ? row.value : String(row.value)
    }
    return settings
  },
  ['public-settings'],
  { tags: ['settings'] }
)

export const getAllSettings = unstable_cache(
  async (): Promise<PublicSettings> => {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
    if (error) throw new Error(error.message)
    const settings: PublicSettings = {}
    for (const row of data ?? []) {
      settings[row.key] =
        typeof row.value === 'string' ? row.value : String(row.value)
    }
    return settings
  },
  ['all-settings'],
  { tags: ['settings'] }
)
