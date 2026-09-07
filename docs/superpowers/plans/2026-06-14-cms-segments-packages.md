# CMS Segments + Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build admin CMS pages for segment and package management with icon upload, inline feature editing, and ISR revalidation.

**Architecture:** All mutations go through Server Actions (`actions/assets.ts`, `actions/segments.ts`, `actions/packages.ts`) that verify staff role then use the service-role client. Pages are RSC `force-dynamic`; dialogs are client components managing local state. Features are batched with the parent package save (no partial saves). revalidateTag('segments'|'packages') fires on every mutation so the public site reflects changes immediately.

**Tech Stack:** Next.js 16 App Router, Supabase (service-role for mutations), shadcn/ui (base-nova: Dialog, Switch, Checkbox), Zod validation, Tailwind CSS.

---

## Files

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/validations/segment.ts` | Create | Zod schema for segment upsert |
| `src/lib/validations/package.ts` | Create | Zod schema for package + feature |
| `src/lib/queries/segments.ts` | Modify | Add `getAllSegments()` (no is_active filter, staff-only) |
| `src/lib/queries/packages.ts` | Modify | Add `getAllPackagesGrouped()` |
| `src/actions/assets.ts` | Create | `uploadIcon`, `deleteIcon` |
| `src/actions/segments.ts` | Create | `upsertSegment`, `deleteSegment`, `toggleSegmentActive` |
| `src/actions/packages.ts` | Create | `upsertPackage`, `deletePackage`, `upsertFeature`, `deleteFeature` |
| `src/lib/queries/leads.ts` | Modify | Escape PostgREST metacharacters in search |
| `src/components/admin/ConfirmDialog.tsx` | Create | Reusable confirm dialog (client) |
| `src/components/admin/AdminSidebar.tsx` | Modify | Enable Segments + Packages nav links |
| `src/app/(admin)/admin/segments/SegmentFormDialog.tsx` | Create | Add/edit segment dialog (client) |
| `src/app/(admin)/admin/segments/page.tsx` | Replace | Full segments CMS page |
| `src/app/(admin)/admin/packages/PackageFormDialog.tsx` | Create | Add/edit package + features dialog (client) |
| `src/app/(admin)/admin/packages/page.tsx` | Replace | Full packages CMS page |

---

### Task 1: Install shadcn/ui components

- [ ] Run: `pnpm dlx shadcn@latest add dialog switch checkbox --yes`
- [ ] Verify: `src/components/ui/dialog.tsx`, `switch.tsx`, `checkbox.tsx` exist

### Task 2: Fix security findings from audit

- [ ] In `src/lib/queries/leads.ts` — escape PostgREST metacharacters before `.or()`:
```ts
if (q && q.trim().length > 0) {
  const safe = q.trim().replace(/[%_\\()',]/g, (c) => `\\${c}`)
  query = query.or(`name.ilike.%${safe}%,organization.ilike.%${safe}%`)
}
```

### Task 3: Zod validations

- [ ] `src/lib/validations/segment.ts`:
```ts
import { z } from 'zod'
export const segmentSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug: huruf kecil, angka, dan tanda hubung'),
  name: z.string().min(2).max(100),
  tagline: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  hero_headline: z.string().max(200).optional(),
  hero_subheadline: z.string().max(500).optional(),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.coerce.boolean().default(true),
})
export type SegmentFormData = z.infer<typeof segmentSchema>
```

- [ ] `src/lib/validations/package.ts`:
```ts
import { z } from 'zod'
export const featureSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(200),
  is_included: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
})
export const packageSchema = z.object({
  id: z.string().uuid().optional(),
  segment_id: z.string().uuid('Segmen wajib dipilih'),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug: huruf kecil, angka, dan tanda hubung'),
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  badge_label: z.string().max(50).optional(),
  is_featured: z.coerce.boolean().default(false),
  is_active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
  price_prefix: z.string().max(50).optional(),
  price_amount: z.coerce.number().min(0).optional().nullable(),
  price_period: z.string().max(50).optional(),
  currency: z.string().max(10).optional(),
})
export type PackageFormData = z.infer<typeof packageSchema>
export type FeatureFormData = z.infer<typeof featureSchema>
```

### Task 4: Admin queries (no RLS cache — staff only)

- [ ] Add to `src/lib/queries/segments.ts` (use SSR client, no unstable_cache):
```ts
import { createClient } from '@/lib/supabase/server'
export async function getAllSegments() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('segments').select('*').order('sort_order')
  if (error) throw new Error(error.message)
  return data ?? []
}
```

- [ ] Add to `src/lib/queries/packages.ts`:
```ts
import { createClient } from '@/lib/supabase/server'
export async function getAllPackagesGrouped() {
  const supabase = await createClient()
  const { data: segments, error: segErr } = await supabase
    .from('segments').select('id, name, slug').order('sort_order')
  if (segErr) throw new Error(segErr.message)
  const { data: packages, error: pkgErr } = await supabase
    .from('packages')
    .select('*, features:package_features(id, label, is_included, sort_order)')
    .order('sort_order')
  if (pkgErr) throw new Error(pkgErr.message)
  return (segments ?? []).map((seg) => ({
    ...seg,
    packages: (packages ?? []).filter((p) => p.segment_id === seg.id),
  }))
}
```

### Task 5: Asset actions

- [ ] Create `src/actions/assets.ts`:
```ts
'use server'
import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/webp', 'image/jpeg']
const MAX_SIZE = 500 * 1024 // 500KB

