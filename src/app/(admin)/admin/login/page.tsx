'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { loginAction } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [error, action, pending] = useActionState(loginAction, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy-900">NusaBackup</h1>
          <p className="mt-1 text-sm text-slate-500">Masuk ke panel admin</p>
        </div>

        <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                autoFocus
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-error' : undefined}
                placeholder="admin@nusabackup.id"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-error' : undefined}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                id="login-error"
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-navy-900 transition-colors">
            ← Kembali ke situs
          </Link>
        </p>
      </div>
    </div>
  )
}
