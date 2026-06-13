import 'server-only'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nusabackup.id'

export interface LeadNotificationData {
  id: string
  name: string
  organization: string | null
  package_name: string | null
}

export async function sendLeadWhatsApp(lead: LeadNotificationData): Promise<void> {
  const token = process.env.FONNTE_TOKEN
  const adminWa = process.env.ADMIN_NOTIFY_WA

  if (!token || !adminWa) {
    console.warn('[notifications/whatsapp] FONNTE_TOKEN or ADMIN_NOTIFY_WA not set — skipping')
    return
  }

  const adminUrl = `${SITE_URL}/admin/leads/${lead.id}`
  const packageLabel = lead.package_name ?? 'NusaBackup'
  const org = lead.organization ? ` (${lead.organization})` : ''
  const message = `[NusaBackup] Lead baru dari ${lead.name}${org} untuk paket ${packageLabel}. Cek: ${adminUrl}`

  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: adminWa,
        message,
        countryCode: '62',
      }),
    })

    if (!res.ok) {
      console.error('[notifications/whatsapp] Fonnte responded', res.status, await res.text())
    }
  } catch (err) {
    console.error('[notifications/whatsapp] Fetch failed', err)
  }
}
