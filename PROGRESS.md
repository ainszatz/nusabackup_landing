# PROGRESS — NusaBackup

- [x] Sesi 0 — Setup & Config
- [x] Sesi 1 — DB Schema, RLS, Seed, Types
- [ ] Sesi 2 — Marketing Foundation + Home
- [ ] Sesi 3 — Segment + Package Detail + SEO
- [ ] Sesi 4 — Lead Engine
- [ ] Sesi 5 — Admin Auth + Dashboard + Leads
- [ ] Sesi 6 — CMS Segments + Packages
- [ ] Sesi 7 — CMS Settings + Polish + Docker

## Catatan / Deviasi / TODO

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
