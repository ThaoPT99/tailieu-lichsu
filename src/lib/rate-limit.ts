/**
 * Simple in-memory rate limiter.
 * Note: Resets on server restart. For multi-instance deploy, use Redis.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  req: Request,
  key: string,
  maxRequests: number
): { ok: boolean; retryAfter?: number } {
  const ip = getClientIp(req);
  const id = `${key}:${ip}`;
  const now = Date.now();

  let entry = store.get(id);
  if (!entry) {
    store.set(id, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (now > entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(id, entry);
    return { ok: true };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}
