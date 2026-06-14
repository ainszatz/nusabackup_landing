'use client'

import { logoutAction } from '@/actions/auth'
import { useTransition } from 'react'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => logoutAction())}
      disabled={pending}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-navy-800 hover:text-white transition-colors disabled:opacity-50"
    >
      <LogOut className="size-4" />
      {pending ? 'Keluar...' : 'Keluar'}
    </button>
  )
}
