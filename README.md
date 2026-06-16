# NusaBackup

Website perusahaan + lead engine untuk layanan **backup offsite & disaster recovery**. Menargetkan 3 segmen: Umum, Pendidikan, dan Kesehatan.

**Tujuan:** Mengonversi pengunjung menjadi lead terstruktur dan menyediakan CMS untuk mengelola konten & lead.

---

## Stack

| Teknologi | Versi | Keterangan |
|---|---|---|
| Next.js | 16.2.9 | App Router, SSG + ISR |
| React | 19.2.4 | |
| TypeScript | 5.9.3 | strict mode |
| Tailwind CSS | 4.3.1 | Marketing UI (custom) |
| Supabase | — | Postgres · Auth · Storage · RLS |
| shadcn/ui | — | Admin panel UI |
| Resend | — | Notifikasi email lead (opsional) |
| Fonnte | — | Notifikasi WhatsApp lead (opsional) |
| Docker | — | Deployment via standalone output |

---

## Fitur

- **Landing page** per segmen (Umum, Pendidikan, Kesehatan) dengan detail paket
- **Lead engine**: form dengan honeypot, rate limit, validasi Zod, notifikasi email + WA
- **Admin panel** (`/admin`): manajemen lead, segmen, paket, pengaturan situs
- **CMS**: CRUD segmen & paket dengan upload icon, pengaturan konten publik
- **SEO**: `generateMetadata`, sitemap, robots, JSON-LD (Organization / Service / Product)
- **Aksesibilitas**: skip-link, focus-visible ring, `prefers-reduced-motion`
- **Deploy**: Docker multi-stage + Cloudflare Tunnel

---

## Pengembangan Lokal

```bash
cp .env.example .env.local   # isi nilai yang sesuai
pnpm install
pnpm dev                     # http://localhost:3000
```

---

## Deploy ke Homelab (Docker + Cloudflare Tunnel)

### 1. Siapkan environment

```bash
cp .env.production.example .env.production
# Edit .env.production dengan nilai produksi
```

### 2. Build & jalankan container

```bash
docker compose up -d --build
# Site berjalan di port 3000
```

### 3. Cloudflare Tunnel

Cloudflare Tunnel menangani TLS dan meneruskan traffic ke port 3000. `cloudflared` tidak perlu berjalan di dalam container yang sama.

```bash
# Install cloudflared di host (lihat docs.cloudflare.com/cloudflare-one/connections/connect-networks)
cloudflared tunnel login
cloudflared tunnel create nusabackup
cloudflared tunnel route dns nusabackup nusabackup.id

# Buat ~/.cloudflared/config.yml:
# tunnel: <tunnel-id>
# credentials-file: /root/.cloudflared/<tunnel-id>.json
# ingress:
#   - hostname: nusabackup.id
#     service: http://localhost:3000
#   - service: http_status:404

cloudflared tunnel run nusabackup
```

---

## Membuat Admin User Pertama

Setelah deploy, buat akun admin satu kali melalui Supabase Dashboard:

### Langkah 1 — Buat user di Supabase Auth

Buka Supabase Dashboard → **Authentication** → **Users** → **Add user**.
Masukkan email dan password. Catat UUID yang terbentuk.

### Langkah 2 — Tambahkan profile dengan role admin

Jalankan SQL berikut di **SQL Editor** Supabase:

```sql
INSERT INTO profiles (id, full_name, role)
VALUES ('<uuid-dari-langkah-1>', 'Administrator', 'admin')
ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      full_name = EXCLUDED.full_name;
```

### Langkah 3 — Login

Buka `https://nusabackup.id/admin/login` dan masuk dengan kredensial di atas.

---

## Struktur Proyek

```
src/
├── actions/          # Server Actions (leads, auth, settings, assets)
├── app/
│   ├── (marketing)/  # Halaman publik + landing page
│   └── (admin)/      # Panel admin (force-dynamic)
├── components/
│   ├── admin/        # Komponen admin (shadcn/ui)
│   └── marketing/    # Komponen publik (custom Tailwind)
├── lib/
│   ├── queries/      # Query DB dengan unstable_cache
│   ├── supabase/     # Client Supabase (browser, server, admin)
│   ├── notifications/# Email (Resend) + WA (Fonnte) — server-only
│   └── validations/  # Zod schemas
└── types/
    └── database.ts   # Tipe DB hasil generate Supabase
```

---

## Perintah Berguna

```bash
pnpm dev            # development server
pnpm build          # build production
pnpm start          # jalankan server produksi (setelah build)
pnpm lint           # lint TypeScript

# Regenerate Supabase types setelah migrasi skema:
pnpm dlx supabase gen types typescript --linked > src/types/database.ts
```

---

## Environment Variables

| Variable | Public | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Anon key (aman di client) |
| `NEXT_PUBLIC_SITE_URL` | ✓ | URL produksi (untuk sitemap/OG) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✗ | Service-role key — **jangan ekspos ke client** |
| `RESEND_API_KEY` | ✗ | Email notifikasi lead (opsional) |
| `ADMIN_NOTIFY_EMAIL` | ✗ | Email tujuan notifikasi |
| `FONNTE_TOKEN` | ✗ | WA notifikasi via Fonnte (opsional) |
| `ADMIN_NOTIFY_WA` | ✗ | Nomor WA tujuan notifikasi |

---

## Keamanan

- Tabel `leads`: **nol akses anon**. Insert hanya via service-role di Server Action, read hanya oleh staff via RLS.
- `SUPABASE_SERVICE_ROLE_KEY` tidak pernah sampai ke client — semua file yang memakainya diawali `import 'server-only'`.
- CSP + security headers dikonfigurasi di `next.config.ts`.
- Setiap Server Action staff memverifikasi session + role sebelum mutasi apa pun.
- Rate limit lead form: maks 3 submission per IP per 60 menit.

---

## Status Build

MVP selesai dan terverifikasi — 33 QA checks, 31 PASS, 0 security gap.

| Sesi | Scope |
|---|---|
| Sesi 0 | Setup & konfigurasi |
| Sesi 1 | DB schema, RLS, seed, types |
| Sesi 2 | Marketing foundation + home |
| Sesi 3 | Segment & package detail + SEO |
| Sesi 4 | Lead engine |
| Sesi 5 | Admin auth + dashboard + leads |
| Sesi 6 | CMS segmen + paket + icon upload |
| Sesi 7 | CMS settings + polish + Docker |
| QA | Full audit — **MVP COMPLETE & VERIFIED** |
