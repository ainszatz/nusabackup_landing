-- =============================================================================
-- NusaBackup — Seed Data
-- Run AFTER initial_schema migration.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- SEGMENTS  (3 segments: umum, pendidikan, kesehatan)
-- ---------------------------------------------------------------------------
insert into segments
  (slug, name, tagline, description, hero_headline, hero_subheadline,
   meta_title, meta_description, sort_order, is_active)
values
  (
    'umum',
    'Umum',
    'Backup andal untuk bisnis Anda',
    'Solusi backup offsite untuk UKM, kantor, dan usaha — dari database aplikasi hingga berkas operasional.',
    'Backup Data Bisnis Anda, Tanpa Repot',
    'Lindungi database dan file operasional bisnis Anda dengan backup harian otomatis ke server offsite yang aman dan terenkripsi.',
    'Backup Offsite untuk UKM & Bisnis | NusaBackup',
    'Layanan backup offsite terpercaya untuk UKM dan bisnis. Backup database dan file harian, enkripsi AES-256, retensi fleksibel. Mulai dari Rp 1 juta/bulan.',
    1,
    true
  ),
  (
    'pendidikan',
    'Pendidikan',
    'Data akademik aman, proses belajar tak terganggu',
    'Lindungi data akademik, nilai, dan administrasi siswa dari kehilangan permanen — untuk sekolah, kampus, dan yayasan.',
    'Data Akademik Aman, Proses Belajar Tak Terganggu',
    'Backup SIM akademik, data siswa, dan dokumen administrasi secara otomatis setiap hari. Pemulihan cepat ketika Anda membutuhkannya.',
    'Backup Data Akademik untuk Sekolah & Kampus | NusaBackup',
    'Backup offsite khusus institusi pendidikan. Lindungi data nilai, data siswa, dan SIM akademik dari kehilangan. Enkripsi, retensi 30–60 hari.',
    2,
    true
  ),
  (
    'kesehatan',
    'Kesehatan',
    'Data medis terlindungi, kepatuhan terjamin',
    'Data SIMRS, PACS, dan klaim BPJS aman — siap audit MRMIK & BPJS Trustmark untuk rumah sakit dan klinik.',
    'Data Medis Terlindungi, Kepatuhan Terjamin',
    'Backup SIMRS, PACS DICOM, dan data BPJS secara otomatis dengan enkripsi standar industri kesehatan. Siap audit MRMIK dan BPJS Trustmark.',
    'Backup SIMRS & Data Medis untuk RS dan Klinik | NusaBackup',
    'Layanan backup offsite & disaster recovery khusus fasilitas kesehatan. Backup SIMRS, DICOM, klaim BPJS. SLA 2–4 jam, siap audit regulasi.',
    3,
    true
  );

-- ---------------------------------------------------------------------------
-- PACKAGES — SEGMEN UMUM
-- ---------------------------------------------------------------------------
with seg as (select id from segments where slug = 'umum')
insert into packages
  (segment_id, slug, name, description,
   price_prefix, price_amount, price_period, currency,
   badge_label, is_featured, sort_order, is_active)
select
  seg.id,
  p.slug, p.name, p.description,
  p.price_prefix, p.price_amount, p.price_period, p.currency,
  p.badge_label, p.is_featured, p.sort_order, true
from seg, (values
  ('bisnis-mulai',
   'Bisnis Mulai',
   'Paket entry-level untuk UKM dan usaha kecil yang butuh backup rutin tanpa biaya besar.',
   'mulai', 1000000::numeric, 'bulan', 'IDR',
   null, false, 1),
  ('bisnis-plus',
   'Bisnis Plus',
   'Paket unggulan untuk bisnis aktif yang butuh proteksi lebih ketat, monitoring, dan laporan berkala.',
   null, 2000000::numeric, 'bulan', 'IDR',
   'PALING POPULER', true, 2),
  ('custom',
   'Custom',
   'Storage, frekuensi backup, dan SLA disesuaikan penuh dengan kebutuhan bisnis Anda.',
   'hubungi kami', null, 'bulan', 'IDR',
   null, false, 3)
) as p(slug, name, description, price_prefix, price_amount, price_period, currency, badge_label, is_featured, sort_order);

