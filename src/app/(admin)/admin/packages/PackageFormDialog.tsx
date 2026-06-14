'use client'

import { startTransition, useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { upsertPackage } from '@/actions/packages'
import type { PackageWithDetails } from '@/types'

interface Segment {
  id: string
  name: string
  slug: string
}

interface LocalFeature {
  _key: string
  id?: string
  label: string
  is_included: boolean
  sort_order: number
}

function makeKey() {
  return Math.random().toString(36).slice(2)
}

interface Props {
  trigger: React.ReactNode
  pkg?: PackageWithDetails
  segments: Segment[]
  defaultSegmentId?: string
}

export function PackageFormDialog({ trigger, pkg, segments, defaultSegmentId }: Props) {
  const [open, setOpen] = useState(false)
  const [iconPreview, setIconPreview] = useState<string | null>(pkg?.icon ?? null)
  const [features, setFeatures] = useState<LocalFeature[]>(() =>
    (pkg?.features ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((f) => ({ _key: makeKey(), id: f.id, label: f.label, is_included: f.is_included, sort_order: f.sort_order }))
  )
  const [newLabel, setNewLabel] = useState('')
  const router = useRouter()
  const [state, action, pending] = useActionState(upsertPackage, null)

  useEffect(() => {
    if (state?.status === 'success') {
      startTransition(() => {
        setOpen(false)
        router.refresh()
      })
    }
  }, [state, router])

  useEffect(() => {
    if (open) {
      startTransition(() => {
        setIconPreview(pkg?.icon ?? null)
        setFeatures(
          (pkg?.features ?? [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((f) => ({ _key: makeKey(), id: f.id, label: f.label, is_included: f.is_included, sort_order: f.sort_order }))
        )
        setNewLabel('')
      })
    }
  }, [open, pkg])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setIconPreview(file ? URL.createObjectURL(file) : (pkg?.icon ?? null))
  }

  function addFeature() {
    if (!newLabel.trim()) return
    setFeatures((prev) => [
      ...prev,
      { _key: makeKey(), label: newLabel.trim(), is_included: true, sort_order: prev.length },
    ])
    setNewLabel('')
  }

  function removeFeature(key: string) {
    setFeatures((prev) => prev.filter((f) => f._key !== key))
  }

  function toggleFeature(key: string) {
    setFeatures((prev) =>
      prev.map((f) => (f._key === key ? { ...f, is_included: !f.is_included } : f))
    )
  }

  function updateFeatureLabel(key: string, label: string) {
    setFeatures((prev) =>
      prev.map((f) => (f._key === key ? { ...f, label } : f))
    )
  }

  function moveFeature(key: string, dir: -1 | 1) {
    setFeatures((prev) => {
      const idx = prev.findIndex((f) => f._key === key)
      if (idx < 0) return prev
      const next = [...prev]
      const swapIdx = idx + dir
      if (swapIdx < 0 || swapIdx >= next.length) return prev
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next.map((f, i) => ({ ...f, sort_order: i }))
    })
  }

  const featuresJson = JSON.stringify(
    features.map((f, i) => ({ id: f.id, label: f.label, is_included: f.is_included, sort_order: i }))
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} style={{ display: 'contents', cursor: 'pointer' }}>
        {trigger}
      </span>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pkg ? 'Edit Paket' : 'Tambah Paket'}</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4 py-1">
          {pkg?.id && <input type="hidden" name="id" value={pkg.id} />}
          {pkg?.icon && <input type="hidden" name="existing_icon" value={pkg.icon} />}
          <input type="hidden" name="features" value={featuresJson} />

          {/* Segment */}
          <div className="space-y-1.5">
            <Label htmlFor="segment_id">Segmen *</Label>
            <select
              id="segment_id"
              name="segment_id"
              defaultValue={pkg?.segment_id ?? defaultSegmentId ?? ''}
              required
              className="h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="">— Pilih Segmen —</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Name + Slug */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-name">Nama *</Label>
              <Input id="pkg-name" name="name" defaultValue={pkg?.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkg-slug">Slug *</Label>
              <Input id="pkg-slug" name="slug" defaultValue={pkg?.slug} required placeholder="contoh-paket" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" defaultValue={pkg?.description ?? ''} rows={2} />
          </div>

          {/* Price */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price_prefix">Prefiks Harga</Label>
              <Input id="price_prefix" name="price_prefix" defaultValue={pkg?.price_prefix ?? ''} placeholder="Mulai dari" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price_amount">Harga</Label>
              <Input id="price_amount" name="price_amount" type="number" min="0" defaultValue={pkg?.price_amount ?? ''} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">Mata Uang</Label>
              <Input id="currency" name="currency" defaultValue={pkg?.currency ?? 'IDR'} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price_period">Periode</Label>
              <Input id="price_period" name="price_period" defaultValue={pkg?.price_period ?? ''} placeholder="/bulan" />
            </div>
          </div>

          {/* Badge + Sort + Flags */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="badge_label">Label Badge</Label>
              <Input id="badge_label" name="badge_label" defaultValue={pkg?.badge_label ?? ''} placeholder="Populer" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sort_order">Urutan</Label>
              <Input id="sort_order" name="sort_order" type="number" min="0" defaultValue={pkg?.sort_order ?? 0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkg-status">Status</Label>
              <select
                id="pkg-status"
                name="is_active"
                defaultValue={pkg?.is_active !== false ? 'true' : 'false'}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_featured"
              name="is_featured"
              value="true"
              defaultChecked={pkg?.is_featured ?? false}
            />
            <Label htmlFor="is_featured" className="cursor-pointer">Tampilkan sebagai paket unggulan</Label>
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label htmlFor="pkg-icon">Icon</Label>
            <div className="flex items-center gap-3">
              {iconPreview && (
                <div className="relative size-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shrink-0">
                  <Image src={iconPreview} alt="icon" fill className="object-contain p-1" unoptimized />
                </div>
              )}
              <Input
                id="pkg-icon"
                name="icon"
                type="file"
                accept="image/png,image/webp,image/jpeg"
                onChange={handleFileChange}
                className="text-sm"
              />
            </div>
            <p className="text-xs text-slate-500">PNG, WEBP, JPEG. Maks 500KB.</p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Fitur Paket</Label>
            <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
              {features.length === 0 && (
                <p className="px-3 py-3 text-sm text-slate-400">Belum ada fitur</p>
              )}
              {features.map((f, idx) => (
                <div key={f._key} className="flex items-center gap-2 px-3 py-2">
                  <Checkbox
                    checked={f.is_included}
                    onCheckedChange={() => toggleFeature(f._key)}
                    aria-label="Termasuk"
                  />
                  <input
                    className="flex-1 min-w-0 text-sm bg-transparent border-0 outline-none focus:ring-0 placeholder:text-slate-400"
                    value={f.label}
                    onChange={(e) => updateFeatureLabel(f._key, e.target.value)}
                    placeholder="Label fitur..."
                  />
                  <button
                    type="button"
                    onClick={() => moveFeature(f._key, -1)}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    aria-label="Naikan"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFeature(f._key, 1)}
                    disabled={idx === features.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    aria-label="Turunkan"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFeature(f._key)}
                    className="p-1 text-red-400 hover:text-red-600"
                    aria-label="Hapus fitur"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature() } }}
                placeholder="Label fitur baru..."
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                <Plus className="size-3.5" />
                Tambah
              </Button>
            </div>
          </div>

          {state?.status === 'error' && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.message}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
