# Audit UI/UX, Aksesibilitas & Deploy — NusaBackup

- **Target:** `~/nusa/nusabackup_landing` + https://nusabackup.id (Docker + Cloudflare Tunnel)
- **Terakhir diperbarui:** 13 November 2026
- **Metode:** inspeksi kode + verifikasi di browser (320–1440 px) atas build produksi; pengukuran computed style/DOM, uji keyboard, uji query DB langsung. Area admin diuji dengan user sementara (dibuat lewat service role, dihapus setelah uji — `leftover=false`).
- **Dokumen ini** = status terkonsolidasi. Log temuan per tanggal ada di `docs/ui-ux-audit-2026-11-11.md`.

Legenda: **CLEAR** = sudah diperbaiki & diverifikasi live · **OPEN** = belum dikerjakan · **BLOCKED** = menunggu keputusan/akses.

---

## Ringkasan

| Area | Clear | Open |
|---|---|---|
| Marketing publik | 20 | 6 |
| Admin | 14 | 7 |
| Deploy / infra | 4 | 4 |

Kualitas dasar yang sudah baik: tanpa overflow horizontal 320–1440 px, tanpa teks < 12 px, satu `<h1>` per halaman, `lang="id"`, skip-link, `prefers-reduced-motion`, TTFB ~93 ms, LCP ~224 ms.

---

## 1. Marketing publik

### CLEAR

| # | Temuan | Perbaikan | Bukti |
|---|---|---|---|
| M1 | `text-brand-100`/`text-brand-400` tidak ada di `@theme` → paragraf CTA navy di atas biru (2.49:1), ikon fitur tak terlihat | Token brand 100–400 ditambahkan; paragraf → `brand-50`, ikon → `brand-400` | Kontras **5.95:1** (paragraf), ikon 7.59:1 |
| M2 | Modal lead form tanpa focus trap; `aria-modal="true"` tapi Tab keluar ke halaman belakang | Fokus awal ke field pertama, Tab loop di dialog, Escape menutup, fokus balik ke trigger, close 44×44 | 14× Tab semuanya `in:dialog`; Escape → fokus ke “Pesan Sekarang” |
| M3 | Badge “PALING POPULER” muncul 3× di homepage (semua paket featured) | Badge hanya tampil saat kandidat tunggal; home jadi 3 kartu setara | Home 0 badge, `/umum` 1 badge |
| M4 | Dua CTA setara per kartu + 6 tautan WhatsApp di homepage | Satu CTA primer; WhatsApp jadi tautan teks; CTA kartu non-unggulan jadi outline | `/umum`: 1 tombol solid + 1 outline + 1 tautan WA |
| M5 | Kontras teks sekunder gagal AA (footer 2.19:1, copyright 3.48:1, slate-400 di putih 2.56:1, eyebrow 3.72:1, badge emas 2.94:1) | Semua dinaikkan (`slate-400`→`slate-500`, footer bar `slate-400`, eyebrow `brand-300`, badge teks `navy-950`) | Badge **6.57:1**; footer ≥ 6.4:1 |
| M6 | Lead bisa masuk tanpa email/telepon | Zod: wajib minimal satu kanal + format nomor `^(\+?62\|0)8\d{7,12}$`, nomor dinormalisasi | Submit nama saja → “Isi minimal salah satu: nomor WhatsApp atau email.” |
| M7 | Tanpa `og:image`, `canonical`, `twitter:card` | `metadataBase`, canonical per halaman, `og.png` 1200×630, `summary_large_image` | `og:image=https://nusabackup.id/og.png`, `og:image:width=1200` |
| M8 | `/kontak?segmen=…` diabaikan | Lookup segmen + banner konteks + hidden `segment_id`/`segment_name` | `?segmen=umum` → banner + `segment_id` UUID asli |
| M9 | Anchor `#paket` tertutup header tetap (−64 px) | `scroll-padding-top: 5rem` | Section top **80 px**, gap 16 px |
| M10 | Menu mobile tanpa `aria-expanded`, tak bisa ditutup Escape/klik luar, label Inggris | `aria-expanded`/`aria-controls`/`aria-current`, Escape + klik luar menutup, label ID, 44×44 | Terverifikasi semua |
| M11 | Tap target < 44 px (nav 36 px, hamburger 36 px, close modal 32 px, link 404) | `min-h-11` di nav/logo/CTA/hamburger/close/404 | Hamburger & close terukur 44×44 |
| M12 | `font-700` bukan kelas Tailwind → wordmark 400 | `font-bold` | Computed `font-weight: 700` |
| M13 | 404 tanpa navigasi; skip-link menunjuk target yang tidak ada | `#main-content` + tautan segmen + tombol beranda | 4 tautan, target 44 px |
| M14 | Focus ring memakai `theme(colors.brand-600)` (sintaks v3) → abu 50% | `var(--color-brand-600)` di luar `@layer base` | Semua link nav → `solid 2px rgb(27,79,216)` |
| M15 | Format harga campur (“Rp 2 jt” vs “Rp 2 juta”) | `Intl.NumberFormat('id-ID')` → “Rp 2,5 juta” | Kartu & detail konsisten |
| M16 | Emoji sebagai ikon (🔒⚡🛡️🇮🇩, 🏢🎓⚕️) | Ikon SVG (Lucide): trust strip + kartu segmen | **0 emoji** di HTML live |
| M17 | Counter “N dari N fitur” selalu sama; tag segmen berulang | Counter hanya tampil bila ada fitur tak termasuk; tag segmen disembunyikan di halaman segmen | Detail 7/7 → counter tidak dirender |
| M18 | 8 halaman detail paket yatim (hanya ada di sitemap) | Judul kartu + tautan “Lihat detail paket” | 3 kartu home menaut ke detail masing-masing |
| M19 | Deskripsi kartu terpotong di tengah kata (“…”) | Clamp 3 baris + `min-h` setinggi 3 baris; 4 baris di < 360 px | 320/390/768/1440: tidak terpotong, harga tetap sejajar |
| M20 | Isian form hilang setelah error validasi (React reset form action) | Snapshot nilai saat submit + restore setelah error (termasuk checkbox) | Nama/telepon/instansi tetap terisi |