-- ---------------------------------------------------------------------------
-- PACKAGES — SEGMEN PENDIDIKAN
-- ---------------------------------------------------------------------------
with seg as (select id from segments where slug = 'pendidikan')
insert into packages
  (segment_id, slug, name, description,
   price_prefix, price_amount, price_period, currency,
   badge_label, is_featured, sort_order, is_active)
select
  seg.id,
  p.slug, p.name, p.description,
  p.price_prefix, p.price_amount, p.price_period, p.currency,
  p.badge_label, p.is_featured, p.sort_order, true
from seg, (values
  ('sekolah',
   'Sekolah',
   'Backup SIM akademik dan data siswa untuk SD, SMP, SMA, dan SMK dengan enkripsi penuh.',
   'mulai', 1200000::numeric, 'bulan', 'IDR',
   null, false, 1),
  ('kampus-yayasan',
   'Kampus / Yayasan',
   'Proteksi multi-aplikasi untuk universitas dan yayasan pendidikan dengan SLA pemulihan dan laporan bulanan.',
   null, 3000000::numeric, 'bulan', 'IDR',
   'PALING POPULER', true, 2)
) as p(slug, name, description, price_prefix, price_amount, price_period, currency, badge_label, is_featured, sort_order);

-- ---------------------------------------------------------------------------
-- PACKAGES — SEGMEN KESEHATAN
-- ---------------------------------------------------------------------------
with seg as (select id from segments where slug = 'kesehatan')
insert into packages
  (segment_id, slug, name, description,
   price_prefix, price_amount, price_period, currency,
   badge_label, is_featured, sort_order, is_active)
select
  seg.id,
  p.slug, p.name, p.description,
  p.price_prefix, p.price_amount, p.price_period, p.currency,
  p.badge_label, p.is_featured, p.sort_order, true
from seg, (values
  ('basic-offsite',
   'Basic Offsite',
   'Backup database SIMRS harian untuk klinik dan puskesmas — enkripsi standar, biaya terjangkau.',
   'mulai', 1500000::numeric, 'bulan', 'IDR',
   null, false, 1),
  ('standard-healthcare',
   'Standard Healthcare',
   'Backup komprehensif untuk rumah sakit tipe C/D — database tiap jam, snapshot VM, DICOM harian, monitoring, SLA 4 jam.',
   null, 2500000::numeric, 'bulan', 'IDR',
   'PALING POPULER', true, 2),
  ('full-dr-managed',
   'Full DR Managed',
   'Solusi disaster recovery penuh dengan RPO 1 jam / RTO 4 jam, uji pemulihan bulanan, dan dokumentasi DRP/SPO untuk RS tipe A/B.',
   'mulai', 4500000::numeric, 'bulan', 'IDR',
   null, false, 3)
) as p(slug, name, description, price_prefix, price_amount, price_period, currency, badge_label, is_featured, sort_order);

-- ---------------------------------------------------------------------------
-- PACKAGE FEATURES — BISNIS MULAI (umum)
-- ---------------------------------------------------------------------------
with pkg as (
  select pk.id from packages pk
  join segments s on s.id = pk.segment_id
  where s.slug = 'umum' and pk.slug = 'bisnis-mulai'
)
insert into package_features (package_id, label, is_included, sort_order)
select pkg.id, f.label, f.is_included, f.sort_order
from pkg, (values
  ('Storage 250 GB',              true,  1),
  ('Backup harian (DB + file)',   true,  2),
  ('Enkripsi AES-256',            true,  3),
  ('Retensi 14 hari',             true,  4),
  ('Monitoring real-time',        false, 5),
  ('Laporan bulanan',             false, 6),
  ('Snapshot server',             false, 7)
) as f(label, is_included, sort_order);

