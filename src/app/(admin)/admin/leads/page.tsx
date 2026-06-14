export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge'
import { LeadFilterForm } from './LeadFilterForm'
import { getLeadsFiltered } from '@/lib/queries/leads'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const status = params.status ?? ''
  const q = params.q ?? ''

  const leads = await getLeadsFiltered({ status, q })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">{leads.length} lead ditemukan</p>
        </div>
        <LeadFilterForm currentStatus={status} currentQ={q} />
      </div>

      <div className="rounded-xl bg-white ring-1 ring-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Organisasi</TableHead>
              <TableHead>Email / Telepon</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-12">
                  Tidak ada lead ditemukan
                </TableCell>
              </TableRow>
            )}
            {leads.map((lead) => (
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
                <TableCell className="text-slate-500 text-xs">
                  {lead.email && <div>{lead.email}</div>}
                  {lead.phone && <div>{lead.phone}</div>}
                  {!lead.email && !lead.phone && '—'}
                </TableCell>
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
  )
}
