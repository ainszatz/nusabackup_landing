import Link from 'next/link'
import type { PublicSettings } from '@/types'

interface HeroProps {
  settings: PublicSettings
}

export function Hero({ settings }: HeroProps) {
  const waNumber = settings.wa_number ?? ''
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo NusaBackup, saya ingin mengetahui lebih lanjut tentang layanan backup Anda.')}`
    : '#'

  return (
    <section
      className="relative min-h-[92vh] flex items-center bg-navy-900 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Geometric dot-grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />

      {/* Blue radial glow — top right */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, #1B4FD8 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* Accent line — bottom */}
      <div
        className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-600/40 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-28 lg:py-36 w-full">
        <div className="max-w-3xl">
          {/* Eyebrow tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/20 border border-brand-600/30 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" aria-hidden />
            <span className="text-brand-500 text-xs font-semibold tracking-wide uppercase">
              Offsite Backup &amp; Disaster Recovery
            </span>
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-white mb-6"
          >
            Data Anda Aman.{' '}
            <span className="text-brand-500">Bisnis</span>{' '}
            Anda Berjalan.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-10">
            NusaBackup melindungi data bisnis, pendidikan, dan kesehatan Anda dengan backup
            offsite otomatis, enkripsi AES-256, dan pemulihan cepat — siap ketika Anda paling
            membutuhkan.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="#paket"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-600/40 hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 9h6M9 12h6M9 15h4"/>
              </svg>
              Lihat Paket Layanan
            </Link>

            {waNumber && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-white/20 hover:border-white/40 text-white font-semibold text-base transition-all hover:bg-white/5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-400" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Hubungi via WhatsApp
              </a>
            )}
          </div>

          {/* Trust signals */}
          <div className="mt-14 flex flex-wrap items-center gap-6 text-slate-400 text-sm">
            {[
              { icon: '🔒', text: 'Enkripsi AES-256' },
              { icon: '⚡', text: 'Backup otomatis setiap jam' },
              { icon: '🛡️', text: 'RTO / RPO terukur' },
              { icon: '🇮🇩', text: 'Server Indonesia' },
            ].map((t) => (
              <span key={t.text} className="flex items-center gap-1.5">
                <span aria-hidden>{t.icon}</span>
                {t.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
          <path d="M0 60V30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
