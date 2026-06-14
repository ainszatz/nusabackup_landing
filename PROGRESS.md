# PROGRESS — NusaBackup

- [x] Sesi 0 — Setup & Config
- [x] Sesi 1 — DB Schema, RLS, Seed, Types
- [x] Sesi 2 — Marketing Foundation + Home
- [x] Sesi 3 — Segment + Package Detail + SEO
- [x] Sesi 4 — Lead Engine
- [x] Sesi 5 — Admin Auth + Dashboard + Leads
- [x] Sesi 6 — CMS Segments + Packages
- [x] Sesi 7 — CMS Settings + Polish + Docker  ← **MVP COMPLETE**
- [x] QA Audit — Full static + runtime QA, semua invariant verified  ← **MVP VERIFIED**

## Catatan / Deviasi / TODO

### QA Audit — 2026-06-14

**Hasil:** 33 checks, 31 PASS, 4 FIXED, 0 outstanding security gaps.

**Defect yang diperbaiki:**
- `PackageFormDialog.tsx` + `SegmentFormDialog.tsx`: 4 ESLint errors (`react-hooks/set-state-in-effect`) — diperbaiki dengan `startTransition()` wrapper.

**Outstanding TODOs (pasca-MVP, non-blocker):**
1. `src/actions/leads.ts`: `verifyStaff()` diduplikasi secara lokal, seharusnya import dari `lib/server/verify-staff.ts`. Fungsional identik, tidak ada security gap, tapi DRY violation.
2. Lighthouse audit — harus dijalankan setelah deploy ke production domain.
3. OG image dinamis per halaman — optional enhancement.
4. Editor role — schema siap, belum ada UI assignment.

**File QA Report:** `QA-REPORT.md` di root repo.

---

### Sesi 7 — CMS Settings + Polish + Docker

**File baru / diperbarui:**
- `src/lib/validations/settings.ts` — Zod schema untuk 9 setting keys
- `src/actions/settings.ts` — `updateSettings`: verifyStaff + upsert per key + `revalidateTag('settings', 'default')`. Ditandai `import 'server-only'`.
- `src/app/(admin)/admin/settings/page.tsx` — RSC: baca semua settings via SSR client (force-dynamic)
- `src/app/(admin)/admin/settings/SettingsForm.tsx` — Client form dengan `useActionState(updateSettings)`; 3 fieldset: kontak publik, notifikasi admin, SEO default
- `src/components/admin/AdminSidebar.tsx` — Hapus `disabled: true` dari link Settings; hapus dead code conditional branch
- `src/app/not-found.tsx` — Halaman 404 custom (nav kembali ke beranda)
- `src/app/(admin)/admin/loading.tsx` — Skeleton loading untuk admin pages
- `src/app/(marketing)/loading.tsx` — Spinner loading untuk marketing pages
- `src/app/globals.css` — Tambah `focus-visible` ring (WCAG 2.4.7), `.skip-link`, `prefers-reduced-motion` (WCAG 2.3.3)
- `src/app/layout.tsx` — Tambah skip-link "Lewati ke konten utama"
- `src/app/(marketing)/layout.tsx` — `id="main-content"` pada `<main>`
- `src/app/(admin)/admin/layout.tsx` — `id="main-content"` pada `<main>`
- `next.config.ts` — Tambah `output: 'standalone'` untuk Docker
- `Dockerfile` — Multi-stage: deps → builder (bake NEXT_PUBLIC_* via ARG) → runner (node:20-alpine, non-root user nextjs:1001)
- `docker-compose.yml` — Single `web` service, env_file `.env.production`, port 3000
- `.env.production.example` — Template env untuk produksi
- `README.md` — Deploy guide: Docker, Cloudflare Tunnel, first-admin-user SQL

**Security invariants (confirmed):**
- `import 'server-only'` ada di: `admin.ts`, `notifications/email.ts`, `notifications/whatsapp.ts`, `actions/settings.ts`, `actions/assets.ts`, `lib/server/verify-staff.ts`
- CSP + security headers sudah ada di `next.config.ts` sejak awal
- `settings.ts` action: verifyStaff() dipanggil pertama, sebelum mutasi apa pun

**Deviasi / catatan:**
- `getAllSettings` di queries/settings.ts menggunakan anon client (sudah ada sejak Sesi 2). Settings page admin menggunakan SSR client langsung (force-dynamic) untuk konsistensi — tidak perlu cache karena admin page selalu fresh.
- Docker build: `NEXT_PUBLIC_*` di-bake ke image via build ARG (Next.js requirement: public vars harus tersedia saat build). Runtime secrets (`SUPABASE_SERVICE_ROLE_KEY` dll.) inject via `.env.production` at runtime.
- `output: 'standalone'` ditambahkan ke next.config.ts — menghasilkan `server.js` minimal tanpa harus copy seluruh `node_modules` ke container runner.

**TODO pasca-MVP (opsional):**
- Lighthouse audit manual setelah deploy ke domain nyata (tidak bisa dijalankan dari localhost/docker)
- Penambahan OG image dinamis per halaman
- Editor role (schema sudah ada, tapi belum diaktifkan di MVP)
- Analitik (Plausible/Umami self-hosted)

---

### Sesi 5 — Admin Auth + Dashboard + Leads