### OPEN

1. **S1 Social proof** — belum ada logo klien, testimoni, studi kasus, sertifikasi (ISO 27001/UU PDP), atau angka SLA/RTO-RPO konkret. *Dampak terbesar; butuh materi dari pemilik bisnis.*
2. **Tinjauan isi kebijakan privasi** — `/privasi` sudah lengkap secara struktur, tapi bagian **retensi 24 bulan, entitas hukum, kontak DPO** perlu dipastikan sebelum dianggap final.
3. **Bukti consent permanen** — saat ini ditulis ke `admin_notes` (timestamp ISO). Kolom khusus butuh migrasi:
   `alter table public.leads add column consent_at timestamptz, add column consent_version text;`
4. **`og:image` masih satu gambar generik** untuk semua URL (belum per segmen/paket).
5. **Sisa tap target < 44 px** — tautan teks kartu (24–32 px, masih lolos minimum 24 px WCAG 2.5.8).
6. **Belum pernah diuji**: Lighthouse penuh, screen reader nyata (NVDA/VoiceOver), visual regression.

---

## 2. Admin (`/admin`)

### CLEAR

| # | Temuan | Perbaikan |
|---|---|---|
| A1 | Sidebar tanpa status halaman aktif | `aria-current="page"` + highlight |
| A2 | Sidebar 224 px dipaksa di mobile | Bar horizontal 121 px; `main` full-width 390 px |
| A3 | Kontras empty state `slate-400` (2.56:1) | `slate-500` di dashboard/leads/segmen/paket |
| A4 | `ActiveToggle` berlabel generik | Label spesifik per paket/segmen |
| A5 | Select filter leads tanpa label | `aria-label="Filter status lead"` |
| A6 | Harga tabel admin “IDR 2.000.000 bulan” | “Rp 2.000.000 /bulan” |
| A7 | Login: error tidak diumumkan, tanpa `aria-invalid`, tanpa jalan kembali | `role="alert"`, `aria-invalid`/`aria-describedby`, autofocus email, tautan “← Kembali ke situs” |
| A8 | Form filter tanpa peran & input pencarian tanpa nama aksesibel | `role="search"` + `aria-label` |
| A9 | Umpan balik status/catatan tanpa `role`, warna `green-600` (≈3.1:1) | `role="status"`/`role="alert"`, `green-700` |
| A10 | Timestamp aktivitas lead `slate-400` (2.56:1) | `slate-500` |
| A11 | `getLeadsFiltered` memuat semua lead | `count: 'exact'` + `.range()`, 25/halaman, pager mempertahankan filter |
| A12 | Tabel tanpa nama aksesibel | `aria-label` pada 4 tabel (lead terbaru, daftar lead, paket per segmen, segmen) |
| A13 | Semua tab admin memakai title marketing | Template `%s \| Admin NusaBackup` + title per halaman; `/admin` pakai `absolute`; `robots: noindex, nofollow` |
| A14 | Halaman 403 tanpa jalan keluar | Tombol Keluar + tautan “Kembali ke situs” |

