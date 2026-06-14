import { z } from 'zod'

export const segmentSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(2, 'Slug minimal 2 karakter')
    .max(50, 'Slug terlalu panjang')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
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
