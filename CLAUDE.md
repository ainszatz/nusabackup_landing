# CLAUDE.md — NusaBackup

## Project
Company website + lead engine untuk NusaBackup (layanan backup offsite & disaster
recovery). 3 segmen: Umum, Pendidikan, Kesehatan. Tujuan: konversi pengunjung jadi
lead terstruktur + CMS untuk kelola konten & lead.

## Stack
Next.js 15 (App Router) · TypeScript (strict) · Tailwind · Supabase (Postgres/Auth/
Storage/RLS) · shadcn/ui (ADMIN ONLY) · Resend (email) · Fonnte (WA). PM: pnpm.

## Source of Truth (BACA SEBELUM CODING)
- docs/design-spec.md   -> spec APPROVED, otoritatif. Kalau kode bentrok dgn spec, spec menang.
- docs/technical-prd.md -> PRD lengkap (schema, requirements).
- PROGRESS.md           -> status build; UPDATE tiap akhir sesi.

## Invariant Kritis (JANGAN dilanggar)
1. Tabel `leads`: NOL akses anon. Insert HANYA via service-role di Server Action.
   Read HANYA oleh staff via RLS.
2. `lib/supabase/admin.ts` & semua `lib/notifications/*` diawali `import 'server-only'`.
   Service-role key tidak pernah sampai ke klien.
3. Tidak ada secret di NEXT_PUBLIC_*.
4. Tabel konten publik: hanya is_active=true yang tampil ke anon (via RLS).
5. Copy UI dalam Bahasa Indonesia. Komponen marketing = custom Tailwind (frontend-design
   skill). Komponen admin = shadcn/ui.
6. Halaman publik: SSG + on-demand ISR via revalidateTag('segments'|'packages'|'settings').
   Halaman admin: force-dynamic.
7. Tiap Server Action staff verifikasi session + role SEBELUM mutasi apa pun.

## Konvensi
- Server Actions: src/actions/*. Queries: src/lib/queries/*. Zod: src/lib/validations/*.
- Pakai tipe DB hasil generate: src/types/database.ts.
- Conventional commits. Satu sesi = satu commit utama.

## Commands
pnpm dev | pnpm build | pnpm start | pnpm lint
pnpm dlx supabase gen types typescript --linked > src/types/database.ts
