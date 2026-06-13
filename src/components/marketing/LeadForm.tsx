'use client'

import { useActionState } from 'react'
import { submitLead } from '@/actions/leads'
import type { SubmitLeadState } from '@/actions/leads'

interface LeadFormProps {
  packageId?: string | null
  packageName?: string | null
  segmentId?: string | null
  segmentName?: string | null
  waNumber?: string
  contactEmail?: string
}

const inputClass =
  'block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition'

const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

function SuccessState({
  message,
  waNumber,
  packageName,
}: {
  message: string
  waNumber?: string
  packageName?: string | null
}) {
  const waText = waNumber
    ? encodeURIComponent(
        `Halo NusaBackup, saya baru mengisi formulir${packageName ? ` untuk paket ${packageName}` : ''}. Kapan saya bisa dihubungi?`
      )
    : ''

  return (
    <div className="flex flex-col items-center text-center py-6 px-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-emerald-600"
          aria-hidden
        >
          <path
            d="M9 12l2 2 4-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
      <h3 className="font-display font-bold text-navy-900 text-lg mb-2">
        Pesan Terkirim!
      </h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">{message}</p>

      {waNumber && (
        <a
          href={`https://wa.me/${waNumber}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chat WhatsApp Sekarang
        </a>
      )}
    </div>
  )
}

export function LeadForm({
  packageId,
  packageName,
  segmentId,
  segmentName,
  waNumber,
  contactEmail,
}: LeadFormProps) {
  const [state, formAction, isPending] = useActionState<SubmitLeadState, FormData>(
    submitLead,
    null
  )

  if (state?.status === 'success') {
    return (
      <SuccessState
        message={state.message}
        waNumber={waNumber}
        packageName={packageName}
      />
    )
  }

  const waPretext = waNumber
    ? `Halo NusaBackup, saya ingin menanyakan${packageName ? ` paket ${packageName}` : ' layanan backup Anda'}.`
    : ''
  const mailSubject = packageName ? `Pertanyaan tentang Paket ${packageName}` : 'Pertanyaan Layanan NusaBackup'
  const mailBody = `Halo NusaBackup,\n\nSaya ingin mengetahui lebih lanjut${packageName ? ` tentang paket ${packageName}` : ''}.\n\nNama: \nPerusahaan: \nPesan: `

  return (
    <form action={formAction} noValidate className="space-y-4">
      {/* ── Honeypot — visually hidden, aria-hidden, tabIndex -1 ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          defaultValue=""
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* ── Hidden context snapshot fields ── */}
      <input type="hidden" name="segment_id" value={segmentId ?? ''} />
      <input type="hidden" name="package_id" value={packageId ?? ''} />
      <input type="hidden" name="segment_name" value={segmentName ?? ''} />
      <input type="hidden" name="package_name" value={packageName ?? ''} />

      {/* ── Error alert ── */}
      {state?.status === 'error' && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 mt-0.5"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {state.message}
        </div>
      )}

      {/* ── Name ── */}
      <div>
        <label htmlFor="lead-name" className={labelClass}>
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          id="lead-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Contoh: Budi Santoso"
          className={inputClass}
        />
      </div>

      {/* ── Phone + Email row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-phone" className={labelClass}>
            No. WhatsApp / Telepon
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="08xxxxxxxxxx"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lead-email" className={labelClass}>
            Email
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@perusahaan.com"
            className={inputClass}
          />
        </div>
      </div>

      {/* ── Organization ── */}
      <div>
        <label htmlFor="lead-org" className={labelClass}>
          Instansi / Perusahaan
        </label>
        <input
          id="lead-org"
          name="organization"
          type="text"
          autoComplete="organization"
          placeholder="Nama perusahaan atau instansi"
          className={inputClass}
        />
      </div>

      {/* ── Message ── */}
      <div>
        <label htmlFor="lead-message" className={labelClass}>
          Pesan / Kebutuhan
        </label>
        <textarea
          id="lead-message"
          name="message"
          rows={3}
          placeholder="Ceritakan kebutuhan backup atau pertanyaan Anda…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* ── Preferred channel ── */}
      <div>
        <p className={`${labelClass} mb-2`}>Hubungi saya via</p>
        <div className="flex gap-5">
          {[
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'email', label: 'Email' },
          ].map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-700"
            >
              <input
                type="radio"
                name="preferred_channel"
                value={value}
                defaultChecked={value === 'whatsapp'}
                className="accent-brand-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition-all hover:bg-brand-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {isPending ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="animate-spin"
              aria-hidden
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Mengirim…
          </>
        ) : (
          'Kirim Pesan'
        )}
      </button>

      {/* ── FR-10: Direct contact alternatives ── */}
      {(waNumber || contactEmail) && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center mb-3">
            Atau hubungi langsung:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waPretext)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat WhatsApp
              </a>
            )}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`}
                className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Kirim Email
              </a>
            )}
          </div>
        </div>
      )}
    </form>
  )
}
