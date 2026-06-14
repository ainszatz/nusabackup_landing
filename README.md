# NusaBackup

Company website + lead engine untuk layanan backup offsite & disaster recovery.

**Stack:** Next.js 16 · TypeScript · Tailwind · Supabase · shadcn/ui · Docker

---

## Pengembangan Lokal

```bash
cp .env.example .env.local   # isi nilai yang sesuai
pnpm install
pnpm dev                                 # http://localhost:3000
```

---

## Deploy ke Homelab (Docker + Cloudflare Tunnel)

### 1. Siapkan environment

```bash
cp .env.example .env.production
# Edit .env.production dengan nilai produksi
```

### 2. Build & jalankan container

```bash
docker compose up -d --build
# Site berjalan di port 3000
```

### 3. Cloudflare Tunnel

Cloudflare Tunnel menangani TLS dan meneruskan traffic ke port 3000 di dalam container.
`cloudflared` tidak perlu berjalan di dalam container yang sama.

```bash
# Install cloudflared di host (lihat docs.cloudflare.com/cloudflare-one/connections/connect-networks)
cloudflared tunnel login
cloudflared tunnel create nusabackup
cloudflared tunnel route dns nusabackup nusabackup.id

# Buat config: ~/.cloudflared/config.yml
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

Buka `https://nusabackup.id/admin/login` dan login dengan kredensial di atas.

---

## Perintah Berguna

```bash
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
| `SUPABASE_SERVICE_ROLE_KEY` | ✗ | Service-role key — **jangan ekspos** |
| `RESEND_API_KEY` | ✗ | Email notifikasi lead (opsional) |
| `ADMIN_NOTIFY_EMAIL` | ✗ | Email tujuan notifikasi |
| `FONNTE_TOKEN` | ✗ | WA notifikasi via Fonnte (opsional) |
| `ADMIN_NOTIFY_WA` | ✗ | Nomor WA tujuan notifikasi |
