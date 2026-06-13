import type { Metadata } from 'next'
import Link from 'next/link'
import { Hero } from '@/components/marketing/Hero'
import { SegmentCard } from '@/components/marketing/SegmentCard'
import { PackageCard } from '@/components/marketing/PackageCard'
import { JsonLd } from '@/components/marketing/JsonLd'
import { getActiveSegments } from '@/lib/queries/segments'
import { getFeaturedPackages } from '@/lib/queries/packages'
import { getPublicSettings } from '@/lib/queries/settings'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nusabackup.id'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings()
  const title =
    settings.meta_title ?? 'NusaBackup — Layanan Backup Offsite & Disaster Recovery'
  const description =
    settings.meta_description ??
    'NusaBackup menyediakan layanan backup offsite dan disaster recovery untuk bisnis, pendidikan, dan kesehatan Indonesia.'
  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: SITE_URL,
      siteName: 'NusaBackup',
    },
  }
}

export default async function HomePage() {
  const [segments, featuredPackages, settings] = await Promise.all([
    getActiveSegments(),
    getFeaturedPackages(),
    getPublicSettings(),
  ])

  const waNumber = settings.wa_number ?? ''

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NusaBackup',
    url: SITE_URL,
    description:
      'Layanan backup offsite & disaster recovery untuk bisnis, pendidikan, dan kesehatan Indonesia.',
    areaServed: 'Indonesia',
    ...(settings.email && { email: settings.email }),
    ...(waNumber && { telephone: `+${waNumber}` }),
    ...(settings.address && {
      address: { '@type': 'PostalAddress', streetAddress: settings.address },
    }),
    ...(settings.social_instagram && {
      sameAs: [
        settings.social_instagram,
        ...(settings.social_linkedin ? [settings.social_linkedin] : []),
      ],
    }),
  }

  return (
    <>
      <JsonLd data={orgJsonLd} />
      {/* ─── Hero ─── */}
      <Hero settings={settings} />

      {/* ─── Segments ─── */}
      <section
        className="bg-surface py-20 lg:py-24"
        aria-labelledby="segments-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Solusi per Industri
            </span>
            <h2
              id="segments-heading"
              className="font-display font-bold text-3xl sm:text-4xl text-navy-900"
            >
              Dirancang untuk kebutuhan Anda
            </h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Setiap segmen memiliki regulasi, skala, dan prioritas yang berbeda.
              NusaBackup hadir dengan paket yang sesuai.
            </p>
          </div>

          {segments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {segments.map((segment) => (
                <SegmentCard key={segment.id} segment={segment} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-12">
              Segmen belum tersedia.
            </p>
          )}
        </div>
      </section>

      {/* ─── Featured Packages ─── */}
      <section
        id="paket"
        className="bg-white py-20 lg:py-28"
        aria-labelledby="packages-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Paket Layanan
            </span>
            <h2
              id="packages-heading"
              className="font-display font-bold text-3xl sm:text-4xl text-navy-900"
            >
              Pilih paket yang tepat
            </h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Mulai dari bisnis kecil hingga enterprise — ada paket untuk setiap skala.
              Semua termasuk enkripsi AES-256 dan pemantauan 24/7.
            </p>
          </div>

          {featuredPackages.length > 0 ? (
            <div className={`grid gap-8 ${
              featuredPackages.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : featuredPackages.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {featuredPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} waNumber={waNumber} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-12">
              Paket belum tersedia.
            </p>
          )}

          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm mb-4">
              Butuh solusi khusus untuk kebutuhan enterprise?
            </p>
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-navy-900 text-navy-900 font-semibold text-sm hover:bg-navy-900 hover:text-white transition-all"
            >
              Diskusikan kebutuhan Anda
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why NusaBackup ─── */}
      <section
        className="bg-navy-950 py-20 lg:py-24 text-white"
        aria-labelledby="why-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">
              Kenapa NusaBackup
            </span>
            <h2
              id="why-heading"
              className="font-display font-bold text-3xl sm:text-4xl text-white"
            >
              Infrastruktur kelas enterprise,<br className="hidden sm:block" /> harga yang terjangkau
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                ),
                title: 'Enkripsi AES-256',
                desc: 'Data dienkripsi end-to-end sebelum meninggalkan perangkat Anda.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                ),
                title: 'Backup Otomatis',
                desc: 'Jadwalkan backup per jam, harian, atau mingguan tanpa intervensi manual.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                ),
                title: 'RTO / RPO Terukur',
                desc: 'Pemulihan cepat dengan target waktu dan titik pemulihan yang jelas.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                ),
                title: 'Server Indonesia',
                desc: 'Data tersimpan di pusat data lokal, mematuhi regulasi data nasional.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-2xl bg-white/5 border border-white/10 p-6 hover:bg-white/8 transition-colors"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400">
                  {item.icon}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-white mb-1.5">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA block ─── */}
      <section className="bg-brand-600 py-16 lg:py-20" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2
            id="cta-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-white mb-4"
          >
            Siap melindungi data Anda?
          </h2>
          <p className="text-brand-100 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Mulai dengan konsultasi gratis. Tim kami akan membantu merancang solusi backup
            yang sesuai skala dan kebutuhan bisnis Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-colors shadow-lg"
            >
              Mulai Konsultasi Gratis
            </Link>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Halo NusaBackup, saya ingin konsultasi gratis tentang solusi backup untuk bisnis saya.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