-- ---------------------------------------------------------------------------
-- PACKAGE FEATURES — BISNIS PLUS (umum)
-- ---------------------------------------------------------------------------
with pkg as (
  select pk.id from packages pk
  join segments s on s.id = pk.segment_id
  where s.slug = 'umum' and pk.slug = 'bisnis-plus'
)
insert into package_features (package_id, label, is_included, sort_order)
select pkg.id, f.label, f.is_included, f.sort_order
from pkg, (values
  ('Storage 1 TB',                true,  1),
  ('Backup tiap jam',             true,  2),
  ('Enkripsi AES-256',            true,  3),
  ('Retensi 30 hari',             true,  4),
  ('Monitoring real-time',        true,  5),
  ('Laporan bulanan',             true,  6),
  ('Snapshot server',             true,  7)
) as f(label, is_included, sort_order);

-- ---------------------------------------------------------------------------
-- PACKAGE FEATURES — CUSTOM (umum)
-- ---------------------------------------------------------------------------
with pkg as (
  select pk.id from packages pk
  join segments s on s.id = pk.segment_id
  where s.slug = 'umum' and pk.slug = 'custom'
)
insert into package_features (package_id, label, is_included, sort_order)
select pkg.id, f.label, f.is_included, f.sort_order
from pkg, (values
  ('Storage sesuai kebutuhan',    true,  1),
  ('Frekuensi backup fleksibel',  true,  2),
  ('Enkripsi AES-256',            true,  3),
  ('Retensi sesuai kebutuhan',    true,  4),
  ('SLA kustom',                  true,  5),
  ('Monitoring & laporan',        true,  6),
  ('Konsultasi teknis',           true,  7)
) as f(label, is_included, sort_order);

-- ---------------------------------------------------------------------------
-- PACKAGE FEATURES — SEKOLAH (pendidikan)
-- ---------------------------------------------------------------------------
with pkg as (
  select pk.id from packages pk
  join segments s on s.id = pk.segment_id
  where s.slug = 'pendidikan' and pk.slug = 'sekolah'
)
insert into package_features (package_id, label, is_included, sort_order)
select pkg.id, f.label, f.is_included, f.sort_order
from pkg, (values
  ('Backup SIM akademik & data siswa', true,  1),
  ('Backup harian',                    true,  2),
  ('Enkripsi AES-256',                 true,  3),
  ('Retensi 30 hari',                  true,  4),
  ('Snapshot server',                  false, 5),
  ('Monitoring real-time',             false, 6),
  ('Laporan bulanan',                  false, 7),
  ('SLA pemulihan',                    false, 8)
) as f(label, is_included, sort_order);

-- ---------------------------------------------------------------------------
-- PACKAGE FEATURES — KAMPUS / YAYASAN (pendidikan)
-- ---------------------------------------------------------------------------
with pkg as (
  select pk.id from packages pk
  join segments s on s.id = pk.segment_id
  where s.slug = 'pendidikan' and pk.slug = 'kampus-yayasan'
)
insert into package_features (package_id, label, is_included, sort_order)
select pkg.id, f.label, f.is_included, f.sort_order
from pkg, (values
  ('Backup multi-aplikasi',            true, 1),
  ('Backup tiap jam',                  true, 2),
  ('Enkripsi AES-256',                 true, 3),
  ('Retensi 60 hari',                  true, 4),
  ('Snapshot server',                  true, 5),
  ('Monitoring real-time',             true, 6),
  ('Laporan bulanan',                  true, 7),
  ('SLA pemulihan tertulis',           true, 8)
) as f(label, is_included, sort_order);

