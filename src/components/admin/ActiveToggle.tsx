'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Switch } from '@/components/ui/switch'

interface Props {
  id: string
  isActive: boolean
  onToggle: (id: string, value: boolean) => Promise<unknown>
}

export function ActiveToggle({ id, isActive, onToggle }: Props) {
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
      aria-label="Toggle aktif"
    />
  )
}
