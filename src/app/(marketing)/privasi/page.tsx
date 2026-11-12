import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicSettings } from '@/lib/queries/settings'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Bagaimana NusaBackup mengumpulkan, menggunakan, dan melindungi data pribadi yang Anda kirimkan melalui situs ini.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nusabackup.id'}/privasi`,
  },
  robots: { index: true, follow: true },
}

const SECTIONS: { id: string; title: string; body: string[] }[] = [
  {
    id: 'data',
    title: '1. Data yang kami kumpulkan',
    body: [
      'Melalui formulir kontak kami, kami mengumpulkan: nama lengkap, nomor WhatsApp/telepon, alamat email, nama instansi atau perusahaan, pesan atau kebutuhan Anda, serta kanal kontak yang Anda pilih.',
      'Saat formulir dikirim, sistem juga menyimpan hash alamat IP (bukan alamat IP mentah) untuk mencegah penyalahgunaan formulir, misalnya pengiriman berulang otomatis.',
      'Kami tidak meminta data sensitif (data kesehatan, biometrik, atau data keuangan) melalui situs ini. Jangan mengirimkan data tersebut lewat formulir kontak.',
    ],
  },
  {
    id: 'dasar',
    title: '2. Dasar pemrosesan',
    body: [
      'Kami memproses data Anda atas dasar persetujuan yang Anda berikan saat mencentang pernyataan persetujuan pada formulir, dan atas dasar kepentingan sah kami untuk menanggapi permintaan layanan yang Anda ajukan.',
      'Pemrosesan mengacu pada Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.',
    ],
  },
  {
    id: 'penggunaan',
    title: '3. Cara kami menggunakan data',
    body: [
      'Data digunakan untuk: menghubungi Anda kembali mengenai permintaan Anda, menyusun penawaran atau rekomendasi paket, menyiapkan layanan bila Anda menjadi pelanggan, serta memenuhi kewajiban administratif dan hukum yang berlaku.',
      'Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak lain.',
    ],
  },
  {
    id: 'retensi',
    title: '4. Penyimpanan dan retensi',
    body: [
      'Data disimpan pada basis data yang kami kelola sendiri dengan akses terbatas untuk staf yang berwenang.',
      'Data permintaan yang tidak berlanjut menjadi layanan kami simpan maksimal 24 bulan sejak kontak terakhir, lalu dihapus. Data pelanggan disimpan selama masa layanan dan periode yang diwajibkan peraturan perpajakan dan hukum yang berlaku.',
    ],
  },
  {
    id: 'pembagian',
    title: '5. Pembagian data kepada pihak ketiga',
    body: [
      'Kami hanya membagikan data kepada penyedia layanan yang kami perlukan untuk menjalankan situs dan berkomunikasi dengan Anda, yaitu: penyedia basis data dan autentikasi (Supabase), penyedia jaringan dan perlindungan situs (Cloudflare), layanan pengiriman email notifikasi (Resend), serta layanan pesan WhatsApp (Fonnte) bila kanal tersebut Anda pilih.',
      'Ketika Anda memilih untuk menghubungi kami langsung melalui WhatsApp atau email, komunikasi tersebut juga tunduk pada kebijakan privasi platform terkait.',
    ],
  },
  {
    id: 'keamanan',
    title: '6. Keamanan data',
    body: [
      'Kami menerapkan enkripsi saat transit (HTTPS), pembatasan akses berbasis peran pada panel admin, serta pencatatan aktivitas staf atas data lead. Akses ke basis data produksi hanya tersedia bagi staf berwenang.',
      'Meski demikian, tidak ada sistem yang sepenuhnya bebas risiko. Bila terjadi insiden yang berdampak pada data pribadi Anda, kami akan memberitahukan sesuai ketentuan yang berlaku.',
    ],
  },
  {
    id: 'hak',
    title: '7. Hak Anda',
    body: [
      'Anda berhak meminta akses terhadap data pribadi Anda, meminta koreksi bila tidak akurat, meminta penghapusan, menarik persetujuan, mengajukan keberatan atas pemrosesan, serta meminta salinan data dalam format yang dapat dibaca.',
      'Permintaan dapat dikirim ke alamat email atau nomor WhatsApp di bagian kontak. Kami akan menindaklanjuti paling lambat 14 hari kerja.',
    ],
  },
  {
    id: 'cookie',
    title: '8. Cookie dan teknologi serupa',
    body: [
      'Situs ini tidak menggunakan cookie iklan atau pelacak pihak ketiga. Cookie hanya digunakan bila diperlukan untuk fungsi administratif panel internal, dan tidak diterapkan pada pengunjung halaman publik.',
    ],
  },
  {
    id: 'perubahan',
    title: '9. Perubahan kebijakan',
    body: [
      'Kebijakan ini dapat diperbarui bila praktik kami berubah. Versi terbaru selalu tersedia di halaman ini, dengan tanggal pembaruan di bagian atas.',
    ],
  },
]

export default async function KebijakanPrivasiPage() {
  const settings = await getPublicSettings()
  const email = settings.email ?? 'halo@nusabackup.id'
  const waNumber = settings.wa_number ?? ''

  return (
    <>
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
        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li aria-hidden>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </li>
              <li className="text-white font-medium">Kebijakan Privasi</li>
            </ol>
          </nav>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            Ringkasan singkat: kami hanya memakai data yang Anda kirim melalui formulir untuk
            menanggapi permintaan Anda, menyimpannya dengan akses terbatas, dan tidak
            memperdagangkannya.
          </p>
          <p className="mt-4 text-sm text-slate-400">Terakhir diperbarui: 12 November 2026</p>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-navy-900 mb-3">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="text-slate-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}

            <article id="kontak" className="scroll-mt-24">
              <h2 className="font-display font-bold text-xl text-navy-900 mb-3">
                10. Hubungi kami
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Pertanyaan tentang kebijakan ini atau permintaan terkait data pribadi Anda dapat
                disampaikan melalui:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li>
                  Email:{' '}
                  <a
                    href={`mailto:${email}`}
                    className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                  >
                    {email}
                  </a>
                </li>
                {waNumber && (
                  <li>
                    WhatsApp:{' '}
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                    >
                      +{waNumber}
                    </a>
                  </li>
                )}
              </ul>
            </article>
          </div>

          <div className="mt-14 rounded-xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-sm text-slate-600">
              Ingin langsung membahas kebutuhan backup Anda?{' '}
              <Link href="/kontak" className="font-semibold text-brand-700 hover:underline">
                Hubungi tim kami
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
