# NusaBackup — Design Spec
**Date:** 2026-06-12  
**Status:** Approved  
**Stack:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · Supabase · shadcn/ui (admin only)

---

## 1. Summary

NusaBackup is a company profile website and lead generation engine for an offsite backup & disaster recovery service. It serves three customer segments (Umum, Pendidikan, Kesehatan), converts visitors into structured leads via a form stored in Supabase, and gives admins full control over content (segments, packages, settings) and lead lifecycle through a protected dashboard.

---

## 2. Decisions Made

| Question | Decision |
|---|---|
| Package detail page `/[segment]/[package]` | **In scope for MVP** |
| Segment/package icons | **Supabase Storage** (SVG/PNG/WEBP uploads via CMS) |
| Editor role | **Schema-only** — not active in MVP; 1 admin account |
| Deploy target | **Homelab** — Docker + Cloudflare Tunnel |
| UI component strategy | **Custom Tailwind marketing** (frontend-design skill) + **shadcn/ui admin** |

---

## 3. Architecture

### Rendering Strategy

| Layer | Strategy | Cache tags |
|---|---|---|
| Public pages | SSG + on-demand ISR | `segments`, `packages`, `settings` |
| Admin pages | `force-dynamic` | none |

ISR is triggered by `revalidateTag(...)` inside Server Actions when CMS content is saved. No separate webhook needed.

### Data Clients

- **`lib/supabase/server.ts`** — anon key, respects RLS. Used in RSC public queries and middleware session checks.
- **`lib/supabase/admin.ts`** — service-role key, `import 'server-only'` at top. Used exclusively in Server Actions for lead insert and all CMS mutations.

### Folder Structure

```
src/
  app/
    (marketing)/
      layout.tsx
      page.tsx                        # Home
      umum/page.tsx
      pendidikan/page.tsx
      kesehatan/page.tsx
      [segment]/[package]/page.tsx    # Package detail (in scope)
      kontak/page.tsx
    (admin)/
      admin/
        login/page.tsx
        layout.tsx                    # session + role guard
        page.tsx                      # dashboard
        leads/page.tsx
        leads/[id]/page.tsx
        segments/page.tsx
        packages/page.tsx
        settings/page.tsx
    sitemap.ts
    robots.ts
  components/
    marketing/                        # Custom Tailwind (frontend-design skill)
    admin/                            # shadcn/ui-based
    ui/                               # shadcn/ui primitives
  lib/
    supabase/
      server.ts                       # anon client
      admin.ts                        # service-role (server-only)
      middleware.ts
    validations/
    notifications/
      email.ts                        # Resend
      whatsapp.ts                     # Fonnte
    queries/
  actions/
    leads.ts
    segments.ts
    packages.ts
    settings.ts
    assets.ts                         # icon upload/delete
  middleware.ts
  types/
```

---

## 4. Database

Schema exactly as defined in the PRD (section 9), including all enums, tables, RLS policies, `is_staff()` function, and `moddatetime` triggers.

**Additional:** `assets` bucket in Supabase Storage (public read). Icon URLs stored as text columns in `segments.icon` and `packages.icon`.

**Seed data:** All 3 segments and their packages/features from PRD section 6 seeded via `seed.sql`.

**Key security invariant:** The `leads` table has zero anon access — insert only via service-role in Server Actions, read only by staff via RLS.

---

## 5. Public Site

### Routes & Data

| Route | Data source | ISR tags |
|---|---|---|
| `/` | Active segments + featured packages + public settings | `segments`, `packages`, `settings` |
| `/umum`, `/pendidikan`, `/kesehatan` | Segment + active packages + features | `segments`, `packages` |
| `/[segment]/[package]` | Package + features + parent segment | `packages` |
| `/kontak` | Public site_settings (WA, email, address) | `settings` |

### Key Marketing Components (custom Tailwind)

- **`Hero`** — full-bleed, headline + subheadline, primary CTA (form) + secondary CTA (WA).
- **`SegmentCard`** — links to segment page; icon via `next/image` from Supabase Storage.
- **`PackageCard`** — name, price (prefix + amount + period), featured badge, feature checklist, "Pesan" button (opens LeadForm pre-filled), "Hubungi via WA" button (prefilled WA link).
- **`LeadForm`** — opens as a **modal** (triggered by "Pesan" button); hidden segment/package fields; honeypot; calls `submitLead`.
- **`ContactInfo`** — renders WA/email/address from site_settings.

### Direct Contact Buttons (FR-10)

Always visible alongside the form. WA: `https://wa.me/{wa_number}?text={encoded_prefilled_message}`. Email: `mailto:` with subject + body. Both prefilled per package context.

---

## 6. Lead Engine

### Submit Flow

1. Client submits `LeadForm` → `submitLead` Server Action.
2. Zod validation + honeypot check + rate-limit check (IP-hash, max 3/hour/IP via Supabase-backed counter).
3. Service-role client inserts into `leads`.
4. In parallel (fail-soft): Resend email + Fonnte WA to admin.
5. Return success state → UI confirmation.

### Rate Limiting

IP hash from `CF-Connecting-IP` header (Cloudflare Tunnel). **In-memory LRU Map** (single Docker container, no Redis or extra DB table needed): `Map<ipHash, { count: number, windowStart: number }>`, pruned on each check. Max 3 submissions per IP per 60-minute window. Resets on container restart — acceptable for MVP.

