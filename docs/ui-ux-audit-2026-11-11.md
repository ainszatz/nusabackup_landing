# Audit UI/UX — NusaBackup Landing

- **Target:** `~/nusa/nusabackup_landing` + deploy live `https://nusabackup.id/`
- **Tanggal:** 11 November 2026
- **Metode:** inspeksi source (marketing pages & components), lalu verifikasi di browser pada viewport 320 / 390 / 768 / 1024 / 1440 px. Semua temuan di bawah dibuktikan dari computed style / DOM live, bukan perkiraan.
- **Cakupan:** 13 URL publik (home, 3 segmen, 8 detail paket, kontak) + `/admin/login`, 404. Admin area dalam login **tidak** diaudit.
- **Di luar cakupan:** Lighthouse penuh, uji screen reader nyata, uji perangkat iOS/Android fisik, konten SEO mendalam.

---

## Ringkasan

| Tingkat | Jumlah |
|---|---|
| Kritis | 1 |
| Tinggi | 6 |
| Sedang | 9 |
| Rendah | 4 |

> **Koreksi (12 Nov):** temuan awal "emoji 🐴 di title produksi" **dibatalkan** — itu artefak prefix tab pada browser audit, bukan konten situs. HTML asli (`curl`) dan DOM bersih di semua halaman. Tidak ada aksi DB yang diperlukan.

Kualitas dasar kuat: tidak ada overflow horizontal di 320–1440 px, tidak ada font < 12 px, hanya 1 `<h1>` per halaman, `lang="id"`, skip-link ada, `prefers-reduced-motion` dihormati, TTFB ~93 ms dan load ~150 ms. Masalahnya mayoritas **kontras warna, hambatan aksesibilitas keyboard, dan sinyal kepercayaan/konversi** — bukan tata letak.

---

## Kritis

### K1. Paragraf CTA biru & ikon kartu fitur tidak terbaca (token warna tidak ada)
`src/app/(marketing)/page.tsx:250` memakai `text-brand-100`, dan `page.tsx:228` memakai `text-brand-400`. Keduanya **tidak didefinisikan** di `@theme` (`globals.css` hanya punya brand 50/500/600/700), sehingga kelasnya tidak digenerate dan warna jatuh ke inherit (`text-slate-900`/body).

Terverifikasi di live: warna paragraf = `lab(7.78 1.82 -15.05)` di atas `#1B4FD8` → **kontras 2.49:1** (gagal WCAG AA). Ikon 4 kartu "Kenapa NusaBackup" jadi navy gelap di atas navy-950 → praktis tidak terlihat.

- File: `src/app/(marketing)/page.tsx:228`, `:250`, `src/app/(marketing)/loading.tsx:6` (`border-brand-200`, `:151` `border-brand-100`, `ContactInfo.tsx:38` `group-hover:bg-brand-100`, `Footer.tsx:121` `text-brand-400`).
- Perbaikan: tambahkan `--color-brand-100/200/400` ke `@theme` **atau** ganti ke token yang ada: paragraf → `text-brand-50` (5.95:1) atau `text-white/90`; ikon → `text-brand-400` setelah token didefinisikan (7.59:1 di navy-950).
- Dampak: cacat visual paling kelihatan di halaman terpenting (CTA penutup).

---

## Tinggi

### T1. Modal lead form tidak menahan fokus (WCAG 2.4.3 / 2.1.2)
`src/components/marketing/LeadFormModal.tsx:31-47` — komentar menyebut "Trap focus" tetapi handler hanya menangani `Escape`. Hasil uji live (390 px):
- Saat modal terbuka, `document.activeElement` = `BODY` (tidak ada autofocus).
- Tab 1–6 berjalan ke elemen **di belakang modal**: skip-link, logo, tombol (menu), `Beranda`, `Lihat Paket`, tombol trigger kartu — padahal `aria-modal="true"`.
- `dialogRef` di-declare tapi tidak dipakai.
- Tombol tutup 32×32 px (< 44 px).

Perbaikan: fokuskan field pertama saat open, loop Tab di dalam dialog, kembalikan fokus ke trigger saat close; atau ganti ke `Dialog` (base-ui/shadcn) yang sudah menangani ini.

### T2. Tiga badge "PALING POPULER" sekaligus
Semua paket featured (`is_featured=true`) dirender dengan badge emas + border brand. Di homepage muncul **3** badge di satu layar (terverifikasi: `document.body.innerText.split('PALING POPULER').length-1 === 3`). "Paling populer" jadi kehilangan makna dan hierarki antar-kartu datar.

