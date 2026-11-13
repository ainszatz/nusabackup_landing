# Panduan Proyek — NusaBackup

OpenCode V2 hanya membaca `AGENTS.md`. `CLAUDE.md` di repo ini hanya bridge
untuk Claude Code dan mengimpor file ini.

## Proyek

Website perusahaan + lead engine NusaBackup (backup offsite & disaster
recovery) untuk segmen Umum, Pendidikan, dan Kesehatan. Tujuan: mengonversi
pengunjung menjadi lead terstruktur, plus CMS untuk mengelola konten dan lead.

## Source of truth

- `docs/design-spec.md` — spec desain yang disetujui.
- `docs/technical-prd.md` — PRD lengkap (schema, requirement).
- `docs/audit.md` — status audit UI/UX, admin, deploy, dan hardening terkini.
- `PROGRESS.md` — log status build.

## Stack

Next.js 16.2.9 (App Router) · React 19.2.4 · TypeScript strict · Tailwind CSS 4 ·
Supabase (Postgres/Auth/Storage/RLS) · shadcn/ui (admin saja) · Resend + Fonnte
(opsional) · pnpm 11.7.0 · Docker standalone + Cloudflare Tunnel.

## Invariant kritis (jangan dilanggar)

1. Tabel `leads`: nol akses anon. Insert hanya via service-role di Server Action;
   baca hanya oleh staff via RLS.
2. `lib/supabase/admin.ts`, `lib/notifications/*`, `lib/server/verify-staff.ts`,
   dan action sensitif diawali `import 'server-only'`. Service-role key tidak
   pernah sampai ke client.
3. Tidak ada secret di variabel `NEXT_PUBLIC_*`.
4. Konten publik (segmen, paket, fitur, settings) hanya menampilkan data aktif
   ke anon, lewat RLS.
5. Setiap Server Action staff memverifikasi session + role sebelum mutasi.
6. Copy UI dalam Bahasa Indonesia; kode, komentar, commit, dan nama branch dalam
   Bahasa Inggris.
7. Marketing memakai custom Tailwind; admin memakai shadcn/ui.
8. Halaman publik SSG + on-demand ISR via `revalidateTag(tag, { expire: 0 })`
   (Next 16 mewajibkan argumen kedua). Halaman admin `force-dynamic`.
9. Proxy/middleware hanya untuk rute `/admin`; halaman publik tidak boleh
   bergantung pada auth Supabase per request.

## Konvensi

- Server Actions: `src/actions/*`; queries: `src/lib/queries/*`; validasi Zod:
  `src/lib/validations/*`; helper server: `src/lib/server/*`.
- Gunakan tipe DB hasil generate di `src/types/database.ts`.
- Perubahan schema lewat `supabase/migrations`, jangan alter produksi manual.
- Jangan menambah dependency tanpa persetujuan.
- Conventional Commits; satu sesi = satu commit utama.

## Perintah

```bash
pnpm dev            # development server
pnpm build          # production build
pnpm start          # jalankan hasil build
pnpm lint           # eslint
pnpm test           # unit test (node:test)
```

Regenerate tipe setelah migrasi:

```bash
supabase gen types typescript --linked > src/types/database.ts
```

## Deploy

```bash
docker compose --env-file .env.production up -d --build
```

`--env-file` wajib: build args `NEXT_PUBLIC_*` dibaca dari environment
interpolasi Compose, bukan dari `env_file` runtime.

## Migrasi database

Kedua migrasi sudah diterapkan ke project `jskugzbbohcvamscvpkd` pada
13 November 2026:

- `20261113000001_add_lead_consent_columns.sql` — kolom `consent_at` /
  `consent_version`.
- `20261113000002_restrict_package_features_read.sql` — anon tidak lagi membaca
  fitur paket nonaktif.

Regenerate `src/types/database.ts` setelah setiap perubahan schema.
