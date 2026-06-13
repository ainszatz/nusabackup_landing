import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPackageBySlug, getAllActivePackages } from '@/lib/queries/packages'
import { getPublicSettings } from '@/lib/queries/settings'
import { JsonLd } from '@/components/marketing/JsonLd'
import { LeadFormModal } from '@/components/marketing/LeadFormModal'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nusabackup.id'

type Props = {
  params: Promise<{ segment: string; package: string }>
}

export async function generateStaticParams() {
  const packages = await getAllActivePackages()
  return packages
    .filter((p) => p.segment != null)
    .map((p) => ({ segment: p.segment!.slug, package: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segment: segSlug, package: pkgSlug } = await params
  const pkg = await getPackageBySlug(segSlug, pkgSlug)
  if (!pkg) return { title: 'Paket Tidak Ditemukan' }

  const title = `${pkg.name} | ${pkg.segment?.name ?? ''} — NusaBackup`
  const description =
    pkg.description ?? `Paket ${pkg.name} dari NusaBackup untuk segmen ${pkg.segment?.name ?? ''}.`

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/${segSlug}/${pkgSlug}`,
      siteName: 'NusaBackup',
    },
  }
}

function formatPrice(amount: number): string {
  if (amount >= 1_000_000) {
    const juta = amount / 1_000_000
    return `Rp ${juta % 1 === 0 ? juta.toFixed(0) : juta.toFixed(1)} juta`
  }
  return `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`
}

export default async function PackageDetailPage({ params }: Props) {
  const { segment: segSlug, package: pkgSlug } = await params
  const [pkg, settings] = await Promise.all([
    getPackageBySlug(segSlug, pkgSlug),
    getPublicSettings(),
  ])

  if (!pkg) notFound()

  const waNumber = settings.wa_number ?? ''
  const contactEmail = settings.email ?? ''
  const waText = `Halo NusaBackup, saya tertarik dengan paket *${pkg.name}* (${pkg.segment?.name ?? ''}). Boleh saya mendapat informasi lebih lanjut?`
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`
    : '#'

  const features = [...(pkg.features ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const includedCount = features.filter((f) => f.is_included).length

  const packageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pkg.name,
    description: pkg.description ?? '',
    brand: { '@type': 'Organization', name: 'NusaBackup' },
    url: `${SITE_URL}/${segSlug}/${pkgSlug}`,
    ...(pkg.price_amount != null && {
      offers: {
        '@type': 'Offer',
        priceCurrency: pkg.currency ?? 'IDR',
        price: pkg.price_amount,
        availability: 'https://schema.org/InStock',
      },
    }),
  }

  return (
    <>
      <JsonLd data={packageJsonLd} />

      {/* ── Breadcrumb + Hero ── */}
      <section className="relative bg-navy-900 pt-32 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
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
              <li>
                <Link href={`/${segSlug}`} className="hover:text-white transition-colors capitalize">
                  {pkg.segment?.name ?? segSlug}
                </Link>
              </li>
              <li aria-hidden>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </li>
              <li className="text-white font-medium">{pkg.name}</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
            {/* Left: name + price */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {pkg.segment && (
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {pkg.segment.name}
                  </span>
                )}
                {pkg.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-500 text-white text-xs font-bold">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    PALING POPULER
                  </span>
                )}
                {pkg.badge_label && !pkg.is_featured && (
                  <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100">
                    {pkg.badge_label}
                  </span>
                )}
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4">
                {pkg.name}
              </h1>

              {pkg.description && (
                <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mb-6">
                  {pkg.description}
                </p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-8">
                {pkg.price_amount != null ? (
                  <>
                    {pkg.price_prefix && (
                      <span className="text-slate-400 text-sm">{pkg.price_prefix}</span>
                    )}
                    <span className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                      {formatPrice(pkg.price_amount)}
                    </span>
                    {pkg.price_period && (
                      <span className="text-slate-400">/{pkg.price_period}</span>
                    )}
                  </>
                ) : (
                  <span className="font-display font-extrabold text-3xl text-white">
                    {pkg.price_prefix ?? 'Hubungi kami untuk harga'}
                  </span>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <LeadFormModal
                  packageId={pkg.id}
                  packageName={pkg.name}
                  segmentId={pkg.segment?.id ?? null}
                  segmentName={pkg.segment?.name ?? null}
                  waNumber={waNumber}
                  contactEmail={contactEmail}
                  triggerLabel="Pesan Sekarang"
                  triggerClassName="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all shadow-lg shadow-brand-600/30 hover:-translate-y-0.5"
                />
                {waNumber && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 hover:border-white/40 text-white font-semibold transition-all hover:bg-white/5"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-green-400" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Tanya via WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Right: icon */}
            {pkg.icon && (
              <div className="mt-10 lg:mt-0 shrink-0">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Image
                    src={pkg.icon}
                    alt={pkg.name}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wave */}
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

      {/* ── Features ── */}
      <section className="bg-white py-16 lg:py-20" aria-labelledby="features-heading">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2
              id="features-heading"
              className="font-display font-bold text-2xl text-navy-900"
            >
              Yang termasuk dalam paket ini
            </h2>
            <span className="text-sm text-slate-400">
              {includedCount} dari {features.length} fitur
            </span>
          </div>

          {features.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <div
                  key={f.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${
                    f.is_included
                      ? 'bg-white border-slate-100'
                      : 'bg-slate-50/50 border-slate-100 opacity-60'
                  }`}
                >
                  {f.is_included ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="shrink-0 mt-0.5 text-emerald-500"
                      aria-label="Termasuk"
                    >
                      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
                      <path
                        d="M8 12l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="shrink-0 mt-0.5 text-slate-300"
                      aria-label="Tidak termasuk"
                    >
                      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                      <path
                        d="M15 9l-6 6M9 9l6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  <span
                    className={`text-sm leading-snug ${
                      f.is_included ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Fitur belum tersedia.</p>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-surface py-14 lg:py-16 border-t border-slate-100">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-2xl text-navy-900 mb-3">
            Siap memulai dengan {pkg.name}?
          </h2>
          <p className="text-slate-500 mb-8">
            Hubungi tim kami untuk demo gratis dan pertanyaan teknis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <LeadFormModal
              packageId={pkg.id}
              packageName={pkg.name}
              segmentId={pkg.segment?.id ?? null}
              segmentName={pkg.segment?.name ?? null}
              waNumber={waNumber}
              contactEmail={contactEmail}
              triggerLabel="Pesan Sekarang"
              triggerClassName="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all shadow-md hover:-translate-y-0.5"
            />
            <Link
              href={`/${segSlug}`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Paket {pkg.segment?.name ?? segSlug} lainnya
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
