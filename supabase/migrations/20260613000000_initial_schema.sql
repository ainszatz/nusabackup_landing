-- =============================================================================
-- NusaBackup — Initial Schema
-- Migration: 20260613000000_initial_schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists moddatetime;

-- ---------------------------------------------------------------------------
-- 2. ENUMs
-- ---------------------------------------------------------------------------
create type lead_status  as enum ('baru','dihubungi','qualified','menang','kalah');
create type lead_channel as enum ('form','whatsapp','email');

-- ---------------------------------------------------------------------------
-- 3. PROFILES  (admin / editor; id mirrors auth.users.id)
-- ---------------------------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text not null default 'admin' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. SEGMENTS
-- ---------------------------------------------------------------------------
create table segments (
  id               uuid        primary key default gen_random_uuid(),
  slug             text        unique not null,
  name             text        not null,
  tagline          text,
  description      text,
  icon             text,
  hero_headline    text,
  hero_subheadline text,
  meta_title       text,
  meta_description text,
  sort_order       int         not null default 0,
  is_active        boolean     not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. PACKAGES
-- design-spec §4 adds icon column (not in PRD schema; spec is authoritative)
-- ---------------------------------------------------------------------------
create table packages (
  id           uuid        primary key default gen_random_uuid(),
  segment_id   uuid        not null references segments(id) on delete cascade,
  slug         text        not null,
  name         text        not null,
  description  text,
  icon         text,
  price_prefix text,                    -- 'mulai' | null
  price_amount numeric(12,2),
  price_period text        default 'bulan',
  currency     text        default 'IDR',
  badge_label  text,                    -- e.g. 'PALING POPULER' | null
  is_featured  boolean     not null default false,
  sort_order   int         not null default 0,
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (segment_id, slug)
);

-- ---------------------------------------------------------------------------
-- 6. PACKAGE FEATURES
-- ---------------------------------------------------------------------------
create table package_features (
  id          uuid    primary key default gen_random_uuid(),
  package_id  uuid    not null references packages(id) on delete cascade,
  label       text    not null,
  is_included boolean not null default true,
  sort_order  int     not null default 0
);

-- ---------------------------------------------------------------------------
-- 7. LEADS
-- Zero anon access — insert only via service-role in Server Actions.
-- ---------------------------------------------------------------------------
create table leads (
  id                uuid         primary key default gen_random_uuid(),
  segment_id        uuid         references segments(id) on delete set null,
  package_id        uuid         references packages(id) on delete set null,
  segment_name      text,                   -- snapshot at submission time
  package_name      text,                   -- snapshot at submission time
  name              text         not null,
  organization      text,
  email             text,
  phone             text,
  message           text,
  preferred_channel lead_channel not null default 'form',
  status            lead_status  not null default 'baru',
  admin_notes       text,
  source            text         default 'website',
  ip_hash           text,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. LEAD ACTIVITIES  (status history + notes)
-- ---------------------------------------------------------------------------
create table lead_activities (
  id         uuid        primary key default gen_random_uuid(),
  lead_id    uuid        not null references leads(id) on delete cascade,
  actor_id   uuid        references profiles(id) on delete set null,
  action     text        not null,   -- 'status_change' | 'note' | 'created'
  note       text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 9. SITE SETTINGS  (key / value pairs)
-- ---------------------------------------------------------------------------
create table site_settings (
  key        text        primary key,
  value      jsonb       not null,
  is_public  boolean     not null default false,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 10. is_staff() helper — used by all RLS policies
-- ---------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin','editor')
  );
$$;

-- ---------------------------------------------------------------------------
-- 11. Enable RLS on every table
-- ---------------------------------------------------------------------------
alter table profiles         enable row level security;
alter table segments         enable row level security;
alter table packages         enable row level security;
alter table package_features enable row level security;
alter table leads            enable row level security;
alter table lead_activities  enable row level security;
alter table site_settings    enable row level security;

-- ---------------------------------------------------------------------------
-- 12. RLS — SEGMENTS
-- anon + authenticated see only is_active rows; staff see all.
-- ---------------------------------------------------------------------------
create policy "read active segments"
  on segments for select
  to anon, authenticated
  using (is_active or public.is_staff());

create policy "staff manage segments"
  on segments for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 13. RLS — PACKAGES
-- ---------------------------------------------------------------------------
create policy "read active packages"
  on packages for select
  to anon, authenticated
  using (is_active or public.is_staff());

create policy "staff manage packages"
  on packages for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 14. RLS — PACKAGE FEATURES
-- All active features are public (anon can read); staff manage.
-- ---------------------------------------------------------------------------
create policy "read package features"
  on package_features for select
  to anon, authenticated
  using (true);

create policy "staff manage features"
  on package_features for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 15. RLS — SITE SETTINGS
-- anon see only is_public rows; staff see all.
-- ---------------------------------------------------------------------------
create policy "read public settings"
  on site_settings for select
  to anon, authenticated
  using (is_public or public.is_staff());

create policy "staff manage settings"
  on site_settings for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 16. RLS — LEADS  (ZERO anon access — no anon policy at all)
-- Insert is done via service-role (bypasses RLS entirely).
-- ---------------------------------------------------------------------------
create policy "staff read leads"
  on leads for select
  to authenticated
  using (public.is_staff());

create policy "staff update leads"
  on leads for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "admin delete leads"
  on leads for delete
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 17. RLS — LEAD ACTIVITIES  (no anon access)
-- ---------------------------------------------------------------------------
create policy "staff read activities"
  on lead_activities for select
  to authenticated
  using (public.is_staff());

create policy "staff write activities"
  on lead_activities for insert
  to authenticated
  with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 18. RLS — PROFILES
-- ---------------------------------------------------------------------------
create policy "read own profile"
  on profiles for select
  to authenticated
  using (id = auth.uid() or public.is_staff());

-- ---------------------------------------------------------------------------
-- 19. moddatetime triggers  (auto-update updated_at)
-- ---------------------------------------------------------------------------
create trigger seg_upd
  before update on segments
  for each row execute procedure moddatetime(updated_at);

create trigger pkg_upd
  before update on packages
  for each row execute procedure moddatetime(updated_at);

create trigger lead_upd
  before update on leads
  for each row execute procedure moddatetime(updated_at);
