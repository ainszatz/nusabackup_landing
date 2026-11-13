import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { LEAD_STATUSES } from '@/lib/leads-config'
import type { LeadStatus } from '@/lib/leads-config'

export type { LeadStatus, LeadChannel } from '@/lib/leads-config'
export { LEAD_STATUSES }

export type LeadRow = Database['public']['Tables']['leads']['Row']
export type ActivityRow = Database['public']['Tables']['lead_activities']['Row'] & {
  profiles: { full_name: string | null } | null
}

export async function getLeadStatusSummary(): Promise<Partial<Record<LeadStatus, number>>> {
  const supabase = await createClient()
  // One HEAD count per status instead of loading every lead row into memory.
  const entries = await Promise.all(
    LEAD_STATUSES.map(async ({ value }) => {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', value)
      return [value, count ?? 0] as const
    })
  )
  return Object.fromEntries(entries) as Partial<Record<LeadStatus, number>>
}

export async function getRecentLeads(limit = 10) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leads')
    .select('id, name, organization, package_name, segment_name, status, preferred_channel, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export type LeadsPageResult = {
  rows: Array<{
    id: string
    name: string
    organization: string | null
    email: string | null
    phone: string | null
    package_name: string | null
    segment_name: string | null
    status: LeadStatus
    preferred_channel: string
    created_at: string
  }>
  total: number
  page: number
  pageSize: number
  pageCount: number
}

export async function getLeadsFiltered({
  status,
  q,
  page = 1,
  pageSize = 25,
}: {
  status?: string
  q?: string
  page?: number
  pageSize?: number
}): Promise<LeadsPageResult> {
  const supabase = await createClient()
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const from = (safePage - 1) * pageSize

  let query = supabase
    .from('leads')
    .select(
      'id, name, organization, email, phone, package_name, segment_name, status, preferred_channel, created_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })

  if (status && status !== 'semua') {
    query = query.eq('status', status as LeadStatus)
  }
  if (q && q.trim().length > 0) {
    // Escape PostgREST metacharacters to prevent filter injection
    const safe = q.trim().replace(/[%_\\,()*]/g, (c) => `\\${c}`)
    query = query.or(`name.ilike.%${safe}%,organization.ilike.%${safe}%`)
  }

  const { data, count } = await query.range(from, from + pageSize - 1)

  const total = count ?? data?.length ?? 0
  return {
    rows: (data ?? []) as LeadsPageResult['rows'],
    total,
    page: safePage,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getLeadWithActivities(id: string) {
  const supabase = await createClient()
  const [leadRes, activitiesRes] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase
      .from('lead_activities')
      .select('*, profiles(full_name)')
      .eq('lead_id', id)
      .order('created_at', { ascending: false }),
  ])
  return {
    lead: leadRes.data,
    activities: (activitiesRes.data ?? []) as ActivityRow[],
  }
}
