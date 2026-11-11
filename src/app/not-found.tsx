import Link from 'next/link'

const links = [
  { href: '/umum', label: 'Umum' },
  { href: '/pendidikan', label: 'Pendidikan' },
  { href: '/kesehatan', label: 'Kesehatan' },
  { href: '/kontak', label: 'Kontak' },
]

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-slate-50 px-6"
    >
      <div className="text-center">
        <p className="text-8xl font-extrabold text-navy-900 leading-none select-none">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-slate-500 max-w-sm mx-auto">
          Halaman yang Anda cari tidak ada atau telah dipindahkan. Coba salah satu halaman
          berikut.
        </p>

        <nav aria-label="Tautan bantuan" className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex items-center min-h-11 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-slate-300 hover:text-navy-900 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="mt-6 inline-flex items-center min-h-11 gap-2 px-6 rounded-xl bg-navy-900 text-white font-semibold text-sm hover:bg-navy-800 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  )
}
