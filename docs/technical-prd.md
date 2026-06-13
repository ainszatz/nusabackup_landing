# Technical PRD — NusaBackup Company Website

| | |
|---|---|
| **Produk** | NusaBackup — Company Website & Lead Engine |
| **Versi** | 1.0 (MVP) |
| **Pemilik** | Tyo (Prasetyo Adhi Pamungkas) |
| **Stack** | Next.js 15 (App Router) · TypeScript · Tailwind · Supabase |
| **Status** | Draft untuk implementasi |
| **Tanggal** | 12 Juni 2026 |

---

## 1. Ringkasan & Tujuan

NusaBackup membutuhkan website company profile yang sekaligus berfungsi sebagai **mesin lead**. Website menampilkan layanan backup offsite & disaster recovery dalam **tiga segmen** (Umum, Pendidikan, Kesehatan), masing-masing dengan paket yang relevan, dan mengonversi pengunjung menjadi lead melalui form yang tersimpan ke database serta dikelola lewat admin dashboard.

Seluruh konten paket, harga, dan segmen **dikelola dinamis lewat CMS** (tanpa perlu deploy ulang), dan setiap lead masuk dapat dilacak statusnya oleh admin.

### Tujuan utama
1. Menyajikan profil layanan yang kredibel & spesifik per segmen.
2. Mengonversi pengunjung jadi lead terstruktur yang tersimpan & terlacak.
3. Memberi admin kontrol penuh atas konten (segmen, paket, fitur, pengaturan) tanpa menyentuh kode.
4. Fondasi yang rapi untuk fase lanjutan (blog/SEO, client portal) tanpa rework.

---

## 2. Sasaran & Metrik Sukses

| Metrik | Target MVP |
|---|---|
| Lighthouse Performance (mobile) | ≥ 90 |
| Lighthouse SEO | ≥ 95 |
| Waktu admin menambah/mengubah paket | < 2 menit, tanpa deploy |
| Lead tersimpan + notifikasi terkirim | < 5 detik setelah submit |
| Kebocoran data (anon akses tabel leads) | 0 (dijamin RLS + server-only insert) |

---

## 3. Lingkup MVP

### Masuk (In Scope)
- Situs publik: Home, 3 halaman segmen, halaman kontak, halaman detail paket (opsional).
- Form lead dinamis (pre-fill paket/segmen) tersimpan ke Supabase.
- Notifikasi lead baru ke admin via Email (Resend) + WhatsApp (Fonnte).
- Tombol order langsung WA & Email (di samping form) dengan pesan ter-prefill.
- Admin: autentikasi, dashboard ringkasan, manajemen lead (list, detail, ubah status, catatan).
- CMS: kelola segmen, paket, fitur paket, dan pengaturan situs (nomor WA, email, alamat, sosial).
- SEO dasar: metadata per halaman, sitemap, robots, Open Graph, JSON-LD.

### Keluar (Out of Scope — fase berikutnya)
- Blog / artikel SEO.
- Client portal (login klien melihat status backup & laporan).
- Analytics konversi internal.
- Pembayaran online / invoicing.
- Multi-bahasa (MVP: Bahasa Indonesia saja).

---

## 4. Pengguna & Peran

| Peran | Akses |
|---|---|
| **Pengunjung (anon)** | Lihat situs publik, submit form lead, klik WA/Email. Tidak punya akses baca tabel lead/konten non-publik. |
| **Admin** | Login, kelola seluruh konten (CMS), kelola lead, ubah pengaturan situs. |
| **Editor** (opsional) | Sama seperti admin tapi tanpa akses hapus lead / ubah pengaturan sensitif. Disiapkan di schema, bisa diaktifkan nanti. |

---

## 5. Arsitektur Informasi (Sitemap)

```
/                         Home — hero, ringkasan 3 segmen, paket unggulan, CTA
/umum                     Segmen Umum — value-prop + paket UKM/usaha
/pendidikan               Segmen Pendidikan — value-prop + paket sekolah/kampus
/kesehatan                Segmen Kesehatan — value-prop + paket RS/klinik
/[segment]/[package]      Detail paket (opsional, fitur lengkap + form)
/kontak                   Form lead utama + info kontak

/admin/login              Login admin
/admin                    Dashboard (ringkasan lead & konten)
/admin/leads              Daftar lead + filter status
/admin/leads/[id]         Detail lead, ubah status, catatan, riwayat
/admin/segments           CRUD segmen
/admin/packages           CRUD paket + fitur
/admin/settings           Pengaturan situs (kontak, sosial, meta default)
```

