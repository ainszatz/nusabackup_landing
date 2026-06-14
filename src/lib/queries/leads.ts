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
  const { data } = await supabase.from('leads').select('status')
  if (!data) return {}
  return data.reduce<Partial<Record<LeadStatus, number>>>((acc, { status }) => {
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {})
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

export async function getLeadsFiltered({ status, q }: { status?: string; q?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('leads')
    .select(
      'id, name, organization, email, phone, package_name, segment_name, status, preferred_channel, created_at'
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

  const { data } = await query
  return data ?? []
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
