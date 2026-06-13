import 'server-only'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nusabackup.id'

export interface LeadNotificationData {
  id: string
  name: string
  organization: string | null
  email: string | null
  phone: string | null
  message: string | null
  segment_name: string | null
  package_name: string | null
  preferred_channel: string
  created_at: string
}

export async function sendLeadEmail(lead: LeadNotificationData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL

  if (!apiKey || !adminEmail) {
    console.warn('[notifications/email] RESEND_API_KEY or ADMIN_NOTIFY_EMAIL not set — skipping')
    return
  }

  const packageLabel = lead.package_name ?? lead.segment_name ?? 'NusaBackup'
  const adminUrl = `${SITE_URL}/admin/leads/${lead.id}`
  const createdAt = new Date(lead.created_at).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'long',
    timeStyle: 'short',
  })

  const text = [
    `Lead baru masuk — ${packageLabel}`,
    '',
    `Nama         : ${lead.name}`,
    `Organisasi   : ${lead.organization ?? '—'}`,
    `Email        : ${lead.email ?? '—'}`,
    `Telepon      : ${lead.phone ?? '—'}`,
    `Segmen       : ${lead.segment_name ?? '—'}`,
    `Paket        : ${lead.package_name ?? '—'}`,
    `Channel      : ${lead.preferred_channel}`,
    `Pesan        : ${lead.message ?? '—'}`,
    `Waktu        : ${createdAt}`,
    '',
    `Lihat detail : ${adminUrl}`,
  ].join('\n')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NusaBackup <noreply@nusabackup.id>',
        to: [adminEmail],
        subject: `Lead Baru — ${packageLabel}`,
        text,
      }),
    })

    if (!res.ok) {
      console.error('[notifications/email] Resend responded', res.status, await res.text())
    }
  } catch (err) {
    console.error('[notifications/email] Fetch failed', err)
  }
}
