-- Structured consent evidence for leads (UU PDP No. 27/2022).
-- Until this migration is applied, the app falls back to admin_notes so no
-- evidence is lost; run `supabase db push` before deploying the companion code.
alter table public.leads
  add column if not exists consent_at timestamptz,
  add column if not exists consent_version text;

comment on column public.leads.consent_at is
  'Timestamp when the lead accepted the privacy policy';
comment on column public.leads.consent_version is
  'Version of the privacy policy accepted (see src/lib/consent.ts)';
