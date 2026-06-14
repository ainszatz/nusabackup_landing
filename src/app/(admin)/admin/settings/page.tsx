export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './SettingsForm'
import type { PublicSettings } from '@/types'

async function getAdminSettings(): Promise<PublicSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('site_settings').select('key, value')
  if (error) throw new Error(error.message)
  const out: PublicSettings = {}
  for (const row of data ?? []) {
    out[row.key] = typeof row.value === 'string' ? row.value : String(row.value ?? '')
  }
  return out
}

export default async function SettingsPage() {
  const settings = await getAdminSettings()

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Informasi kontak publik, notifikasi admin, dan metadata default situs.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}
