'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateSettings } from '@/actions/settings'
import type { PublicSettings } from '@/types'

export function SettingsForm({ settings }: { settings: PublicSettings }) {
  const [state, action, pending] = useActionState(updateSettings, null)

  return (
    <form action={action} className="space-y-8">
      {/* ── Kontak Publik ── */}
      <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          Informasi Kontak Publik
        </legend>

        <div className="space-y-1.5">
          <Label htmlFor="wa_number">Nomor WhatsApp</Label>
          <Input
            id="wa_number"
            name="wa_number"
            defaultValue={settings.wa_number ?? ''}
            placeholder="628123456789"
            inputMode="numeric"
          />
          <p className="text-xs text-slate-500">Hanya angka, tanpa tanda + (contoh: 628123456789)</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email Publik</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={settings.email ?? ''}
            placeholder="halo@nusabackup.id"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Alamat</Label>
          <Textarea
            id="address"
            name="address"
            defaultValue={settings.address ?? ''}
            rows={2}
            placeholder="Jakarta, Indonesia"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="social_instagram">Instagram URL</Label>
            <Input
              id="social_instagram"
              name="social_instagram"
              defaultValue={settings.social_instagram ?? ''}
              placeholder="https://instagram.com/nusabackup"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="social_linkedin">LinkedIn URL</Label>
            <Input
              id="social_linkedin"
              name="social_linkedin"
              defaultValue={settings.social_linkedin ?? ''}
              placeholder="https://linkedin.com/company/nusabackup"
            />
          </div>
        </div>
      </fieldset>

      {/* ── Notifikasi Admin ── */}
      <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          Notifikasi Admin (tidak ditampilkan ke publik)
        </legend>

        <div className="space-y-1.5">
          <Label htmlFor="admin_notify_email">Email Notifikasi Lead</Label>
          <Input
            id="admin_notify_email"
            name="admin_notify_email"
            type="email"
            defaultValue={settings.admin_notify_email ?? ''}
            placeholder="admin@nusabackup.id"
          />
          <p className="text-xs text-slate-500">Lead baru akan dikirim ke email ini via Resend.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="admin_notify_wa">WA Notifikasi Lead</Label>
          <Input
            id="admin_notify_wa"
            name="admin_notify_wa"
            defaultValue={settings.admin_notify_wa ?? ''}
            placeholder="628123456789"
            inputMode="numeric"
          />
          <p className="text-xs text-slate-500">Lead baru akan dikirim ke nomor ini via Fonnte.</p>
        </div>
      </fieldset>

      {/* ── SEO Default ── */}
      <fieldset className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          SEO Default Situs
        </legend>

        <div className="space-y-1.5">
          <Label htmlFor="meta_title">Meta Title Default</Label>
          <Input
            id="meta_title"
            name="meta_title"
            defaultValue={settings.meta_title ?? ''}
            placeholder="NusaBackup — Layanan Backup Offsite & Disaster Recovery"
            maxLength={70}
          />
          <p className="text-xs text-slate-500">Maksimal 70 karakter. Dipakai sebagai fallback bila halaman tidak punya meta title sendiri.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="meta_description">Meta Description Default</Label>
          <Textarea
            id="meta_description"
            name="meta_description"
            defaultValue={settings.meta_description ?? ''}
            rows={3}
            placeholder="NusaBackup menyediakan layanan backup offsite dan disaster recovery..."
            maxLength={160}
          />
          <p className="text-xs text-slate-500">Maksimal 160 karakter.</p>
        </div>
      </fieldset>

      {state?.status === 'error' && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}
      {state?.status === 'success' && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </form>
  )
}
