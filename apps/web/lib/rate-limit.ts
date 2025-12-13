import type { NextRequest } from 'next/server';

const attempts = new Map<string, number[]>();

export function getClientIp(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return '0.0.0.0';
}

/**
 * Returns true if the caller has exceeded the allowed number of attempts within the window.
 * Key lets you separate buckets per endpoint (e.g., "login", "cart:post").
 */
export function isRateLimited(req: NextRequest, key: string, max = 10, windowMs = 10 * 60 * 1000) {
  const ip = getClientIp(req);
  const now = Date.now();
  const bucketKey = `${ip}:${key}`;
  const bucket = attempts.get(bucketKey) || [];
  const recent = bucket.filter((t) => now - t < windowMs);
  recent.push(now);
  attempts.set(bucketKey, recent);
  return recent.length > max;
}

