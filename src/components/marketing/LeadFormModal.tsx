'use client'

import { useState, useEffect, useRef } from 'react'
import { LeadForm } from './LeadForm'

interface LeadFormModalProps {
  packageId?: string | null
  packageName?: string | null
  segmentId?: string | null
  segmentName?: string | null
  waNumber?: string
  contactEmail?: string
  triggerLabel?: string
  triggerClassName?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function LeadFormModal({
  packageId,
  packageName,
  segmentId,
  segmentName,
  waNumber,
  contactEmail,
  triggerLabel = 'Pesan Sekarang',
  triggerClassName,
}: LeadFormModalProps) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Focus management + scroll lock while the dialog is open (WCAG 2.4.3, 2.1.2).
  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const trigger = triggerRef.current

    const getFocusable = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      )

    // Move focus into the dialog: first form field, else the close button.
    const firstField = dialog.querySelector<HTMLElement>('#lead-name')
    const focusTarget = firstField ?? getFocusable()[0]
    focusTarget?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return

      const items = getFocusable()
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null

      // Keep Tab cycling inside the dialog.
      if (!active || !dialog.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Prevent body scroll without shifting the layout (scrollbar gap).
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      // Restore focus to whatever opened the dialog.
      ;(previouslyFocused ?? trigger)?.focus?.()
    }
  }, [open])

  const defaultTriggerClass =
    'flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm transition-all'

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? defaultTriggerClass}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {triggerLabel}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-start justify-between gap-4 px-6 pt-6 pb-4 bg-white border-b border-slate-100">
              <div>
                <h2 id="modal-title" className="font-display font-bold text-navy-900 text-lg">
                  {packageName ? `Pesan Paket ${packageName}` : 'Hubungi Kami'}
                </h2>
                <p id="modal-description" className="text-slate-500 text-xs mt-0.5">
                  {segmentName
                    ? `Isi formulir, tim ${segmentName} akan menghubungi Anda.`
                    : 'Isi formulir, tim kami akan menghubungi Anda dalam 1×24 jam.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="shrink-0 inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-6">
              <LeadForm
                packageId={packageId}
                packageName={packageName}
                segmentId={segmentId}
                segmentName={segmentName}
                waNumber={waNumber}
                contactEmail={contactEmail}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
