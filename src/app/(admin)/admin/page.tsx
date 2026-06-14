export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge'
import { getLeadStatusSummary, getRecentLeads } from '@/lib/queries/leads'
import { LEAD_STATUSES } from '@/lib/leads-config'
import type { LeadStatus } from '@/lib/leads-config'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default async function DashboardPage() {
  const [summary, recentLeads] = await Promise.all([
    getLeadStatusSummary(),
    getRecentLeads(10),
  ])

  const totalLeads = Object.values(summary).reduce((a, b) => (a ?? 0) + (b ?? 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Ringkasan aktivitas lead</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-xs text-slate-500 font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{totalLeads}</p>
          </CardContent>
        </Card>
        {LEAD_STATUSES.map(({ value, label }) => (
          <Card size="sm" key={value}>
            <CardHeader>
              <CardTitle className="text-xs text-slate-500 font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{summary[value as LeadStatus] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Lead Terbaru</h2>
          <Link href="/admin/leads" className="text-sm text-brand-600 hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="rounded-xl bg-white ring-1 ring-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Organisasi</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                    Belum ada lead
                  </TableCell>
                </TableRow>
              )}
              {recentLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-medium text-slate-900 hover:text-brand-600"
                    >
                      {lead.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-600">{lead.organization ?? '—'}</TableCell>
                  <TableCell className="text-slate-600">{lead.package_name ?? '—'}</TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {formatDate(lead.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
