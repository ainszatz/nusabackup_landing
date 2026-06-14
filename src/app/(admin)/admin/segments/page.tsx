export const dynamic = 'force-dynamic'

import Image from 'next/image'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SegmentFormDialog } from './SegmentFormDialog'
import { SegmentDeleteButton } from './SegmentDeleteButton'
import { ActiveToggle } from '@/components/admin/ActiveToggle'
import { getAllSegments } from '@/lib/queries/segments'
import { toggleSegmentActive } from '@/actions/segments'

export default async function SegmentsPage() {
  const segments = await getAllSegments()

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Segmen</h1>
          <p className="text-sm text-slate-500">{segments.length} segmen</p>
        </div>
        <SegmentFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Tambah Segmen
            </Button>
          }
        />
      </div>

      <div className="rounded-xl bg-white ring-1 ring-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Nama / Slug</TableHead>
              <TableHead>Tagline</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400 py-12">
                  Belum ada segmen
                </TableCell>
              </TableRow>
            )}
            {segments.map((seg) => (
              <TableRow key={seg.id}>
                <TableCell>
                  {seg.icon ? (
                    <div className="relative size-8 overflow-hidden rounded-md bg-slate-50 border border-slate-200">
                      <Image
                        src={seg.icon}
                        alt={seg.name}
                        fill
                        className="object-contain p-0.5"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="size-8 rounded-md bg-slate-100" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">{seg.name}</div>
                  <div className="text-xs text-slate-500">{seg.slug}</div>
                </TableCell>
                <TableCell className="text-slate-600 max-w-48 truncate">
                  {seg.tagline ?? '—'}
                </TableCell>
                <TableCell className="text-slate-600">{seg.sort_order}</TableCell>
                <TableCell>
                  <ActiveToggle
                    id={seg.id}
                    isActive={seg.is_active}
                    onToggle={toggleSegmentActive}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <SegmentFormDialog
                      segment={seg}
                      trigger={
                        <Button variant="ghost" size="icon-sm" aria-label="Edit segmen">
                          <Pencil className="size-3.5" />
                        </Button>
                      }
                    />
                    <SegmentDeleteButton id={seg.id} name={seg.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