---

## 6. Model Produk: Segmen & Paket

Konten berikut adalah **seed data awal** (semuanya editable via CMS). Harga bersifat *approx* dan memakai prefix "mulai" untuk ruang nego.

### 6.1 Segmen Umum (UKM, kantor, usaha)
> *Backup untuk data bisnis Anda — dari database aplikasi sampai berkas operasional.*

| Paket | Harga | Sorotan |
|---|---|---|
| **Bisnis Mulai** | mulai Rp 1jt/bln | 250GB · backup harian (DB + file) · enkripsi · retensi 14 hari |
| **Bisnis Plus** | Rp 2jt/bln *(unggulan)* | 1TB · backup tiap jam · snapshot server · retensi 30 hari · monitoring · laporan bulanan |
| **Custom** | nego | Storage & SLA disesuaikan kebutuhan |

### 6.2 Segmen Pendidikan (sekolah, kampus, yayasan)
> *Lindungi data akademik, nilai, dan administrasi siswa dari kehilangan permanen.*

| Paket | Harga | Sorotan |
|---|---|---|
| **Sekolah** | mulai Rp 1,2jt/bln | Backup SIM akademik & data siswa · harian · enkripsi · retensi 30 hari |
| **Kampus / Yayasan** | Rp 3jt/bln *(unggulan)* | Multi-aplikasi · tiap jam · snapshot server · retensi 60 hari · monitoring · laporan · SLA pemulihan |

### 6.3 Segmen Kesehatan (RS, klinik)
> *Data SIMRS, PACS, dan klaim BPJS aman — siap audit MRMIK & BPJS Trustmark.*

| Paket | Harga | Sorotan |
|---|---|---|
| **Basic Offsite** | mulai Rp 1,5jt/bln | 500GB · backup DB harian · enkripsi · retensi 7 hari |
| **Standard Healthcare** | Rp 2,5jt/bln *(unggulan)* | 2TB · backup DB tiap jam · snapshot VM · DICOM harian · retensi 30 hari · monitoring · laporan · SLA 4 jam |
| **Full DR Managed** | mulai Rp 4,5jt/bln | 5TB · DB+VM tiap jam · cold backup cloud · RPO 1j/RTO 4j · retensi 90 hari · uji pemulihan bulanan · dok. DRP/SPO · SLA 2 jam 24/7 |

---

## 7. Functional Requirements

### 7.1 Situs Publik
- **FR-1** Home menampilkan hero, ringkasan 3 segmen (kartu ke masing-masing halaman), paket unggulan lintas segmen, dan blok CTA.
- **FR-2** Tiap halaman segmen menarik datanya dari Supabase (segmen + paket aktif terurut `sort_order`).
- **FR-3** Kartu paket menampilkan nama, harga (prefix + amount + period), badge unggulan, daftar fitur (`is_included`), dan tombol order (WA/Email) + tombol "Pesan" yang membuka form ter-prefill.
- **FR-4** Hanya entitas dengan `is_active = true` yang tampil di publik.
- **FR-5** Halaman publik di-render statis dengan **on-demand ISR**: revalidasi otomatis saat admin menyimpan perubahan konten.

### 7.2 Form Lead
- **FR-6** Form field: nama (wajib), instansi, email, telepon, pesan, + hidden `segment_id`/`package_id`/snapshot nama.
- **FR-7** Submit diproses lewat **Server Action**, divalidasi (Zod), lalu di-insert memakai Supabase **service-role client** (server-only).
- **FR-8** Proteksi spam: honeypot field + rate-limit dasar (per IP-hash + jendela waktu).
- **FR-9** Setelah sukses: kirim notifikasi ke admin (Email via Resend, WA via Fonnte) dan tampilkan state sukses ke pengguna.
- **FR-10** Tombol WA/Email langsung tetap tersedia sebagai alternatif (pesan ter-prefill per paket, seperti prototype).

### 7.3 Admin Dashboard
- **FR-11** Login email/password (Supabase Auth). Rute `/admin/*` dilindungi middleware; non-admin diarahkan ke login.
- **FR-12** Dashboard menampilkan ringkasan: jumlah lead per status, lead terbaru, jumlah paket/segmen aktif.
- **FR-13** Daftar lead: filter status, pencarian nama/instansi, urut tanggal. Detail lead: ubah status (`baru → dihubungi → qualified → menang/kalah`), tambah catatan, lihat riwayat aktivitas.

