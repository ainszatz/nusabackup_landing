export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge'
import { LeadFilterForm } from './LeadFilterForm'
import { getLeadsFiltered } from '@/lib/queries/leads'

export const metadata: Metadata = { title: 'Leads' }

const PAGE_SIZE = 25

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
  const requestedPage = Number.parseInt(params.page ?? '1', 10)

  const {
    rows: leads,
    total,
    page,
    pageCount,
  } = await getLeadsFiltered({
    status,
    q,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
    pageSize: PAGE_SIZE,
  })

  const hrefFor = (target: number) => {
    const sp = new URLSearchParams()
    if (status && status !== 'semua') sp.set('status', status)
    if (q.trim()) sp.set('q', q.trim())
    if (target > 1) sp.set('page', String(target))
    const qs = sp.toString()
    return `/admin/leads${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">{total} lead ditemukan</p>
        </div>
        <LeadFilterForm currentStatus={status} currentQ={q} />
      </div>

      <div className="rounded-xl bg-white ring-1 ring-slate-200 overflow-hidden">
        <Table aria-label="Daftar lead">
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
                <TableCell colSpan={6} className="text-center text-slate-500 py-12">
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

      {pageCount > 1 && (
        <nav
          aria-label="Navigasi halaman lead"
          className="flex flex-wrap items-center justify-between gap-3 text-sm"
        >
          <p className="text-slate-500">
            Halaman {page} dari {pageCount} · {PAGE_SIZE} per halaman
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={hrefFor(page - 1)}
                rel="prev"
                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:border-slate-300 hover:text-navy-900 transition-colors"
              >
                <ChevronLeft className="size-4" aria-hidden /> Sebelumnya
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-100 px-3 text-slate-400"
              >
                <ChevronLeft className="size-4" aria-hidden /> Sebelumnya
              </span>
            )}
            {page < pageCount ? (
              <Link
                href={hrefFor(page + 1)}
                rel="next"
                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:border-slate-300 hover:text-navy-900 transition-colors"
              >
                Berikutnya <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-100 px-3 text-slate-400"
              >
                Berikutnya <ChevronRight className="size-4" aria-hidden />
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
