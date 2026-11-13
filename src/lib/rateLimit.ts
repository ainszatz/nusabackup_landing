import 'server-only'

// In-memory rate limiters — single Docker process, resets on container restart.
// Per design-spec §6: max 3 lead submissions per IP per 60-minute window.
// Login uses a tighter window/limit to slow down credential stuffing.

interface RateEntry {
  count: number
  windowStart: number
}

function createLimiter(windowMs: number, maxPerWindow: number) {
  // Module-level Map persists across requests within the same Node.js process.
  const store = new Map<string, RateEntry>()

  return function check(key: string): { allowed: boolean } {
    const now = Date.now()

    // Prune expired entries on each invocation to keep memory bounded.
    for (const [storedKey, entry] of store) {
      if (now - entry.windowStart >= windowMs) store.delete(storedKey)
    }

    const entry = store.get(key)

    if (!entry || now - entry.windowStart >= windowMs) {
      store.set(key, { count: 1, windowStart: now })
      return { allowed: true }
    }

    if (entry.count >= maxPerWindow) {
      return { allowed: false }
    }

    entry.count += 1
    return { allowed: true }
  }
}

const LEAD_WINDOW_MS = 60 * 60 * 1000 // 60 minutes
const LEAD_MAX_PER_WINDOW = 3

const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const LOGIN_MAX_PER_WINDOW = 5

const leadLimiter = createLimiter(LEAD_WINDOW_MS, LEAD_MAX_PER_WINDOW)
const loginLimiter = createLimiter(LOGIN_WINDOW_MS, LOGIN_MAX_PER_WINDOW)

export function checkRateLimit(ipHash: string): { allowed: boolean } {
  return leadLimiter(ipHash)
}

export function checkLoginRateLimit(ipHash: string): { allowed: boolean } {
  return loginLimiter(ipHash)
}