Tambahan: teks putih di `bg-gold-500` = **2.94:1** (gagal AA untuk teks 12 px bold). Alternatif: teks `navy-950` di gold-500 = 6.57:1, atau latar `#8A5F00` + putih = 5.65:1.

Perbaikan: pilih satu paket unggulan per tampilan (atau label per segmen: "Populer untuk RS"), perbaiki kontras badge.

### T3. Dua CTA setara bersaing di setiap kartu + 6 link WhatsApp di homepage
`PackageCard.tsx:132-160`: "Pesan Sekarang" (solid) dan "Hubungi via WhatsApp" (outline hijau, full-width) sama-sama besar. Homepage punya 6 tautan `wa.me` (hero, 3 kartu, blok CTA, footer). Fokus konversi pecah dan WhatsApp mendominasi kesan B2B.

Perbaikan: satu aksi primer per kartu; WhatsApp turunkan jadi ghost/link teks, atau jadikan primer hanya untuk paket high-touch (mis. Kampus/Yayasan, Full DR Managed).

### T4. Kontras teks sekunder gagal AA di banyak tempat
Terverifikasi (rasio terukur):
- Footer tagline `text-slate-600` di navy-900 → **2.19:1**
- Footer copyright `text-slate-500` di navy-900 → **3.48:1**
- `text-slate-400` di atas putih (prefix harga, label segmen kartu, "Atau hubungi langsung:") → **2.56:1**
- Eyebrow `text-brand-500` 12 px di navy-900 → **3.72:1**
- "Tidak termasuk" `text-slate-400` + `opacity-60` di kartu → < 2:1

Perbaikan: naikkan minimal ke `slate-500` (4.76:1 di putih) / `slate-300` (11.16:1 di navy-900); untuk teks kecil di navy pakai `slate-300` atau `white/70`.

### T5. Lead bisa masuk tanpa satu pun kontak yang bisa dihubungi
`src/lib/validations/lead.ts`: `email` dan `phone` keduanya `.optional()`; hanya `name` wajib. Form bisa sukses dengan nama saja → row `leads` tanpa email/telepon tetap memicu email + WhatsApp notifikasi. `preferred_channel` default `whatsapp` walau nomor kosong.

Perbaikan: refinement "minimal salah satu email/phone", validasi format telepon (`^(\+62|62|0)8[1-9][0-9]{6,11}$`), dan bila channel `email` dipilih maka email wajib.

### T6. Tidak ada `og:image` dan `canonical` di semua halaman
Dicek 6 URL: `og:image` = null, `link[rel=canonical]` = null, `twitter:card` tidak ada. Share ke WhatsApp/LinkedIn/X tampil tanpa gambar. `public/` hanya berisi SVG bawaan Next (tidak ada ikon brand / apple-touch-icon).

Perbaikan: tambahkan `metadataBase`, `openGraph.images` (1200×630), `alternates.canonical` per halaman, `twitter.card=summary_large_image`, dan aset ikon di `public/`.

---

## Sedang

### S1. Nol social proof untuk layanan B2B backup
Tidak ada logo klien, testimoni, studi kasus, sertifikasi (ISO 27001 / UU PDP), angka SLA/RTO-RPO konkret, status page, atau visual dashboard. Setengah kanan hero kosong. Klaim (AES-256, RTO/RPO) tanpa bukti = kredibilitas rendah — ini gap konversi terbesar, bukan sekadar estetika.

### S2. Tidak ada Kebijakan Privasi / consent
Form mengumpulkan nama, email, telepon, instansi tanpa tautan privasi atau pernyataan penggunaan data. Untuk konteks kesehatan/pendidikan ini risiko kepatuhan (UU PDP) sekaligus kepercayaan.

### S3. `?segmen=` dari halaman segmen tidak dipakai
`SegmentPageContent.tsx:236` menautkan `/kontak?segmen=umum`, tetapi `kontak/page.tsx` tidak membaca `searchParams` → konteks funnel hilang dan form terkirim tanpa `segment_id/segment_name`.

### S4. Anchor `#paket` tertutup header tetap
Klik "Lihat Paket Layanan" → `scrollY=1464`, `header.bottom=64`, `section.top=0`: 64 px pertama section berada di bawah header. Tidak ada `scroll-margin-top` global.

Perbaikan: `html { scroll-padding-top: 5rem }` atau `scroll-mt-20` pada target anchor.

