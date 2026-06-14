export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MessageSquare, RefreshCw } from 'lucide-react'
import { LeadStatusBadge } from '@/components/admin/LeadStatusBadge'
import { StatusUpdateForm } from './StatusUpdateForm'
import { NoteForm } from './NoteForm'
import { getLeadWithActivities } from '@/lib/queries/leads'
import type { LeadStatus } from '@/lib/leads-config'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{value}</dd>
    </div>
  )
}

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  form: 'Formulir',
}

const ACTION_ICON: Record<string, typeof MessageSquare> = {
  note: MessageSquare,
  status_changed: RefreshCw,
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { lead, activities } = await getLeadWithActivities(id)

  if (!lead) notFound()

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/leads"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="size-4" />
          Kembali ke Leads
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{lead.name}</h1>
          {lead.organization && (
            <p className="text-sm text-slate-500">{lead.organization}</p>
          )}
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lead info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Informasi Lead</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailRow label="Nama Lengkap" value={lead.name} />
              <DetailRow label="Organisasi" value={lead.organization} />
              <DetailRow label="Email" value={lead.email} />
              <DetailRow label="Telepon" value={lead.phone} />
              <DetailRow label="Segmen" value={lead.segment_name} />
              <DetailRow label="Paket" value={lead.package_name} />
              <DetailRow
                label="Channel Preferensi"
                value={CHANNEL_LABEL[lead.preferred_channel] ?? lead.preferred_channel}
              />
              <DetailRow
                label="Diterima"
                value={formatDate(lead.created_at)}
              />
              {lead.message && (
                <div className="col-span-2">
                  <dt className="text-xs font-medium text-slate-500">Pesan</dt>
                  <dd className="mt-0.5 text-sm text-slate-900 whitespace-pre-wrap">{lead.message}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Activity timeline */}
          <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Aktivitas</h2>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada aktivitas.</p>
            ) : (
              <ol className="relative border-l border-slate-200 space-y-5 pl-5">
                {activities.map((activity) => {
                  const Icon = ACTION_ICON[activity.action] ?? MessageSquare
                  return (
                    <li key={activity.id} className="relative">
                      <span className="absolute -left-[1.45rem] flex size-6 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white">
                        <Icon className="size-3 text-slate-500" />
                      </span>
                      <div>
                        <p className="text-xs text-slate-400">{formatDate(activity.created_at)}</p>
                        {activity.profiles?.full_name && (
                          <p className="text-xs font-medium text-slate-600">
                            {activity.profiles.full_name}
                          </p>
                        )}
                        {activity.note && (
                          <p className="mt-0.5 text-sm text-slate-800 whitespace-pre-wrap">{activity.note}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Ubah Status</h2>
            <StatusUpdateForm leadId={lead.id} currentStatus={lead.status as LeadStatus} />
          </div>

          <div className="rounded-xl bg-white ring-1 ring-slate-200 p-5">
            <NoteForm leadId={lead.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
