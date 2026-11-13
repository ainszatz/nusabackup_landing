import 'server-only'
import { createHash } from 'crypto'
import { headers } from 'next/headers'

/**
 * Returns a short, non-reversible client identifier for rate limiting.
 * Cloudflare Tunnel sets CF-Connecting-IP; x-forwarded-for is only used as a
 * fallback (e.g. local development).
 */
export async function getClientIpHash(): Promise<string> {
  const headersList = await headers()
  const rawIp =
    headersList.get('CF-Connecting-IP') ??
    headersList.get('x-forwarded-for') ??
    '127.0.0.1'
  const ip = rawIp.split(',')[0].trim()
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}
