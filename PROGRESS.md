# PROGRESS — NusaBackup

- [x] Sesi 0 — Setup & Config
- [x] Sesi 1 — DB Schema, RLS, Seed, Types
- [x] Sesi 2 — Marketing Foundation + Home
- [x] Sesi 3 — Segment + Package Detail + SEO
- [ ] Sesi 4 — Lead Engine
- [ ] Sesi 5 — Admin Auth + Dashboard + Leads
- [ ] Sesi 6 — CMS Segments + Packages
- [ ] Sesi 7 — CMS Settings + Polish + Docker

## Catatan / Deviasi / TODO

### Sesi 3 — Segment + Package Detail + SEO

**Halaman dibuat:**
- `/umum`, `/pendidikan`, `/kesehatan` — segment hero (navy + color accent), breadcrumb, description, full package grid
- `/[segment]/[package]` — package detail: breadcrumb, price, feature grid 2-col (all features), dual CTA; `generateStaticParams` covers 8 packages
- `/kontak` — contact info + `#lead-form-mount` placeholder div (clearly marked for Sesi 4)

**SEO:**
- `generateMetadata` per route → DB `meta_title`/`meta_description` → `site_settings` fallback
- `title: { absolute: ... }` dipakai untuk DB-sourced titles agar tidak double-suffix dari template layout
- OG `type: 'website'` + `siteName: 'NusaBackup'` di semua halaman publik
- JSON-LD: Organization (home), Service (segment pages), Product (package detail)
- `sitemap.ts`: home + kontak + 3 segmen + 8 paket aktif — resolved dari DB at build time
- `robots.ts`: allow `/`, disallow `/admin/`

**Komponen baru:**
- `JsonLd.tsx` — renders `<script type="application/ld+json">` dengan `</script>` escape untuk safety
- `SegmentPageContent.tsx` — shared server component + `buildSegmentMetadata()` helper (dipakai semua 3 segment pages)

**Query baru:**
- `getAllActivePackages()` — semua paket aktif dengan segment join, tag `packages` (untuk sitemap + generateStaticParams)

**Deviasi / catatan:**
- `NEXT_PUBLIC_SITE_URL` digunakan sebagai base URL di sitemap/robots/JSON-LD; fallback ke `https://nusabackup.id`. Perlu diisi di `.env.local` untuk deploy.
- Package detail JSON-LD menggunakan `@type: Product` (bukan Service) karena lebih sesuai untuk halaman paket harga individual

---

### Sesi 2 — Marketing Foundation + Home

**Komponen dibuat:**
- `Navbar.tsx` — sticky scroll-aware, transparent on hero, hamburger mobile menu
- `Footer.tsx` — dark navy, 4-col grid, socials (Instagram, LinkedIn)
- `Hero.tsx` — full-bleed navy, dot-grid pattern, radial glow, trust signals, wave bottom
- `SegmentCard.tsx` — colored accent per slug (umum=blue, pendidikan=emerald, kesehatan=rose)
- `PackageCard.tsx` — price format IDR (juta shorthand), feature checklist, WA deep-link
- `ContactInfo.tsx` — WA / email / address dari settings

**Query layer** (`lib/queries/`):
- `segments.ts` — `getActiveSegments`, `getSegmentBySlug` · cache tag `segments`
- `packages.ts` — `getFeaturedPackages`, `getPackagesBySegment`, `getPackageBySlug` · cache tag `packages`
- `settings.ts` — `getPublicSettings`, `getAllSettings` · cache tag `settings`
- Semua dibungkus `unstable_cache` dari `next/cache`; menggunakan plain `createClient` (bukan SSR) karena `cookies()` tidak bisa dipanggil dalam callback cache

**Home page** (`app/(marketing)/page.tsx`):
- Hero → Segmen Grid → Featured Packages (`id="paket"`) → Why NusaBackup → CTA block
- Data diambil paralel dengan `Promise.all`

**Deviasi / catatan:**
- `PackageCard` menerima `waNumber` sebagai prop (bukan dari context) agar tetap server component
- Price formatting: amount ≥ 1 juta ditampilkan sebagai "X jt" untuk kompaksi
- `bg-white/8` di why-section (Tailwind v4 opacity shorthand)

---

### Sesi 1 — DB Schema, RLS, Seed, Types

**Supabase project:** `nusabackup` · ID: `jskugzbbohcvamscvpkd` · Region: ap-southeast-1

**Cara apply ulang dari awal (jika reset DB):**
1. Jalankan migrasi: `supabase/migrations/20260613000000_initial_schema.sql` lewat Supabase SQL Editor atau `pnpm dlx supabase db push`
2. Jalankan seed: `supabase/seed.sql` lewat Supabase SQL Editor

**Hasil seed:** 3 segmen, 8 paket, 67 fitur paket, 9 site_settings

**Deviasi dari PRD schema:**
- `packages` ditambah kolom `icon text` (PRD tidak ada, tapi design-spec §4 dan §8 menyebutkan icon untuk paket — spec menang)

**Verifikasi RLS:**
- `leads`: 0 anon policy ✓ (hanya `authenticated` — SELECT/UPDATE/DELETE)
- `segments`: anon hanya lihat `is_active = true` ✓
- `site_settings`: anon hanya lihat `is_public = true` ✓

**Storage:**
- Bucket `assets`: public read, 512KB max, jenis: SVG/PNG/WEBP/JPEG

**Env vars yang perlu diisi manual:**
- `SUPABASE_SERVICE_ROLE_KEY`: ambil dari Supabase dashboard → Project Settings → API → service_role key
- URL & anon key sudah terisi di `.env.local`

### Sesi 0 — Versi & Deviasi
- **Next.js**: 16.2.9 (latest, bukan 15 — spec bilang 15 tapi `create-next-app@latest` install 16)
- **React**: 19.2.4
- **Tailwind**: 4.3.1 (v4, bukan v3 — shadcn/ui init sudah support Tailwind 4)
- **@supabase/ssr**: 0.12.0
- **@supabase/supabase-js**: 2.108.1
- **zod**: 4.4.3
- **TypeScript**: 5.9.3
- **Deviasi**: Next.js 16 mengganti `middleware.ts` → `proxy.ts` dan fungsi export `middleware` → `proxy`. Semua referensi ke "middleware" di session selanjutnya perlu pakai `proxy.ts`.
- `lib/supabase/server.ts` dibuat `async` karena `cookies()` di Next.js 16 mengembalikan Promise.
- `types/database.ts` berisi placeholder `Database` type — akan di-replace di Sesi 1 via `supabase gen types`.
