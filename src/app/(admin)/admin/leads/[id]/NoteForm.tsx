'use client'

import { useActionState, useRef, useEffect } from 'react'
import { addLeadNote } from '@/actions/leads'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export function NoteForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState(addLeadNote, null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (state?.status === 'success' && textareaRef.current) {
      textareaRef.current.value = ''
    }
  }, [state])

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="leadId" value={leadId} />

      <div className="space-y-1.5">
        <Label htmlFor="note">Tambah Catatan</Label>
        <Textarea
          ref={textareaRef}
          id="note"
          name="note"
          placeholder="Tulis catatan..."
          rows={3}
          className="resize-none"
        />
      </div>

      {state?.status === 'error' && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      {state?.status === 'success' && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} size="sm">
        {pending ? 'Menyimpan...' : 'Simpan Catatan'}
      </Button>
    </form>
  )
}
