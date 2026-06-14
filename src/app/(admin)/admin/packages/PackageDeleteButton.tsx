'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { deletePackage } from '@/actions/packages'

export function PackageDeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label="Hapus paket">
          <Trash2 className="size-3.5 text-red-500" />
        </Button>
      }
      title="Hapus Paket"
      description={`Hapus paket "${name}"? Semua fitur paket ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
      confirmLabel="Hapus"
      onConfirm={() => deletePackage(id)}
    />
  )
}