### 7.4 CMS
- **FR-14** CRUD **Segmen**: slug, nama, tagline, deskripsi, ikon, hero copy, meta, urutan, status aktif.
- **FR-15** CRUD **Paket**: terkait segmen; nama, deskripsi, harga (prefix/amount/period/currency), badge, unggulan, urutan, status.
- **FR-16** CRUD **Fitur Paket**: label, `is_included`, urutan.
- **FR-17** **Pengaturan Situs**: nomor WA, email, alamat, sosial, meta default — disimpan di `site_settings` (key/value), sebagian `is_public`.
- **FR-18** Setiap penyimpanan konten memicu **revalidasi** rute publik terkait.

---

## 8. Arsitektur Teknis

### 8.1 Stack
- **Framework**: Next.js 15, App Router, React Server Components, Server Actions.
- **Bahasa**: TypeScript (strict).
- **Styling**: Tailwind CSS (+ token warna korporat biru/putih dari brand).
- **Data & Auth**: Supabase (Postgres, Auth, RLS, Storage untuk ikon/aset bila perlu).
- **Validasi**: Zod.
- **Notifikasi**: Resend (email) + Fonnte (WhatsApp).
- **Rendering**: SSG + on-demand ISR untuk publik; SSR/dynamic untuk admin.

### 8.2 Strategi Rendering & Data
- Publik: `fetch`/query dengan cache + `next: { tags: ['segments','packages','settings'] }`. Admin save → `revalidateTag(...)`.
- Admin: `dynamic = 'force-dynamic'`, tanpa cache, query per request via session user.
- Lead insert & semua mutasi admin: **Server Actions**, bukan REST publik.

### 8.3 Struktur Folder
```
src/
  app/
    (marketing)/
      layout.tsx
      page.tsx
      umum/page.tsx
      pendidikan/page.tsx
      kesehatan/page.tsx
      [segment]/[package]/page.tsx
      kontak/page.tsx
    (admin)/
      admin/
        login/page.tsx
        layout.tsx              # guard role admin
        page.tsx                # dashboard
        leads/page.tsx
        leads/[id]/page.tsx
        segments/page.tsx
        packages/page.tsx
        settings/page.tsx
    api/
      revalidate/route.ts       # opsional webhook
    sitemap.ts
    robots.ts
  components/
    marketing/ (Hero, SegmentCard, PackageCard, LeadForm, ...)
    admin/ (DataTable, LeadStatusBadge, ...)
    ui/ (Button, Input, Dialog, ...)
  lib/
    supabase/
      server.ts                 # RSC/server-action client (anon, RLS)
      admin.ts                  # service-role client (server-only)
      middleware.ts             # session helper
    validations/ (lead.ts, segment.ts, package.ts)
    notifications/ (email.ts, whatsapp.ts)
    queries/ (segments.ts, packages.ts, leads.ts, settings.ts)
  actions/
    leads.ts                    # submitLead, updateLeadStatus, addNote
    segments.ts                 # CRUD
    packages.ts                 # CRUD
    settings.ts                 # update
  middleware.ts                 # proteksi /admin/*
  types/
```

### 8.4 Alur Data (Lead)
```
[Pengunjung] --submit form--> [Server Action submitLead]
      |  validasi Zod + honeypot + rate-limit
      v
[Supabase service-role] --insert--> tabel leads (RLS bypass, server-only)
      |
      +--> [Resend]  email ke admin
      +--> [Fonnte]  WA ke admin
      |
      v
[State sukses] ditampilkan ke pengunjung
```

---

## 9. Skema Database (Supabase / Postgres)

> Semua tabel `enable row level security`. Insert lead lewat service-role (bypass RLS). Konten publik hanya `is_active = true`.

### 9.1 Tipe & Tabel

