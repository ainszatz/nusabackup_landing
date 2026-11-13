/**
 * CMS menyimpan "prefiks harga" sebagai teks bebas, sehingga muncul variasi
 * "Mulai dari" vs "Mulai" pada kartu yang berdampingan. Normalisasi ini
 * menyatukan varian yang setara tanpa menghapus nilai kustom pemilik situs.
 */
export function normalizePricePrefix(prefix?: string | null): string | null {
  if (!prefix) return null
  const cleaned = prefix.trim().replace(/\s+/g, ' ')
  if (!cleaned) return null

  const key = cleaned.toLowerCase()
  if (['mulai', 'mulai dari', 'start from', 'starting from'].includes(key)) {
    return 'Mulai dari'
  }
  if (['harga tetap', 'tetap', 'fixed', 'fixed price'].includes(key)) {
    return 'Harga tetap'
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}
