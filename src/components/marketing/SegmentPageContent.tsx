import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PackageCard } from './PackageCard'
import { JsonLd } from './JsonLd'
import { getSegmentBySlug } from '@/lib/queries/segments'
import { getPackagesBySegment } from '@/lib/queries/packages'
import { getPublicSettings } from '@/lib/queries/settings'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nusabackup.id'

const SEGMENT_STYLE: Record<string, { accent: string; badgeBg: string; badgeText: string }> = {
  umum: {
    accent: 'bg-brand-600',
    badgeBg: 'bg-brand-50',
    badgeText: 'text-brand-700',
  },
  pendidikan: {
    accent: 'bg-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
  },
  kesehatan: {
    accent: 'bg-rose-600',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
  },
}

export async function buildSegmentMetadata(slug: string): Promise<Metadata> {
  const [segment, settings] = await Promise.all([
    getSegmentBySlug(slug),
    getPublicSettings(),
  ])
  const fallbackTitle = `${segment?.name ?? slug} — NusaBackup`
  const fallbackDesc =
    settings.meta_description ??
    'NusaBackup menyediakan layanan backup offsite & disaster recovery.'
  return {
    title: segment?.meta_title
      ? { absolute: segment.meta_title }
      : fallbackTitle,
    description: segment?.meta_description ?? fallbackDesc,
    openGraph: {
      title: segment?.meta_title ?? fallbackTitle,
      description: segment?.meta_description ?? fallbackDesc,
      type: 'website',
      url: `${SITE_URL}/${slug}`,
      siteName: 'NusaBackup',
    },
  }
}

export async function SegmentPageContent({ slug }: { slug: string }) {
  const [segment, packages, settings] = await Promise.all([
    getSegmentBySlug(slug),
    getPackagesBySegment(slug),
    getPublicSettings(),
  ])

  if (!segment) notFound()

  const style = SEGMENT_STYLE[slug] ?? SEGMENT_STYLE.umum
  const waNumber = settings.wa_number ?? ''

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `NusaBackup — ${segment.name}`,
    description: segment.description ?? segment.tagline ?? '',
    provider: {
      '@type': 'Organization',
      name: 'NusaBackup',
      url: SITE_URL,
    },
    areaServed: 'Indonesia',
    serviceType: 'Backup Offsite & Disaster Recovery',
    url: `${SITE_URL}/${slug}`,
  }

  return (
    <>
      <JsonLd data={serviceJsonLd} />

      {/* ── Segment Hero ── */}
      <section
        className="relative bg-navy-900 pt-32 pb-20 overflow-hidden"
        aria-labelledby="segment-heading"
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden
        />

        {/* Color accent top bar */}
        <div className={`absolute top-0 inset-x-0 h-1 ${style.accent}`} aria-hidden />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li aria-hidden>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </li>
              <li className="text-white font-medium">{segment.name}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-6 ${style.badgeBg} ${style.badgeText}`}
            >
              {segment.name}
            </span>
            <h1
              id="segment-heading"
              className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-5"
            >
              {segment.hero_headline ?? segment.name}
            </h1>
            {segment.hero_subheadline && (
              <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
                {segment.hero_subheadline}
              </p>
            )}

            {/* Jump to packages */}
            <div className="mt-8">
              <Link
                href="#paket"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all ${style.accent} hover:opacity-90 shadow-lg`}
              >
                Lihat Paket
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden>
          <svg
            viewBox="0 0 1440 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-8"
          >
            <path
              d="M0 40V20C360 0 720 40 1080 20C1260 10 1380 30 1440 20V40H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ── Description / Value prop ── */}
      {(segment.description || segment.tagline) && (
        <section className="bg-white py-14 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              {segment.tagline && (
                <p className="text-brand-600 font-semibold text-sm uppercase tracking-widest mb-4">
                  {segment.tagline}
                </p>
              )}
              {segment.description && (
                <p className="text-slate-600 text-lg leading-relaxed">
                  {segment.description}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Packages ── */}
      <section
        id="paket"
        className="bg-surface py-16 lg:py-24"
        aria-labelledby="packages-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">
              Paket Layanan
            </span>
            <h2
              id="packages-heading"
              className="font-display font-bold text-2xl sm:text-3xl text-navy-900"
            >
              Pilih paket untuk {segment.name}
            </h2>
          </div>

          {packages.length > 0 ? (
            <div
              className={`grid gap-8 ${
                packages.length === 1
                  ? 'grid-cols-1 max-w-md mx-auto'
                  : packages.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} waNumber={waNumber} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-12">
              Belum ada paket tersedia untuk segmen ini.
            </p>
          )}

          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm mb-4">
              Tidak menemukan yang sesuai? Kami bisa menyesuaikan paket untuk kebutuhan Anda.
            </p>
            <Link
              href={`/kontak?segmen=${encodeURIComponent(slug)}`}
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
    </>
  )
}