```sql
-- ENUMS
create type lead_status  as enum ('baru','dihubungi','qualified','menang','kalah');
create type lead_channel as enum ('form','whatsapp','email');

-- PROFILES (admin/editor; id = auth.users.id)
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text not null default 'admin' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

-- SEGMENTS
create table segments (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  tagline          text,
  description      text,
  icon             text,
  hero_headline    text,
  hero_subheadline text,
  meta_title       text,
  meta_description text,
  sort_order       int  not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- PACKAGES
create table packages (
  id           uuid primary key default gen_random_uuid(),
  segment_id   uuid not null references segments(id) on delete cascade,
  slug         text not null,
  name         text not null,
  description  text,
  price_prefix text,                       -- 'mulai' | null
  price_amount numeric(12,2),
  price_period text default 'bulan',
  currency     text default 'IDR',
  badge_label  text,                       -- 'PALING POPULER' | null
  is_featured  boolean not null default false,
  sort_order   int  not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (segment_id, slug)
);

-- PACKAGE FEATURES
create table package_features (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid not null references packages(id) on delete cascade,
  label       text not null,
  is_included boolean not null default true,
  sort_order  int  not null default 0
);

-- LEADS
create table leads (
  id                uuid primary key default gen_random_uuid(),
  segment_id        uuid references segments(id) on delete set null,
  package_id        uuid references packages(id) on delete set null,
  segment_name      text,                  -- snapshot
  package_name      text,                  -- snapshot
  name              text not null,
  organization      text,
  email             text,
  phone             text,
  message           text,
  preferred_channel lead_channel not null default 'form',
  status            lead_status  not null default 'baru',
  admin_notes       text,
  source            text default 'website',
  ip_hash           text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- LEAD ACTIVITIES (riwayat status & catatan)
create table lead_activities (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  actor_id   uuid references profiles(id) on delete set null,
  action     text not null,                -- 'status_change' | 'note' | 'created'
  note       text,
  created_at timestamptz not null default now()
);

-- SITE SETTINGS (key/value)
create table site_settings (
  key        text primary key,             -- 'wa_number','email','address','social_*','meta_*'
  value      jsonb not null,
  is_public  boolean not null default false,
  updated_at timestamptz not null default now()
);
```

### 9.2 Helper & RLS

```sql
-- Cek admin/editor
create or replace function public.is_staff()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin','editor')
  );
$$;

-- Konten publik: SELECT aktif untuk semua, full untuk staff
alter table segments         enable row level security;
alter table packages         enable row level security;
alter table package_features enable row level security;
alter table site_settings    enable row level security;

create policy "read active segments" on segments
  for select to anon, authenticated
  using (is_active or public.is_staff());
create policy "staff manage segments" on segments
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "read active packages" on packages
  for select to anon, authenticated
  using (is_active or public.is_staff());
create policy "staff manage packages" on packages
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "read package features" on package_features
  for select to anon, authenticated using (true);
create policy "staff manage features" on package_features
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "read public settings" on site_settings
  for select to anon, authenticated
  using (is_public or public.is_staff());
create policy "staff manage settings" on site_settings
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- LEADS: tidak ada akses anon. Insert via service-role (bypass RLS).
alter table leads           enable row level security;
alter table lead_activities enable row level security;

create policy "staff read leads" on leads
  for select to authenticated using (public.is_staff());
create policy "staff update leads" on leads
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "admin delete leads" on leads
  for delete to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "staff read activities" on lead_activities
  for select to authenticated using (public.is_staff());
create policy "staff write activities" on lead_activities
  for insert to authenticated with check (public.is_staff());

-- PROFILES
alter table profiles enable row level security;
create policy "read own profile" on profiles
  for select to authenticated using (id = auth.uid() or public.is_staff());
```

### 9.3 Trigger `updated_at`
```sql
create extension if not exists moddatetime;
create trigger seg_upd  before update on segments
  for each row execute procedure moddatetime (updated_at);
create trigger pkg_upd  before update on packages
  for each row execute procedure moddatetime (updated_at);
create trigger lead_upd before update on leads
  for each row execute procedure moddatetime (updated_at);
```

---

## 10. Server Actions / API

| Action | Lokasi | Akses | Fungsi |
|---|---|---|---|
| `submitLead(input)` | `actions/leads.ts` | publik | Validasi → insert (service-role) → notifikasi → revalidate tidak perlu |
| `updateLeadStatus(id, status)` | `actions/leads.ts` | staff | Ubah status + tulis `lead_activities` |
| `addLeadNote(id, note)` | `actions/leads.ts` | staff | Tambah catatan + aktivitas |
| `upsertSegment(data)` / `deleteSegment(id)` | `actions/segments.ts` | staff | CRUD + `revalidateTag('segments')` |
| `upsertPackage(data)` / `deletePackage(id)` | `actions/packages.ts` | staff | CRUD + `revalidateTag('packages')` |
| `upsertFeature(data)` / `deleteFeature(id)` | `actions/packages.ts` | staff | CRUD fitur |
| `updateSettings(kv)` | `actions/settings.ts` | admin | Upsert `site_settings` + `revalidateTag('settings')` |

Setiap action staff memverifikasi sesi & role di server sebelum mutasi (defense-in-depth di atas RLS).

---