### Notifications

| Channel | Tool | Content |
|---|---|---|
| Email | Resend | Subject: `Lead Baru — {package_name}`. Body: all lead fields + link to `/admin/leads/{id}`. |
| WhatsApp | Fonnte | `[NusaBackup] Lead baru dari {name} ({organization}) untuk paket {package_name}. Cek: {url}/admin/leads/{id}` |

Both fail-soft: errors logged, lead insert is not rolled back.

---

## 7. Admin Dashboard & Lead Management

### Auth & Guards

- Supabase Auth email/password. Account created manually (no self-registration).
- `middleware.ts` guards all `/admin/*` — redirects to `/admin/login` on missing session.
- Admin layout loads `profiles.role`; rejects non-staff with 403.

### Pages

**`/admin`** — Dashboard: status summary cards + 10 most recent leads table. `force-dynamic`.

**`/admin/leads`** — shadcn/ui DataTable. Server-side filter by status + text search on name/organization. URL-based filter state (`?status=baru&q=...`).

**`/admin/leads/[id]`** — Full lead detail. Status dropdown (calls `updateLeadStatus` → writes `lead_activities`). Note form (calls `addLeadNote` → appends to `lead_activities`). Activity timeline.

### Server Actions

| Action | File | Trigger |
|---|---|---|
| `submitLead` | `actions/leads.ts` | Public form |
| `updateLeadStatus` | `actions/leads.ts` | Admin detail page |
| `addLeadNote` | `actions/leads.ts` | Admin detail page |
| `upsertSegment` / `deleteSegment` | `actions/segments.ts` | CMS |
| `upsertPackage` / `deletePackage` | `actions/packages.ts` | CMS |
| `upsertFeature` / `deleteFeature` | `actions/packages.ts` | CMS |
| `updateSettings` | `actions/settings.ts` | CMS |
| `uploadIcon` / `deleteIcon` | `actions/assets.ts` | CMS |

Every staff action: verify session + role at top before any mutation.

---

## 8. CMS

### `/admin/segments`

List of all segments. Toggle active inline. Add/Edit via Dialog: slug, name, tagline, description, hero copy, meta fields, sort order, active toggle, icon upload. Delete with confirmation (cascades). Save → `revalidateTag('segments')`.

### `/admin/packages`

Grouped by segment. Add/Edit via Dialog: all package fields + price fields + badge + featured + sort + active + icon upload. Inline feature sub-list within dialog: add/edit/delete/reorder features (label + included toggle). Save → `revalidateTag('packages')`.

### `/admin/settings`

Single form: WA number, admin notify email, address, social links, default meta title/description. Stored as key/value in `site_settings`. `is_public = true` for WA/address/socials. Save → `revalidateTag('settings')`.

### Icon Upload Flow

File input → `uploadIcon` Server Action → validate type (SVG/PNG/WEBP) + size (≤ 500KB) → upload to `assets/` bucket via service-role → return public URL → stored in `segments.icon` / `packages.icon`.

---

## 9. SEO, Performance & Security

### SEO

- `generateMetadata` per route: DB values → fallback to `site_settings` defaults.
- `sitemap.ts`: dynamic, lists all active segment + package slugs.
- `robots.ts`: allow all, disallow `/admin/*`.
- JSON-LD: `Organization` on home, `Service` on each segment page.
- Open Graph on all public pages.

### Performance

- All images via `next/image`. Supabase Storage domain in `next.config.ts` `remotePatterns`.
- `next/font` for Google Fonts (zero layout shift).
- ISR: public pages static after first request — zero DB hit per subsequent request.
- Target: Lighthouse mobile ≥ 90.

### Security

- `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `FONNTE_TOKEN` — never in `NEXT_PUBLIC_*`.
- `import 'server-only'` in `lib/supabase/admin.ts` and all notification helpers.
- Zod on all Server Action inputs.
- Honeypot + IP-hash rate limit on lead form.
- CSP + security headers in `next.config.ts` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
- RLS on all tables; `leads` has zero anon access.

---

## 10. Deployment

### Docker

```dockerfile
# Multi-stage: node:20-alpine builder → slim runner
# Runs: next start (not static export — required for ISR + Server Actions)
```

### docker-compose.yml

Single `web` service. Env file (`.env.production`). Internal port 3000.

### Cloudflare Tunnel

`cloudflared` terminates TLS externally, forwards to container port 3000. No Vercel-specific APIs used — `revalidateTag` and Server Actions work identically in self-hosted Next.js.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=
FONNTE_TOKEN=
ADMIN_NOTIFY_EMAIL=
ADMIN_NOTIFY_WA=
```

---

## 11. Build Phases (from PRD)

| Phase | Focus |
|---|---|
| 0 — Setup | Repo, Tailwind, Supabase project, env, client server/admin |
| 1 — Schema & Seed | Migrations + RLS + triggers + seed data |
| 2 — Public Site | Home, 3 segment pages, package detail, ISR |
| 3 — Lead Engine | Form + Server Action + Resend/Fonnte + honeypot/rate-limit |
| 4 — Admin & Auth | Login, middleware, dashboard, lead management |
| 5 — CMS | CRUD segments/packages/features/settings + icon upload + revalidate |
| 6 — Polish | SEO, a11y, performance, error states, Docker + Cloudflare setup |
