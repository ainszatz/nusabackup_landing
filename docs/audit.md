# Audit UI/UX, Aksesibilitas, Keamanan & Deploy — NusaBackup

- **Target:** `E:\newProject\supernova\NusaBackup` + https://nusabackup.id (Docker + Cloudflare Tunnel)
- **Terakhir diperbarui:** 13 November 2026
- **Metode:** inspeksi kode, `eslint`, `tsc --noEmit`, unit test, `next build`, dan verifikasi HTTP pada server produksi lokal. Audit browser (320–1440 px, keyboard, kontras) terakhir dijalankan 11 November 2026 atas build produksi saat itu.
- **Dokumen ini** = status terkonsolidasi. Log temuan per tanggal ada di `docs/ui-ux-audit-2026-11-11.md`.

Legenda: **CLEAR** = sudah diperbaiki & diverifikasi · **OPEN** = belum dikerjakan · **BLOCKED** = menunggu keputusan/akses/migrasi.

---

## Ringkasan

| Area | Clear | Open | Blocked |
|---|---|---|---|
| Marketing publik | 20 | 5 | 0 |
| Admin | 14 | 7 | 0 |
| Deploy / infra | 6 | 1 | 0 |
| Hardening keamanan & kualitas | 11 | 1 | 0 |

Kualitas dasar yang sudah baik: tanpa overflow horizontal 320–1440 px, tanpa teks < 12 px, satu `<h1>` per halaman, `lang="id"`, skip-link, `prefers-reduced-motion`, TTFB ~93 ms, LCP ~224 ms. Build produksi bersih (0 error lint/TS), 9 unit test lulus, dan 8 halaman detail paket tetap ter-prerender.

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

1. **OPEN — Social proof**: belum ada logo klien, testimoni, studi kasus, sertifikasi (ISO 27001/UU PDP), atau angka SLA/RTO-RPO konkret. *Dampak terbesar; butuh materi dari pemilik bisnis.*
2. **OPEN — Tinjauan isi kebijakan privasi**: `/privasi` sudah lengkap secara struktur, tapi bagian **retensi 24 bulan, entitas hukum, kontak DPO** perlu dipastikan sebelum dianggap final.
3. **OPEN — `og:image`** masih satu gambar generik untuk semua URL (belum per segmen/paket).
4. **OPEN — Sisa tap target < 44 px**: tautan teks kartu (24–32 px, masih lolos minimum 24 px WCAG 2.5.8).
5. **OPEN — Belum pernah diuji**: Lighthouse penuh, screen reader nyata (NVDA/VoiceOver), visual regression.

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
2. **Login**: belum ada show/hide password dan alur lupa password (reset manual lewat Supabase). Rate limit login sudah ditambahkan (lihat §4).
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
| D1 | “Deploy ulang” tidak mengubah situs | Penyebab: container hanya di-restart; image 2 bulan lama. Prosedur benar: `docker compose --env-file .env.production up -d --build` |
| D2 | `docker build` gagal — `ERR_PNPM_IGNORED_BUILDS` | `pnpm-workspace.yaml` ikut di-COPY sebelum `pnpm install` |
| D3 | `ERR_UNKNOWN_BUILTIN_MODULE` saat install | Base image `node:22-alpine` + `packageManager: pnpm@11.7.0` |
| D4 | Tanpa `.dockerignore` → `node_modules` host menimpa hasil stage deps | `.dockerignore` ditambahkan |
| D5 | Container tanpa healthcheck | `healthcheck` Node `fetch('/')`, interval 30 s, 3 retry, start period 20 s |
| D6 | Belum ada contoh env produksi | `.env.production.example` + pengecualian `.gitignore`; README menjelaskan `--env-file` |

Tambahan: build args `NEXT_PUBLIC_*` sekarang memakai guard `${VAR:?…}` sehingga build gagal cepat bila nilainya kosong, bukan membakar string kosong ke bundle client. `.env.production` dibuat dari `.env.example`/`.env.local` (gitignored, mode 600).

### OPEN

1. **Pipeline deploy** — masih manual (build + recreate di host ini).
2. **Verifikasi container** — `docker build`/`compose up` tidak dapat dijalankan di mesin pengembangan ini (Docker tidak terpasang; eksekusi `standalone server.js` di Windows gagal karena `EPERM` symlink pnpm). Healthcheck dan header perlu diverifikasi sekali di host deploy.

---

## 4. Hardening keamanan & kualitas (13 November 2026)

### CLEAR