## 11. Auth & Otorisasi
- **Supabase Auth** email/password untuk admin (jumlah user kecil, dibuat manual / seed).
- `middleware.ts` melindungi `/admin/*` — redirect ke `/admin/login` bila tak ada sesi.
- Layout admin memuat `profiles.role`; non-staff ditolak.
- RLS sebagai lapisan keamanan utama; pengecekan di server action sebagai lapisan kedua.
- Service-role key **hanya** di `lib/supabase/admin.ts` (server-only, tak pernah ke klien).

---

## 12. Notifikasi
- **Email (Resend)**: template "Lead baru — {paket}" berisi nama, instansi, kontak, pesan, link ke `/admin/leads/[id]`.
- **WhatsApp (Fonnte)**: pesan ringkas ke nomor admin saat lead masuk (reuse pola dari JastipKu).
- Keduanya **fail-soft**: jika notifikasi gagal, lead tetap tersimpan; kegagalan dicatat di log, tidak menggagalkan submit.

---

## 13. Non-Functional Requirements

### SEO
- Metadata API per halaman + meta default dari `site_settings`.
- `sitemap.ts` & `robots.ts` dinamis (ikut segmen aktif).
- JSON-LD `Organization` + `Service` per segmen; Open Graph.
- URL bersih, Bahasa Indonesia, heading semantik.

### Performa
- ISR/SSG untuk publik; gambar via `next/image`; font dioptimasi.
- Target Lighthouse mobile ≥ 90.

### Keamanan
- RLS aktif di semua tabel; insert lead server-only.
- Validasi Zod di server; honeypot + rate-limit; sanitasi input.
- Env secrets tidak pernah ke klien; CSP & header keamanan dasar.

### Aksesibilitas
- Kontras AA, fokus keyboard terlihat, `prefers-reduced-motion` dihormati, label form jelas.

---

## 14. Deployment & Environment

### Opsi deploy
- **A — Vercel (disarankan)**: ISR, Server Actions, revalidate native; Supabase Cloud sebagai DB.
- **B — Homelab**: container Docker `next start` (bukan static export, karena butuh server untuk ISR + Server Actions + admin), di belakang Cloudflare Tunnel; Supabase Cloud atau self-host.

### Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=
FONNTE_TOKEN=
ADMIN_NOTIFY_EMAIL=
ADMIN_NOTIFY_WA=                  # 62...
```

---

## 15. Rencana Build (Milestone)

Urutan dirancang untuk meminimalkan rework — schema & data lebih dulu, baru UI.

| Fase | Fokus | Output |
|---|---|---|
| **0 — Setup** | Repo, Tailwind, Supabase project, env, client server/admin | Skeleton jalan |
| **1 — Schema & Seed** | Migrasi tabel + RLS + trigger; seed 3 segmen & paket | DB siap, data nyata |
| **2 — Situs Publik** | Home, 3 halaman segmen, kartu paket, ISR + tags | Situs publik live (read-only) |
| **3 — Lead Engine** | Form + Server Action + notifikasi Resend/Fonnte + honeypot | Lead masuk & ternotifikasi |
| **4 — Admin & Auth** | Login, middleware, dashboard, manajemen lead | Admin bisa kelola lead |
| **5 — CMS** | CRUD segmen/paket/fitur/settings + revalidate | Konten editable tanpa deploy |
| **6 — Polish** | SEO, a11y, performa, error/empty states, deploy | MVP rilis |

---

## 16. Open Questions / Keputusan Menunggu Konfirmasi
1. **Halaman detail paket** (`/[segment]/[package]`) — dibuat di MVP atau cukup kartu + form di halaman segmen? (Default saat ini: opsional, bisa fase 6.)
2. **Storage aset** — ikon segmen/paket pakai Supabase Storage (upload via CMS) atau cukup nama ikon dari set bawaan (mis. Lucide)? (Default: nama ikon Lucide, lebih simpel.)
3. **Jumlah admin** — berapa user awal & apakah peran `editor` diaktifkan sejak MVP? (Default: 1 admin, editor disiapkan tapi nonaktif.)
4. **Domain & deploy** — Vercel atau homelab untuk produksi awal? (Default rekomendasi: Vercel untuk MVP, migrasi ke homelab opsional.)

---

## 17. Future Scope (pasca-MVP)
- Blog/artikel untuk SEO (tabel `posts`, kategori, ISR).
- Client portal: login klien → status backup terakhir, unduh laporan bulanan, tiket restore.
- Analytics konversi (sumber lead, funnel, paket terpopuler).
- Integrasi invoicing / pembayaran berlangganan.