**File baru:**
- `src/actions/auth.ts` — `loginAction` + `logoutAction` (SSR Supabase auth)
- `src/actions/leads.ts` — tambah `updateLeadStatus` + `addLeadNote` (verify session+role, write lead_activities)
- `src/lib/leads-config.ts` — `LEAD_STATUSES` constant + `LeadStatus` / `LeadChannel` types (client-safe, tanpa server deps)
- `src/lib/queries/leads.ts` — `getLeadStatusSummary`, `getRecentLeads`, `getLeadsFiltered`, `getLeadWithActivities`
- `src/components/admin/AdminSidebar.tsx`, `LeadStatusBadge.tsx`, `LogoutButton.tsx`
- `src/app/(admin)/admin/login/page.tsx` — email/password form via `useActionState`
- `src/app/(admin)/admin/layout.tsx` — session + role guard; renders sidebar jika staff, hanya children jika belum login
- `src/app/(admin)/admin/page.tsx` — dashboard: status summary cards + 10 lead terbaru
- `src/app/(admin)/admin/leads/page.tsx` — DataTable + URL-based filter (?status=&q=)
- `src/app/(admin)/admin/leads/[id]/page.tsx` — detail lead + timeline aktivitas
- `src/app/(admin)/admin/leads/[id]/StatusUpdateForm.tsx` — client component, select + useActionState
- `src/app/(admin)/admin/leads/[id]/NoteForm.tsx` — client component, textarea + useActionState

**shadcn/ui components ditambah (base-nova style):**
`table`, `input`, `select`, `label`, `badge`, `textarea`, `card`, `separator`

**proxy.ts diperbarui:**
Tambah redirect: jika user sudah login dan ke `/admin/login` → redirect ke `/admin`.

**Deviasi / catatan:**
- `LEAD_STATUSES` dipisah ke `lib/leads-config.ts` (client-safe) agar tidak menyebabkan transitive server import di client components.
- Status update + note form menggunakan native `<select>` / `<textarea>` HTML (bukan shadcn Select) karena shadcn Select (Base UI) bukan native form element.
- Activity timeline ditampilkan descending (terbaru di atas).
- `profiles.full_name` pada aktivitas mungkin `null` jika RLS "read own profile" membatasi join — acceptable untuk MVP single-admin.

**One-off SQL: Membuat admin user pertama**

Jalankan di Supabase SQL Editor setelah deploy:

```sql
-- 1. Buat user di Supabase Auth (lakukan di Dashboard → Authentication → Users → Invite/Create)
--    Catat UUID user yang terbentuk.

-- 2. Insert profile dengan role admin:
INSERT INTO profiles (id, full_name, role)
VALUES ('<user-uuid-dari-auth>', 'Administrator', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = EXCLUDED.full_name;
```

Atau via Supabase Auth API (jika `supabase` CLI tersedia):
```bash
supabase auth users create --email admin@nusabackup.id --password "ganti-ini" --role authenticated
```
Lalu tambahkan row di tabel `profiles` seperti di atas.

---

### Sesi 4 — Lead Engine

**Server Action** (`actions/leads.ts`):
1. Honeypot check (`website` field) → fake success if non-empty (no bot tip-off)
2. Zod validation (`lib/validations/lead.ts`) — Indonesian error messages per field
3. Rate limit: `lib/rateLimit.ts` — SHA-256 IP hash from `CF-Connecting-IP`, module-level `Map`, max 3/60-min, pruned on every check
4. Insert via `createAdminClient()` (service-role) — zero anon access invariant preserved
5. `Promise.allSettled([sendLeadEmail, sendLeadWhatsApp])` — parallel, fail-soft; insert NOT rolled back on notification failure

**Notifications** (both `import 'server-only'`, skip gracefully if env vars unset):
- `lib/notifications/email.ts` → Resend API via `fetch` — subject: `Lead Baru — {packageName}`, plain-text body with all lead fields + admin URL
- `lib/notifications/whatsapp.ts` → Fonnte API via `fetch` — `[NusaBackup] Lead baru dari {name} ({org}) untuk paket {pkg}. Cek: {url}`

**Komponen** (custom Tailwind, no shadcn/ui per CLAUDE.md §5):
- `LeadForm.tsx` (client): `useActionState(submitLead, null)`, honeypot (aria-hidden, tabIndex=-1, pointer-events-none), hidden context fields, error alert, 5 input fields, preferred_channel radio (WA/email), spinner, success state + quick WA link, FR-10 direct WA+email buttons
- `LeadFormModal.tsx` (client): trigger button + fixed modal overlay, backdrop click / Escape to close, body scroll lock, accessible `role=dialog aria-modal`

**Wiring:**
- `PackageCard`: "Pesan Sekarang" Link → `<LeadFormModal>` pre-filled with pkg.id/name, segment.id/name
- `/[segment]/[package]`: kedua "Pesan Sekarang" Link (hero + bottom CTA) → `<LeadFormModal>`
- `/kontak`: placeholder `#lead-form-mount` → embedded `<LeadForm>` (tidak modal, langsung tampil)

**Deviasi / catatan:**
- `resend` dan `fonnte` npm packages tidak diinstall — notification via native `fetch` (no extra deps)
- `preferred_channel` di form menawarkan `whatsapp` | `email` (bukan `form`); `form` tersedia di enum tapi tidak diekspos ke user
- Kontak page tetap SSG (tidak perlu `useSearchParams`); form standalone tanpa pre-fill paket
- Rate limiter di `lib/rateLimit.ts` — module-level `Map` persist selama proses Node.js berjalan (sesuai design-spec Docker single container)

**Env vars diperlukan (semua server-only):**
- `SUPABASE_SERVICE_ROLE_KEY` — insert leads
- `RESEND_API_KEY` + `ADMIN_NOTIFY_EMAIL` — email notification
- `FONNTE_TOKEN` + `ADMIN_NOTIFY_WA` — WA notification

---

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
