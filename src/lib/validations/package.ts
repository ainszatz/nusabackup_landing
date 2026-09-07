import { z } from 'zod'

export const featureSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1, 'Label fitur tidak boleh kosong').max(200),
  is_included: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
})

export const packageSchema = z.object({
  id: z.string().uuid().optional(),
  segment_id: z.string().uuid('Segmen wajib dipilih'),
  slug: z
    .string()
    .min(2, 'Slug minimal 2 karakter')
    .max(50, 'Slug terlalu panjang')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  description: z.string().max(2000).optional(),
  badge_label: z.string().max(50).optional(),
  // Not z.coerce.boolean(): that calls JS `Boolean(x)`, so the string 'false'
  // (an unchecked checkbox's fallback value) coerces to `true`. Handle
  // checked/unchecked/absent explicitly instead.
  is_featured: z
    .union([z.boolean(), z.string()])
    .nullish()
    .transform((v) => v !== undefined && v !== null && v !== false && v !== 'false'),
  // Same z.coerce.boolean() bug as is_featured above, different control:
  // this comes from a <select> ('true'/'false'), which always sends a
  // value, but the string 'false' still needs to map to `false`, not
  // Boolean('false') === true.
  is_active: z
    .union([z.boolean(), z.string()])
    .nullish()
    .transform((v) => v === undefined || v === null || (v !== false && v !== 'false')),
  sort_order: z.coerce.number().int().min(0).default(0),
  price_prefix: z.string().max(50).optional(),
  price_amount: z.coerce.number().min(0).nullable().optional(),
  price_period: z.string().max(50).optional(),
  currency: z.string().max(10).optional(),
})

export const featuresArraySchema = z.array(featureSchema)

export type PackageFormData = z.infer<typeof packageSchema>
export type FeatureFormData = z.infer<typeof featureSchema>
