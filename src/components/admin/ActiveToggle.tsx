'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Switch } from '@/components/ui/switch'

interface Props {
  id: string
  isActive: boolean
  /** Label spesifik supaya screen reader tahu apa yang di-toggle. */
  label?: string
  onToggle: (id: string, value: boolean) => Promise<unknown>
}

export function ActiveToggle({ id, isActive, label, onToggle }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleChange(checked: boolean) {
    startTransition(async () => {
      await onToggle(id, checked)
      router.refresh()
    })
  }

  return (
    <Switch
      checked={isActive}
      onCheckedChange={handleChange}
      disabled={pending}
      aria-label={label ?? 'Toggle aktif'}
    />
  )
}
