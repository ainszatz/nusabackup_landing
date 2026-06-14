'use client'

import { useActionState, useState } from 'react'
import { updateLeadStatus } from '@/actions/leads'
import { Button } from '@/components/ui/button'
import { LEAD_STATUSES } from '@/lib/leads-config'
import type { LeadStatus } from '@/lib/leads-config'

export function StatusUpdateForm({
  leadId,
  currentStatus,
}: {
  leadId: string
  currentStatus: LeadStatus
}) {
  const [selected, setSelected] = useState<string>(currentStatus)
  const [state, action, pending] = useActionState(updateLeadStatus, null)

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="newStatus" value={selected} />

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {state?.status === 'error' && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      {state?.status === 'success' && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full" size="sm">
        {pending ? 'Memperbarui...' : 'Perbarui Status'}
      </Button>
    </form>
  )
}
