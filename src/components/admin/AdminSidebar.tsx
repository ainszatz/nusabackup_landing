import Link from 'next/link'
import { LayoutDashboard, Users, Settings } from 'lucide-react'
import { LogoutButton } from './LogoutButton'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings, disabled: true },
]

export function AdminSidebar({ userName }: { userName: string | null }) {
  return (
    <aside className="flex w-56 shrink-0 flex-col bg-navy-900 text-white">
      <div className="border-b border-navy-800 px-4 py-4">
        <span className="text-sm font-bold tracking-wide text-white">NusaBackup</span>
        <span className="ml-1.5 rounded bg-navy-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {NAV.map(({ href, label, icon: Icon, disabled }) =>
          disabled ? (
            <span
              key={href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
            >
              <Icon className="size-4" />
              {label}
            </span>
          ) : (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-navy-800 hover:text-white transition-colors"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          )
        )}
      </nav>

      <div className="border-t border-navy-800 p-2">
        {userName && (
          <p className="mb-1 truncate px-3 py-1 text-xs text-slate-500">{userName}</p>
        )}
        <LogoutButton />
      </div>
    </aside>
  )
}