### S5. Menu mobile tidak lengkap secara a11y
`Navbar.tsx:79-99`: tanpa `aria-expanded`/`aria-controls`; Escape dan klik di luar tidak menutup; `aria-label="Toggle menu"` berbahasa Inggris (langgar konvensi copy ID); tombol 36×36 px.

### S6. Tap target < 44×44 px
Link nav 36 px tinggi, breadcrumb "Beranda" 17 px, ikon sosial 36×36, tombol tutup modal 32×32, radio 24 px (label ikut klik, jadi lebih aman). Perbaiki dengan padding vertikal / `min-h-11`.

### S7. Wordmark logo tidak bold
`Navbar.tsx:40` memakai `font-700` (bukan kelas Tailwind) → computed `font-weight: 400`. Logo kehilangan bobot visual dibanding footer (`font-bold`).

### S8. 404 tanpa navigasi
`src/app/not-found.tsx` hanya berisi angka 404 + satu tombol; tidak ada Navbar/Footer, dan skip-link `#main-content` di root layout menunjuk target yang tidak ada di halaman 404.

### S9. Focus ring nyaris tak terlihat
`globals.css:161-165` memakai `theme(colors.brand-600)` — sintaks v3, tidak resolve untuk token v4. Terverifikasi: computed `outline-color` = `oklab(0.708 … / 0.5)` (abu 50%), bukan brand. Di atas putih ≈ 1.6:1, gagal indikator fokus (WCAG 1.4.11/2.4.11).

Perbaikan: `outline-color: var(--color-brand-600)` (6.65:1 di putih).

---

## Rendah

### R1. Format harga tidak konsisten
Kartu: "Rp 2 jt", "Rp 2.5 jt", "Rp 3 jt". Detail paket: "Rp 2 juta", "Rp 4.5 juta". Pilih satu format (`Intl.NumberFormat('id-ID')` → "Rp 2.000.000" atau "Rp 2 juta") dan konsisten.

### R2. Ikon emoji bercampur SVG
Hero trust bar (🔒⚡🛡️🇮🇩) dan SegmentCard (🏢🎓⚕️) memakai emoji, sementara bagian lain memakai SVG line icon. Render beda per OS/device, bobot visual tidak konsisten.

### R3. Counter "N dari N fitur" selalu sama
Semua paket memiliki 100% fitur `is_included` (7/7, 8/8, 12/12) sehingga label "x dari y fitur" tidak memberi informasi. Begitu juga gaya "fitur tidak termasuk" + `opacity-60` yang tidak pernah terpakai.

### R4. Judul/format meta tidak konsisten
Sebagian title pakai "—", sebagian "|"; detail paket jadi `Bisnis Plus | Umum — NusaBackup` (dua separator). Segmen page menampilkan nama segmen dua kali berdekatan (badge + breadcrumb).

### Housekeeping (bukan UI)
File `next-config.ts` di root repo (owner `root`, isi potongan config + komentar IP Tailscale + `// ... config lainnya`) adalah sisa yang tidak dipakai. `allowedDevOrigins` juga hanya relevan untuk dev.

---

## Yang sudah baik (jangan diubah)

- Tidak ada horizontal overflow di 320/360/390/768/1024/1440 px (dicek `scrollWidth - clientWidth`).
- Tidak ada teks < 12 px; H1 60 px/64.8 line-height di desktop, 1 `<h1>` per halaman.
- Navigasi transparan di atas hero gelap konsisten di semua halaman (tidak ada kasus logo putih di atas putih).
- Skip-link berfungsi, `lang="id"`, `prefers-reduced-motion` dihormati, `:focus-visible` ada (walau warnanya salah — lihat S9).
- Performa server bagus: TTFB 93 ms, FCP/LCP ±224 ms, 38 request, font `display: swap`.
- Error form muncul di `role="alert"` dan terlihat di viewport saat submit (diuji dengan input tidak valid).
- State sukses form menggantikan form + menawarkan lanjut WhatsApp (alur bagus, tidak diuji end-to-end untuk menghindari penulisan lead nyata).

## Status perbaikan (12 Nov 2026)

Sudah dikerjakan di branch `master` (belum di-deploy):

