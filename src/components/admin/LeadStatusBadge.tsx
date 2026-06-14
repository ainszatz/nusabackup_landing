import { LEAD_STATUSES } from '@/lib/leads-config'
import type { LeadStatus } from '@/lib/leads-config'

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const found = LEAD_STATUSES.find((s) => s.value === status)
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${found?.color ?? 'bg-gray-100 text-gray-700'}`}
    >
      {found?.label ?? status}
    </span>
  )
}