| # | Perubahan | Detail | File |
|---|---|---|---|
| H1 | Rate limit login | 5 percobaan / 15 menit per hash IP klien; limiter terpisah dari lead | `src/lib/rateLimit.ts`, `src/actions/auth.ts` |
| H2 | CSP & header produksi | `unsafe-eval` hanya di development; tambah HSTS, `Permissions-Policy`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`; `X-Powered-By` dimatikan | `next.config.ts` |
| H3 | Proxy hanya untuk admin | Matcher `/admin` + `/admin/:path*`; halaman publik tidak lagi memanggil Supabase Auth per request | `src/proxy.ts` |
| H4 | Robustness input lead | Honeypot tidak lagi salah menolak field yang absen; status lead divalidasi enum sebelum update | `src/actions/leads.ts` |
| H5 | Robustness fitur paket | `JSON.parse` dibungkus `try/catch` → pesan validasi, bukan error 500 | `src/actions/packages.ts` |
| H6 | Query efisien | Ringkasan status memakai HEAD count per status; `getPackageBySlug` memfilter per segmen sehingga slug duplikat antar-segmen aman; `getAllSettings` (dead code, anon client) dihapus | `src/lib/queries/*` |
| H7 | Unit test | 9 test `node:test` untuk `leadSchema` dan `normalizePricePrefix`; script `pnpm test` | `tests/unit/*`, `package.json` |
| H8 | Tooling lokal | `node_modules` disinkronkan dengan pnpm 11.7.0; `allowImportingTsExtensions` untuk test | `tsconfig.json` |
| H9 | Dokumen agen | `AGENTS.md` menjadi sumber aturan proyek (update Next 16); `CLAUDE.md` menjadi bridge `@AGENTS.md` | `AGENTS.md`, `CLAUDE.md` |
| H10 | Migrasi consent diterapkan | `consent_at timestamptz` + `consent_version text` aktif di produksi; diverifikasi via `information_schema` dan PostgREST | `supabase/migrations/20261113000001_add_lead_consent_columns.sql` |
| H11 | RLS fitur paket diterapkan | Policy `read active package features` aktif; policy lama `read package features` sudah tidak ada. Diverifikasi via `pg_policies` | `supabase/migrations/20261113000002_restrict_package_features_read.sql` |

### OPEN

1. **Duplikasi skill Supabase** — `.agents/skills/supabase` dan `.claude/skills/supabase` identik byte-per-byte. Perlu keputusan sumber kanonik sebelum salah satu dihapus.

---

## 5. Verifikasi yang dijalankan

- `pnpm lint` → **0 error, 0 warning**.
- `pnpm exec tsc --noEmit` → **0 error** (setelah types digenerate ulang).
- `pnpm test` → **9/9 lulus** (200–250 ms).
- `pnpm build` → **sukses**, 19 rute; 8 halaman detail paket ter-prerender (SSG).
- `supabase db push --remote --yes` → 2 migrasi diterapkan. Histori migrasi remote direkonsiliasi lebih dulu (3 versi lama ↔ 3 versi lokal) tanpa menjalankan ulang `initial_schema`.
- `supabase db query --read-only` → `consent_at timestamptz` + `consent_version text` ada; `pg_policies` hanya memuat `read active package features` + `staff manage features`; RLS `leads` & `package_features` = true.
- `supabase gen types` → `src/types/database.ts` digenerate ulang dari schema produksi.
- `next start` (port 3101) → HTTP 200 dengan header:
  - CSP produksi **tanpa** `unsafe-eval`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
  - `X-Powered-By` tidak ada
- Live `https://nusabackup.id` (13 Nov): 200 via Cloudflare, `/privasi` 200, `/admin` → 307 login, `og.png` 200, marker build terbaru ada. `/umum` tetap 200 dan menampilkan fitur/harga setelah perubahan RLS.
- Browser: audit terakhir 11 November (320/360/390/768/1024/1440 px, kontras computed, urutan Tab, focus trap, Escape/klik luar). Tidak diulang pada pass ini.
- **Tidak dijalankan:** `docker build`/`docker compose` (Docker tidak tersedia di mesin ini), Lighthouse, dan screen reader nyata.

---

## 6. Perubahan pada pass ini (ringkas)

```
fix(git)        merge 9 commit remote + push 4 commit (working tree & histori konsisten)
fix(deploy)     guard build args NEXT_PUBLIC_*, README --env-file, healthcheck, env contoh
fix(queries)    getPackageBySlug per segmen; status summary pakai count; hapus dead code
fix(security)   CSP produksi, HSTS, Permissions-Policy, proxy /admin, rate limit login
fix(leads)      honeypot null-safe, validasi enum status, consent terstruktur + fallback
fix(packages)   JSON.parse aman untuk data fitur
test            unit test leadSchema + normalizePricePrefix (node:test)
docs            AGENTS.md kanonik, CLAUDE.md bridge, audit.md diperbarui
chore(types)    regenerate src/types/database.ts dari schema produksi
```

---

## 7. Urutan perbaikan berikutnya (usulan)

1. **Deploy build baru** di homelab dengan `docker compose --env-file .env.production up -d --build`, lalu cek healthcheck dan header di domain live. Kedua migrasi sudah diterapkan 13 Nov 2026.
2. **Materi social proof** + finalisasi kebijakan privasi (konten, dampak konversi & kepatuhan).
3. **Uji end-to-end detail lead** dengan akun admin + tambah audit log CMS.
4. **Lighthouse & uji screen reader**, lalu pagination dengan data lead nyata.
5. **Putuskan konsolidasi skill** Supabase (`.agents` vs `.claude`).
6. **Pipeline deploy** otomatis (build + recreate) bila deploy manual mulai sering.
