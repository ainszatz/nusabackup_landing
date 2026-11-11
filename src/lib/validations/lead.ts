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
    .min(8, 'Nomor telepon minimal 8 digit')
    .max(20, 'Nomor telepon terlalu panjang')
    .regex(
      /^(\+?62|0)8\d{7,12}$/,
      'Nomor telepon tidak valid (contoh: 08123456789)'
    )
    .optional(),
  organization: z.string().max(150, 'Nama organisasi terlalu panjang').optional(),
  message: z.string().max(1000, 'Pesan terlalu panjang').optional(),
  preferred_channel: z.enum(['form', 'whatsapp', 'email']),
  segment_id: z.string().nullable().optional(),
  package_id: z.string().nullable().optional(),
  segment_name: z.string().nullable().optional(),
  package_name: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  // A lead with no reachable channel is useless — require at least one.
  if (!data.email && !data.phone) {
    ctx.addIssue({
      code: 'custom',
      path: ['phone'],
      message: 'Isi minimal salah satu: nomor WhatsApp atau email.',
    })
  }
})

export type LeadFormData = z.infer<typeof leadSchema>
