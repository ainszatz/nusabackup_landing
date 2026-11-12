'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Layers, Package, Settings } from 'lucide-react'
import { LogoutButton } from './LogoutButton'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'Leads', icon: Users, exact: false },
  { href: '/admin/segments', label: 'Segmen', icon: Layers, exact: false },
  { href: '/admin/packages', label: 'Paket', icon: Package, exact: false },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings, exact: false },
]

export function AdminSidebar({ userName }: { userName: string | null }) {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <aside className="flex w-full shrink-0 flex-col bg-navy-900 text-white md:w-56">
      <div className="flex items-center justify-between border-b border-navy-800 px-4 py-3 md:py-4">
        <div className="flex items-center">
          <span className="text-sm font-bold tracking-wide text-white">NusaBackup</span>
          <span className="ml-1.5 rounded bg-navy-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
            Admin
          </span>
        </div>
        <div className="md:hidden">
          <LogoutButton />
        </div>
      </div>

      <nav
        aria-label="Navigasi admin"
        className="flex gap-1 overflow-x-auto p-2 md:flex-1 md:flex-col md:space-y-0.5 md:overflow-visible"
      >
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm transition-colors ${
                active
                  ? 'bg-navy-700 font-medium text-white'
                  : 'text-slate-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="hidden border-t border-navy-800 p-2 md:block">
        {userName && (
          <p className="mb-1 truncate px-3 py-1 text-xs text-slate-400">{userName}</p>
        )}
        <LogoutButton />
      </div>
    </aside>
  )
}
