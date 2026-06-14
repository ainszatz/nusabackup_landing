export const dynamic = 'force-dynamic'

import Image from 'next/image'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PackageFormDialog } from './PackageFormDialog'
import { PackageDeleteButton } from './PackageDeleteButton'
import { ActiveToggle } from '@/components/admin/ActiveToggle'
import { getAllPackagesGrouped } from '@/lib/queries/packages'
import { getAllSegments } from '@/lib/queries/segments'
import { togglePackageActive } from '@/actions/packages'

function formatPrice(pkg: {
  price_prefix?: string | null
  price_amount?: number | null
  price_period?: string | null
  currency?: string | null
}) {
  if (!pkg.price_amount) return '—'
  const amount = new Intl.NumberFormat('id-ID').format(pkg.price_amount)
  const parts = [
    pkg.price_prefix,
    `${pkg.currency ?? 'IDR'} ${amount}`,
    pkg.price_period,
  ].filter(Boolean)
  return parts.join(' ')
}

export default async function PackagesPage() {
  const [grouped, allSegments] = await Promise.all([
    getAllPackagesGrouped(),
    getAllSegments(),
  ])

  const totalPackages = grouped.reduce((sum, s) => sum + s.packages.length, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Paket</h1>
          <p className="text-sm text-slate-500">{totalPackages} paket di {grouped.length} segmen</p>
        </div>
        <PackageFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Tambah Paket
            </Button>
          }
          segments={allSegments}
        />
      </div>

      {grouped.map((seg) => (
        <div key={seg.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              {seg.name}
            </h2>
            <PackageFormDialog
              trigger={
                <Button variant="outline" size="sm">
                  <Plus className="size-4" />
                  Paket di {seg.name}
                </Button>
              }
              segments={allSegments}
              defaultSegmentId={seg.id}
            />
          </div>

          <div className="rounded-xl bg-white ring-1 ring-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Nama / Slug</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Fitur</TableHead>
                  <TableHead>Unggulan</TableHead>
                  <TableHead>Urutan</TableHead>
                  <TableHead>Aktif</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seg.packages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                      Belum ada paket di segmen ini
                    </TableCell>
                  </TableRow>
                )}
                {seg.packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      {pkg.icon ? (
                        <div className="relative size-8 overflow-hidden rounded-md bg-slate-50 border border-slate-200">
                          <Image
                            src={pkg.icon}
                            alt={pkg.name}
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
                      <div className="font-medium text-slate-900">{pkg.name}</div>
                      <div className="text-xs text-slate-500">{pkg.slug}</div>
                      {pkg.badge_label && (
                        <span className="inline-block mt-0.5 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-medium text-gold-600">
                          {pkg.badge_label}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {formatPrice(pkg)}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {pkg.features?.length ?? 0} fitur
                    </TableCell>
                    <TableCell>
                      {pkg.is_featured ? (
                        <span className="text-xs font-medium text-gold-600">✓</span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">{pkg.sort_order}</TableCell>
                    <TableCell>
                      <ActiveToggle
                        id={pkg.id}
                        isActive={pkg.is_active}
                        onToggle={togglePackageActive}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <PackageFormDialog
                          pkg={pkg as Parameters<typeof PackageFormDialog>[0]['pkg']}
                          segments={allSegments}
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label="Edit paket">
                              <Pencil className="size-3.5" />
                            </Button>
                          }
                        />
                        <PackageDeleteButton id={pkg.id} name={pkg.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      {grouped.length === 0 && (
        <div className="rounded-xl bg-white ring-1 ring-slate-200 p-12 text-center text-slate-400">
          Belum ada segmen. Tambahkan segmen terlebih dahulu.
        </div>
      )}
    </div>
  )
}