-- ---------------------------------------------------------------------------
-- PACKAGE FEATURES — BASIC OFFSITE (kesehatan)
-- ---------------------------------------------------------------------------
with pkg as (
  select pk.id from packages pk
  join segments s on s.id = pk.segment_id
  where s.slug = 'kesehatan' and pk.slug = 'basic-offsite'
)
insert into package_features (package_id, label, is_included, sort_order)
select pkg.id, f.label, f.is_included, f.sort_order
from pkg, (values
  ('Storage 500 GB',                   true,  1),
  ('Backup DB SIMRS harian',           true,  2),
  ('Enkripsi AES-256',                 true,  3),
  ('Retensi 7 hari',                   true,  4),
  ('Snapshot VM',                      false, 5),
  ('Backup DICOM harian',              false, 6),
  ('Monitoring real-time',             false, 7),
  ('Laporan bulanan',                  false, 8),
  ('SLA pemulihan',                    false, 9)
) as f(label, is_included, sort_order);

-- ---------------------------------------------------------------------------
-- PACKAGE FEATURES — STANDARD HEALTHCARE (kesehatan)
-- ---------------------------------------------------------------------------
with pkg as (
  select pk.id from packages pk
  join segments s on s.id = pk.segment_id
  where s.slug = 'kesehatan' and pk.slug = 'standard-healthcare'
)
insert into package_features (package_id, label, is_included, sort_order)
select pkg.id, f.label, f.is_included, f.sort_order
from pkg, (values
  ('Storage 2 TB',                     true, 1),
  ('Backup DB SIMRS tiap jam',         true, 2),
  ('Enkripsi AES-256',                 true, 3),
  ('Retensi 30 hari',                  true, 4),
  ('Snapshot VM',                      true, 5),
  ('Backup DICOM harian',              true, 6),
  ('Monitoring real-time',             true, 7),
  ('Laporan bulanan',                  true, 8),
  ('SLA pemulihan 4 jam',              true, 9)
) as f(label, is_included, sort_order);

-- ---------------------------------------------------------------------------
-- PACKAGE FEATURES — FULL DR MANAGED (kesehatan)
-- ---------------------------------------------------------------------------
with pkg as (
  select pk.id from packages pk
  join segments s on s.id = pk.segment_id
  where s.slug = 'kesehatan' and pk.slug = 'full-dr-managed'
)
insert into package_features (package_id, label, is_included, sort_order)
select pkg.id, f.label, f.is_included, f.sort_order
from pkg, (values
  ('Storage 5 TB',                         true,  1),
  ('Backup DB + VM tiap jam',              true,  2),
  ('Enkripsi AES-256',                     true,  3),
  ('Retensi 90 hari',                      true,  4),
  ('Cold backup cloud',                    true,  5),
  ('RPO 1 jam / RTO 4 jam',               true,  6),
  ('Backup DICOM harian',                  true,  7),
  ('Monitoring real-time',                 true,  8),
  ('Laporan bulanan',                      true,  9),
  ('Uji pemulihan bulanan',                true,  10),
  ('Dokumentasi DRP & SPO',               true,  11),
  ('SLA 2 jam 24/7',                       true,  12)
) as f(label, is_included, sort_order);

-- ---------------------------------------------------------------------------
-- SITE SETTINGS
-- is_public = true  → exposed to anon (WA, email, address, socials)
-- is_public = false → admin-only (meta defaults, notify targets)
-- ---------------------------------------------------------------------------
insert into site_settings (key, value, is_public) values
  ('wa_number',          '"628123456789"',                                    true),
  ('email',              '"halo@nusabackup.id"',                              true),
  ('address',            '"Jakarta, Indonesia"',                               true),
  ('social_instagram',   '"https://instagram.com/nusabackup"',                true),
  ('social_linkedin',    '"https://linkedin.com/company/nusabackup"',          true),
  ('meta_title',         '"NusaBackup — Layanan Backup Offsite & Disaster Recovery"', false),
  ('meta_description',   '"NusaBackup menyediakan layanan backup offsite dan disaster recovery untuk bisnis, pendidikan, dan kesehatan."', false),
  ('admin_notify_email', '"admin@nusabackup.id"',                             false),
  ('admin_notify_wa',    '"628123456789"',                                    false);
