import 'server-only'

// In-memory rate limiter — single Docker process, resets on container restart.
// Per design-spec §6: max 3 submissions per IP per 60-minute window.

interface RateEntry {
  count: number
  windowStart: number
}

const WINDOW_MS = 60 * 60 * 1000 // 60 minutes
const MAX_PER_WINDOW = 3

// Module-level Map persists across requests within the same Node.js process.
const store = new Map<string, RateEntry>()

export function checkRateLimit(ipHash: string): { allowed: boolean } {
  const now = Date.now()

  // Prune expired entries on each invocation to keep memory bounded.
  for (const [key, entry] of store) {
    if (now - entry.windowStart >= WINDOW_MS) store.delete(key)
  }

  const entry = store.get(ipHash)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(ipHash, { count: 1, windowStart: now })
    return { allowed: true }
  }

  if (entry.count >= MAX_PER_WINDOW) {
    return { allowed: false }
  }

  entry.count += 1
  return { allowed: true }
}