| ID | Perbaikan | Bukti verifikasi |
|---|---|---|
| K1 | Token `brand-100/200/300/400` ditambahkan di `@theme`; paragraf CTA → `brand-50`, ikon → `brand-400` | computed `rgb(238,242,255)` di atas `rgb(27,79,216)` = **5.95:1**; ikon `rgb(96,165,250)` = 7.59:1 |
| T1 | `LeadFormModal`: fokus awal ke field pertama, Tab loop di dalam dialog, Escape menutup, fokus kembali ke trigger, close 44×44, `aria-describedby` | 14× Tab semuanya `in:dialog`; Escape → fokus balik ke "Pesan Sekarang" |
| T4 | Kontras: footer bar → `slate-400`, prefix/tag/`text-slate-400` → `slate-500`, eyebrow → `brand-300`, badge emas pakai teks `navy-950` | badge `rgb(6,14,29)` di atas `rgb(202,138,4)` = **6.57:1** |
| T5 | `leadSchema`: wajib minimal salah satu email/telepon + validasi format nomor; nomor dinormalisasi sebelum simpan | submit nama saja → *"Isi minimal salah satu: nomor WhatsApp atau email."* |
| T6 | `metadataBase`, `canonical` per halaman, `og:image` 1200×630 (`public/og.png`), `twitter:summary_large_image` | meta terverifikasi: `og:image=https://nusabackup.id/og.png`, `og:image:width=1200`, canonical ada |
| S4 | `scroll-padding-top: 5rem` | klik "Lihat Paket Layanan" → section top **80 px**, gap 16 px dari header (sebelumnya −64) |
| S5 | Navbar: `aria-expanded`/`aria-controls`, label ID, Escape + klik luar menutup, `aria-current` | Escape menutup & fokus balik ke toggle; klik luar menutup |
| S6 | Tap target: link nav `min-h-11`, hamburger 44×44, tombol tutup modal 44×44, 404 links 44 px | hamburger terukur 44×44 |
| S7 | `font-700` → `font-bold` | computed logo `700` |
| S8 | `/not-found`: `id="main-content"` + tautan segmen, target 44 px | terverifikasi ada 4 tautan + heading |
| S9 | Focus ring pakai `var(--color-brand-600)` di luar `@layer base` (agar menang atas `outline-ring/50` Preflight) | semua link nav → `solid 2px rgb(27,79,216)` |
| R1 | Format harga diseragamkan (`Intl.NumberFormat('id-ID')` → "Rp 2,5 juta") | teks kartu "Rp 2,5 juta", detail "Rp 2,5 juta" |
| T2 | Badge "PALING POPULER" hanya muncul saat kandidatnya tunggal (`showFeaturedBadge`); homepage lintas segmen kini tanpa badge, kartu setara | home: 0 badge, 3 kartu border sama; `/umum`: 1 badge dari 2 kartu; detail paket: 1 badge |
| T3 | Satu CTA primer per kartu ("Pesan Sekarang"); WhatsApp diturunkan jadi tautan teks `atau tanya via WhatsApp`; kartu non-unggulan pakai CTA outline saat ada kartu unggulan | `/umum`: kartu unggulan `bg brand-600`, kartu lain `border navy-900` (transparan); tiap kartu 1 `<button>` + 1 link teks |
| R4 (tag) | Tag segmen disembunyikan di halaman segmen (tidak berulang dengan judul & breadcrumb) | `/umum` tidak lagi menampilkan chip "UMUM" di tiap kartu |
| — | Temuan tambahan saat uji: input pengguna **hilang** setelah error validasi (React reset form action) — sekarang di-restore | nama/instansi/telepon tetap terisi setelah error |
| Housekeeping | `next-config.ts` (sisa config root-owned) dihapus | `pnpm lint` bersih |

**Verifikasi:** `pnpm lint` 0 error, `pnpm build` sukses (19 rute, semua halaman statis/SSG seperti sebelumnya). Uji browser dilakukan pada build produksi lokal dengan mock PostgREST (DB produksi tidak dapat dijangkau dari mesin ini).

### Belum dikerjakan (butuh keputusan desain/konten)

- **S1** Social proof (logo klien, testimoni, sertifikasi, angka SLA).
- **S2** Halaman kebijakan privasi + consent form.
- **S3** `?segmen=` masih belum dipakai halaman kontak untuk mengisi konteks.
- **R2** Ikon emoji vs SVG, **R3** counter "N dari N fitur", **R4** konsistensi separator title.
- **Konten:** prefix harga tidak seragam di CMS ("Mulai dari" vs "Mulai"), urutan segmen kartu mengikuti `sort_order` DB.

## Rekomendasi urutan perbaikan (sisa)
1. S1 + S2 (social proof & privasi) — konten.
2. S3 (prefill segmen) + R2–R4 — cleanup berikutnya.
3. Rapikan copy di CMS: prefix harga seragam.

