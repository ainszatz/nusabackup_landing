'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LEAD_STATUSES } from '@/lib/leads-config'
import { Search } from 'lucide-react'

export function LeadFilterForm({
  currentStatus,
  currentQ,
}: {
  currentStatus: string
  currentQ: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const status = fd.get('status') as string
    const q = fd.get('q') as string
    const params = new URLSearchParams()
    if (status && status !== 'semua') params.set('status', status)
    if (q.trim()) params.set('q', q.trim())
    startTransition(() => {
      router.push(`/admin/leads${params.size > 0 ? `?${params}` : ''}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <select
        name="status"
        defaultValue={currentStatus || 'semua'}
        className="h-8 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
      >
        <option value="semua">Semua Status</option>
        {LEAD_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={currentQ}
          placeholder="Cari nama / organisasi..."
          className="pl-7 w-52"
        />
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Mencari...' : 'Cari'}
      </Button>

      {(currentStatus || currentQ) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => startTransition(() => router.push('/admin/leads'))}
        >
          Reset
        </Button>
      )}
    </form>
  )
}