### OPEN

1. **Kontrol < 44 px** — switch 18 px, tombol `size="sm"`/ikon 28 px (lolos 24 px, kurang nyaman di layar sentuh).
2. **Login**: belum ada show/hide password dan alur lupa password (reset manual lewat Supabase).
3. **Detail lead belum diuji end-to-end dengan sesi login** — perbaikan aria/kontras sudah masuk, tapi alur ubah status & catatan belum dijalankan penuh.
4. **Dashboard** — 6 kartu statistik tanpa rentang waktu/trend dan tanpa aksi cepat.
5. **Audit log CMS** — perubahan paket/segmen/pengaturan tidak mencatat pelaku.
6. **Pencarian** di halaman Paket/Segmen belum ada (wajar selama katalog kecil).
7. **Pager lead belum tampil dengan data nyata** — tabel `leads` produksi masih 0 baris; logika query sudah diuji langsung ke DB.

---

## 3. Deploy / infra

### CLEAR

| # | Temuan | Perbaikan |
|---|---|---|
| D1 | “Deploy ulang” tidak mengubah situs | Penyebab: container hanya di-restart; image 2 bulan lama. Prosedur benar: `docker compose up -d --build` |
| D2 | `docker build` gagal — `ERR_PNPM_IGNORED_BUILDS` | `pnpm-workspace.yaml` ikut di-COPY sebelum `pnpm install` |
| D3 | `ERR_UNKNOWN_BUILTIN_MODULE` saat install | Base image `node:22-alpine` + `packageManager: pnpm@11.7.0` |
| D4 | Tanpa `.dockerignore` → `node_modules` host menimpa hasil stage deps | `.dockerignore` ditambahkan |

Tambahan: `.env.production` dibuat dari `.env.example`/`.env.local` (gitignored, mode 600), README diperbaiki (nama file env + catatan `--build` wajib).

### OPEN

1. **Healthcheck** di `docker-compose.yml` (status “up” saat ini hanya berarti proses hidup).
2. **Pipeline deploy** — masih manual (build + recreate di host ini).
3. **`.env.production.example`** — README menyebut `.env.example`, belum ada contoh khusus produksi.
4. **`next.config.ts`** masih memuat `allowedDevOrigins` (dev-only) dan belum di-commit — perubahan lokal pemilik repo.

---

## Verifikasi yang dijalankan

- `pnpm lint` → 0 error, 0 warning.
- `pnpm build` → sukses, 19 rute (halaman publik statis/SSG, admin dinamis).
- Browser: 320/360/390/768/1024/1440 px; cek overflow, ukuran tap target, font < 12 px, kontras computed, urutan Tab, perangkap fokus, Escape/klik luar.
- Live: penanda build unik dicek via `curl` (mis. `Lihat detail paket`, `og.png`, `PALING POPULER` = 0 di home), bukan asumsi cache.
- DB: query count/range diuji langsung dengan service role.
- Sesi uji admin: user sementara dibuat → diverifikasi → dihapus (`leftover=false`).

**Koreksi penting:** temuan awal “emoji 🐴 di title produksi” **dibatalkan** — itu artefak prefix tab di browser audit, bukan konten situs (HTML `curl` bersih).

---

## Riwayat commit terkait

```
65ca548 fix(admin): title dashboard pakai absolute agar template tidak dilewati
0cd3983 feat(admin): pagination lead, label tabel, title per halaman, escape hatch 403
ebccf63 feat(privacy,ui,admin): simpan bukti consent, normalisasi harga, aksesibilitas admin
832e9ba feat(marketing,admin): kebijakan privasi + consent, ikon SVG, perbaikan admin
3631297 feat(marketing): tautkan kartu ke detail paket dan pakai konteks segmen
f493de8 fix(deploy): docker build gagal sehingga deploy tidak pernah ter-update
f8d397c fix(ui): deskripsi kartu paket tampil utuh tanpa elipsis
bd682ce fix(ui): perbaiki kontras, focus trap modal, dan hierarki CTA paket
```

## Urutan perbaikan berikutnya (usulan)

1. **Materi social proof** + finalisasi kebijakan privasi (konten, dampak konversi & kepatuhan).
2. **Migrasi `consent_at`/`consent_version`** lalu pindahkan bukti consent dari `admin_notes`.
3. **Uji end-to-end detail lead** dengan akun admin + tambah audit log CMS.
4. **Pagination diuji dengan data nyata** + `og:image` per segmen/paket.
5. **Ops**: healthcheck + pipeline deploy, lalu Lighthouse & uji screen reader.
