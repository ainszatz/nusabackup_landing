import type { PackageWithDetails } from '@/types'
import { LeadFormModal } from './LeadFormModal'

interface PackageCardProps {
  pkg: PackageWithDetails
  waNumber: string
}

function formatPriceAmount(amount: number): string {
  if (amount >= 1_000_000) {
    const juta = amount / 1_000_000
    return `${juta % 1 === 0 ? juta.toFixed(0) : juta.toFixed(1)} jt`
  }
  return new Intl.NumberFormat('id-ID').format(amount)
}

function buildWAText(pkg: PackageWithDetails): string {
  const segName = pkg.segment?.name ?? ''
  return `Halo NusaBackup, saya tertarik dengan paket *${pkg.name}* untuk segmen ${segName}. Boleh saya mendapat informasi lebih lanjut dan penawaran harganya?`
}

export function PackageCard({ pkg, waNumber }: PackageCardProps) {
  const isFeatured = pkg.is_featured
  const hasPrice = pkg.price_amount !== null
  const waText = buildWAText(pkg)
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`
    : '#'

  const includedFeatures = (pkg.features ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <article
      className={`relative flex flex-col rounded-2xl border transition-shadow duration-200 ${
        isFeatured
          ? 'border-brand-600 shadow-xl shadow-brand-600/10 bg-white'
          : 'border-slate-100 shadow-sm hover:shadow-md bg-white'
      }`}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute -top-3.5 inset-x-0 flex justify-center" aria-label="Paket unggulan">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-500 text-white text-xs font-bold tracking-wide shadow-sm">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            PALING POPULER
          </span>
        </div>
      )}

      <div className={`p-7 flex flex-col flex-1 ${isFeatured ? 'pt-9' : ''}`}>
        {/* Segment tag */}
        {pkg.segment && (
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {pkg.segment.name}
          </span>
        )}

        {/* Package name */}
        <h3 className="font-display font-bold text-xl text-navy-900 mb-1.5">
          {pkg.name}
        </h3>

        {/* Description */}
        {pkg.description && (
          <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2">
            {pkg.description}
          </p>
        )}

        {/* Price */}
        <div className="mb-6">
          {hasPrice ? (
            <div className="flex items-baseline gap-1.5">
              {pkg.price_prefix && (
                <span className="text-slate-400 text-sm font-medium">{pkg.price_prefix}</span>
              )}
              <span className="font-display font-extrabold text-3xl text-navy-900">
                Rp {formatPriceAmount(pkg.price_amount!)}
              </span>
              {pkg.price_period && (
                <span className="text-slate-400 text-sm">/{pkg.price_period}</span>
              )}
            </div>
          ) : (
            <div className="flex items-baseline">
              <span className="font-display font-extrabold text-2xl text-navy-900">
                {pkg.price_prefix ?? 'Hubungi kami'}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mb-5" aria-hidden />

        {/* Feature checklist */}
        {includedFeatures.length > 0 && (
          <ul className="space-y-2.5 mb-7 flex-1">
            {includedFeatures.map((f) => (
              <li key={f.id} className="flex items-start gap-2.5">
                {f.is_included ? (
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    className="shrink-0 mt-0.5 text-emerald-500"
                    aria-label="Termasuk"
                  >
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
                    <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    className="shrink-0 mt-0.5 text-slate-300"
                    aria-label="Tidak termasuk"
                  >
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
                    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
                <span className={`text-sm leading-snug ${f.is_included ? 'text-slate-700' : 'text-slate-400'}`}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* CTAs */}
        <div className="space-y-2.5 mt-auto">
          <LeadFormModal
            packageId={pkg.id}
            packageName={pkg.name}
            segmentId={pkg.segment?.id ?? null}
            segmentName={pkg.segment?.name ?? null}
            waNumber={waNumber}
            triggerLabel="Pesan Sekarang"
            triggerClassName={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              isFeatured
                ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 hover:-translate-y-0.5'
                : 'bg-navy-900 hover:bg-navy-800 text-white'
            }`}
          />

          {waNumber && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-emerald-200 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hubungi via WhatsApp
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
