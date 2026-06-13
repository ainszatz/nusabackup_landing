import { z } from 'zod'

export const leadSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama terlalu panjang'),
  email: z
    .string()
    .email('Format email tidak valid')
    .max(200)
    .optional(),
  phone: z
    .string()
    .min(6, 'Nomor telepon minimal 6 karakter')
    .max(20, 'Nomor telepon terlalu panjang')
    .optional(),
  organization: z.string().max(150, 'Nama organisasi terlalu panjang').optional(),
  message: z.string().max(1000, 'Pesan terlalu panjang').optional(),
  preferred_channel: z.enum(['form', 'whatsapp', 'email']),
  segment_id: z.string().nullable().optional(),
  package_id: z.string().nullable().optional(),
  segment_name: z.string().nullable().optional(),
  package_name: z.string().nullable().optional(),
})

export type LeadFormData = z.infer<typeof leadSchema>
