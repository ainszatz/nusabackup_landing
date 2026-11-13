export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { LogoutButton } from '@/components/admin/LogoutButton'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin NusaBackup' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <>{children}</>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
        <div>
          <p className="text-4xl font-bold text-slate-300">403</p>
          <p className="mt-2 text-slate-600">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton />
          <Link
            href="/"
            className="text-sm font-medium text-brand-700 hover:underline underline-offset-2"
          >
            Kembali ke situs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <AdminSidebar userName={profile.full_name} />
      <main id="main-content" className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