export async function uploadIcon(
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_TYPES.includes(file.type))
    return { error: 'Format tidak didukung. Gunakan SVG, PNG, atau WEBP.' }
  if (file.size > MAX_SIZE)
    return { error: 'Ukuran file maksimal 500KB.' }

  const ext = file.name.split('.').pop() ?? 'png'
  const path = `icons/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes = await file.arrayBuffer()

  const supabase = createAdminClient()
  const { error } = await supabase.storage
    .from('assets')
    .upload(path, bytes, { contentType: file.type, upsert: false })
  if (error) return { error: error.message }

  const { data } = supabase.storage.from('assets').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function deleteIcon(url: string): Promise<void> {
  if (!url) return
  const supabase = createAdminClient()
  const match = url.match(/\/storage\/v1\/object\/public\/assets\/(.+)$/)
  if (!match) return
  await supabase.storage.from('assets').remove([match[1]])
}
```

### Task 6: Segment actions

- [ ] Create `src/actions/segments.ts`:
```ts
'use server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { segmentSchema } from '@/lib/validations/segment'
import { uploadIcon, deleteIcon } from './assets'
import type { AdminActionState } from './leads'

async function verifyStaff() { /* same pattern as leads.ts */ }

export async function upsertSegment(
  _prev: AdminActionState, formData: FormData
): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Tidak ada akses.' }

  const raw = Object.fromEntries(formData)
  const parsed = segmentSchema.safeParse({ ...raw, is_active: raw.is_active === 'true' })
  if (!parsed.success)
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const data = parsed.data
  let iconUrl: string | null = (formData.get('existing_icon') as string) || null
  const iconFile = formData.get('icon') as File | null
  if (iconFile && iconFile.size > 0) {
    const result = await uploadIcon(iconFile)
    if ('error' in result) return { status: 'error', message: result.error }
    iconUrl = result.url
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('segments').upsert({
    id: data.id,
    slug: data.slug, name: data.name, tagline: data.tagline ?? null,
    description: data.description ?? null, hero_headline: data.hero_headline ?? null,
    hero_subheadline: data.hero_subheadline ?? null, meta_title: data.meta_title ?? null,
    meta_description: data.meta_description ?? null, sort_order: data.sort_order,
    is_active: data.is_active, icon: iconUrl,
  }, { onConflict: 'id' })
  if (error) return { status: 'error', message: error.message }

  revalidateTag('segments')
  return { status: 'success', message: `Segmen berhasil ${data.id ? 'diperbarui' : 'ditambahkan'}.` }
}

export async function deleteSegment(id: string): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Tidak ada akses.' }

  const supabase = createAdminClient()
  const { data: seg } = await supabase.from('segments').select('icon').eq('id', id).single()
  if (seg?.icon) await deleteIcon(seg.icon)

  const { error } = await supabase.from('segments').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }
  revalidateTag('segments')
  return { status: 'success', message: 'Segmen berhasil dihapus.' }
}

export async function toggleSegmentActive(id: string, is_active: boolean): Promise<AdminActionState> {
  const staff = await verifyStaff()
  if (!staff) return { status: 'error', message: 'Tidak ada akses.' }
  const supabase = createAdminClient()
  const { error } = await supabase.from('segments').update({ is_active }).eq('id', id)
  if (error) return { status: 'error', message: error.message }
  revalidateTag('segments')
  return { status: 'success', message: '' }
}
```

### Task 7: Package actions

- [ ] Create `src/actions/packages.ts` with `upsertPackage`, `deletePackage`, `upsertFeature`, `deleteFeature`.
  - `upsertPackage` receives features as JSON string in formData['features']
  - After upserting the package, delete all existing features then insert the new list
  - `upsertFeature` / `deleteFeature` for direct calls from other contexts

### Task 8: Admin components

- [ ] Create `src/components/admin/ConfirmDialog.tsx` — client component wrapping shadcn Dialog with title, description, confirm/cancel buttons
- [ ] Update `src/components/admin/AdminSidebar.tsx` — add Segments + Packages to NAV, remove `disabled: true` from them

### Task 9: Segments CMS page

- [ ] Create `src/app/(admin)/admin/segments/SegmentFormDialog.tsx` — client component:
  - Props: `segment?: Segment` (undefined = add mode)
  - Local state for all fields
  - File input with current icon preview
  - Calls `upsertSegment` via `useActionState`
  - Closes on success

- [ ] Replace `src/app/(admin)/admin/segments/page.tsx` with full RSC:
  - `getAllSegments()` → render table
  - Each row: slug, name, active toggle (inline switch), edit button (opens dialog), delete button (opens confirm)

### Task 10: Packages CMS page

- [ ] Create `src/app/(admin)/admin/packages/PackageFormDialog.tsx` — client component:
  - Features managed in local state array
  - Add/remove/toggle/reorder features inline before saving
  - Calls `upsertPackage` via `useActionState` with features JSON in hidden input

- [ ] Replace `src/app/(admin)/admin/packages/page.tsx` with full RSC:
  - `getAllPackagesGrouped()` → render by segment
  - Each package row: name, price, featured badge, active toggle, edit/delete

### Task 11: Commit

- [ ] `git add -A && git commit -m "feat(admin): segments + packages cms with icon upload"`
- [ ] Tick Session 6 in PROGRESS.md
