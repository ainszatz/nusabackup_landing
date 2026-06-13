import type { Metadata } from 'next'
import { getPublicSettings } from '@/lib/queries/settings'
import { ContactInfo } from '@/components/marketing/ContactInfo'

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description:
    'Hubungi tim NusaBackup untuk konsultasi gratis layanan backup offsite & disaster recovery. Kami siap membantu memilih solusi yang tepat untuk Anda.',
  openGraph: {
    title: 'Hubungi Kami — NusaBackup',
    description:
      'Konsultasi gratis backup offsite & disaster recovery. Hubungi via WhatsApp, email, atau isi formulir kontak.',
    type: 'website',
    siteName: 'NusaBackup',
  },
}

export default async function KontakPage() {
  const settings = await getPublicSettings()

  const waNumber = settings.wa_number ?? ''
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo NusaBackup, saya ingin konsultasi gratis tentang layanan backup Anda.')}`
    : '#'

  return (
    <>
      {/* ── Hero ── */}
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
        <div className="absolute top-0 inset-x-0 h-1 bg-brand-600" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Hubungi Kami
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
            Konsultasi gratis — tim kami akan membantu merancang solusi backup yang sesuai
            kebutuhan Anda.
          </p>
        </div>

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

      {/* ── Content ── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            {/* ── Contact Info column ── */}
            <div>
              <h2 className="font-display font-bold text-xl text-navy-900 mb-2">
                Informasi Kontak
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                Hubungi kami langsung melalui saluran berikut atau gunakan formulir di
                sebelah kanan.
              </p>

              <ContactInfo settings={settings} className="mb-10" />

              {/* Quick WA CTA */}
              {waNumber && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-md"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat WhatsApp Sekarang
                </a>
              )}

              {/* Hours */}
              <div className="mt-10 p-5 rounded-xl bg-slate-50 border border-slate-100">
                <h3 className="font-semibold text-navy-900 text-sm mb-3">Jam Operasional</h3>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  <li className="flex justify-between">
                    <span>Senin – Jumat</span>
                    <span className="font-medium">08.00 – 17.00 WIB</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sabtu</span>
                    <span className="font-medium">09.00 – 14.00 WIB</span>
                  </li>
                  <li className="flex justify-between text-slate-400">
                    <span>Minggu & Hari Libur</span>
                    <span>Tutup</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* ── Lead Form mount point (Session 4) ── */}
            <div>
              <h2 className="font-display font-bold text-xl text-navy-900 mb-2">
                Kirim Pesan
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                Isi formulir berikut dan tim kami akan menghubungi Anda dalam 1×24 jam.
              </p>

              {/*
               * SESSION 4 MOUNT POINT — LeadForm
               * Ganti div di bawah ini dengan komponen <LeadForm /> pada Sesi 4.
               * Props yang diharapkan: paket & segmen dari URL search params.
               */}
              <div
                id="lead-form-mount"
                className="flex flex-col items-center justify-center min-h-[360px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center"
                aria-label="Formulir kontak — segera hadir"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-slate-300 mb-4"
                  aria-hidden
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p className="text-slate-400 font-medium">Formulir kontak</p>
                <p className="text-slate-300 text-sm mt-1">Akan tersedia pada Sesi 4</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
