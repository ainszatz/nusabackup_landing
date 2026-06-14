'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { deleteSegment } from '@/actions/segments'

export function SegmentDeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label="Hapus segmen">
          <Trash2 className="size-3.5 text-red-500" />
        </Button>
      }
      title="Hapus Segmen"
      description={`Hapus segmen "${name}"? Semua paket dalam segmen ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
      confirmLabel="Hapus"
      onConfirm={() => deleteSegment(id)}
    />
  )
}
