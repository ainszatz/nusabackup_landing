import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-navy-900 leading-none select-none">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-slate-500 max-w-sm mx-auto">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 text-white font-semibold text-sm hover:bg-navy-800 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
