import { z } from 'zod'

const optionalUrl = z
  .string()
  .max(300)
  .refine((v) => v === '' || /^https?:\/\/.+/.test(v), 'URL harus diawali https://')
  .optional()
  .or(z.literal(''))

export const settingsSchema = z.object({
  wa_number: z
    .string()
    .max(20)
    .regex(/^\d*$/, 'Nomor WA hanya boleh angka (tanpa +)')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Format email tidak valid').max(200).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  social_instagram: optionalUrl,
  social_linkedin: optionalUrl,
  meta_title: z.string().max(70, 'Meta title maksimal 70 karakter').optional().or(z.literal('')),
  meta_description: z
    .string()
    .max(160, 'Meta description maksimal 160 karakter')
    .optional()
    .or(z.literal('')),
  admin_notify_email: z
    .string()
    .email('Format email tidak valid')
    .max(200)
    .optional()
    .or(z.literal('')),
  admin_notify_wa: z
    .string()
    .max(20)
    .regex(/^\d*$/, 'Nomor WA hanya boleh angka')
    .optional()
    .or(z.literal('')),
})

export type SettingsFormData = z.infer<typeof settingsSchema>
