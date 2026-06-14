'use client'

import { startTransition, useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
import { upsertSegment } from '@/actions/segments'
import type { Segment } from '@/types'

interface Props {
  trigger: React.ReactNode
  segment?: Segment
}

export function SegmentFormDialog({ trigger, segment }: Props) {
  const [open, setOpen] = useState(false)
  const [iconPreview, setIconPreview] = useState<string | null>(segment?.icon ?? null)
  const router = useRouter()
  const [state, action, pending] = useActionState(upsertSegment, null)

  useEffect(() => {
    if (state?.status === 'success') {
      startTransition(() => {
        setOpen(false)
        router.refresh()
      })
    }
  }, [state, router])

  // Reset preview when dialog opens for a different segment
  useEffect(() => {
    if (open) startTransition(() => setIconPreview(segment?.icon ?? null))
  }, [open, segment?.icon])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setIconPreview(URL.createObjectURL(file))
    else setIconPreview(segment?.icon ?? null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} style={{ cursor: 'pointer', display: 'contents' }}>
        {trigger}
      </span>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{segment ? 'Edit Segmen' : 'Tambah Segmen'}</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4 py-1">
          {segment?.id && <input type="hidden" name="id" value={segment.id} />}
          {segment?.icon && (
            <input type="hidden" name="existing_icon" value={segment.icon} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama *</Label>
              <Input id="name" name="name" defaultValue={segment?.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" name="slug" defaultValue={segment?.slug} required placeholder="contoh-slug" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={segment?.tagline ?? ''} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" defaultValue={segment?.description ?? ''} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hero_headline">Hero Headline</Label>
              <Input id="hero_headline" name="hero_headline" defaultValue={segment?.hero_headline ?? ''} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hero_subheadline">Hero Subheadline</Label>
              <Input id="hero_subheadline" name="hero_subheadline" defaultValue={segment?.hero_subheadline ?? ''} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input id="meta_title" name="meta_title" defaultValue={segment?.meta_title ?? ''} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Input id="meta_description" name="meta_description" defaultValue={segment?.meta_description ?? ''} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sort_order">Urutan</Label>
              <Input id="sort_order" name="sort_order" type="number" min="0" defaultValue={segment?.sort_order ?? 0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="is_active">Status</Label>
              <select
                id="is_active"
                name="is_active"
                defaultValue={segment?.is_active !== false ? 'true' : 'false'}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="icon">Icon</Label>
            <div className="flex items-center gap-3">
              {iconPreview && (
                <div className="relative size-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shrink-0">
                  <Image src={iconPreview} alt="icon preview" fill className="object-contain p-1" unoptimized />
                </div>
              )}
              <Input
                id="icon"
                name="icon"
                type="file"
                accept="image/png,image/webp,image/jpeg"
                onChange={handleFileChange}
                className="text-sm"
              />
            </div>
            <p className="text-xs text-slate-500">PNG, WEBP, JPEG. Maks 500KB.</p>
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
