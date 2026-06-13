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

  // Trap focus and handle Escape key when modal is open
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)

    // Prevent body scroll while modal is open
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prev
    }
  }, [open])

  const defaultTriggerClass =
    'flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm transition-all'

  return (
    <>
      {/* Trigger button */}
      <button
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            ref={dialogRef}
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-start justify-between gap-4 px-6 pt-6 pb-4 bg-white border-b border-slate-100">
              <div>
                <h2 id="modal-title" className="font-display font-bold text-navy-900 text-lg">
                  {packageName ? `Pesan Paket ${packageName}` : 'Hubungi Kami'}
                </h2>
                {segmentName && (
                  <p className="text-slate-400 text-xs mt-0.5">{segmentName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
