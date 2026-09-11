import redis from "@/lib/redis";

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Redis timeout")), ms)
    ),
  ]);
}

const REDIS_TIMEOUT_MS = 3000;

export async function rateLimit(
  request: Request,
  opts: { maxRequests: number; windowMs: number; prefix?: string }
): Promise<RateLimitResult> {
  const ip = getClientIP(request);
  const prefix = opts.prefix ?? "global";
  const key = `rl:${prefix}:${ip}`;
  const windowSec = Math.ceil(opts.windowMs / 1000);

  try {
    const current = await withTimeout(redis.incr(key), REDIS_TIMEOUT_MS);
    if (current === 1) {
      await withTimeout(redis.expire(key, windowSec), REDIS_TIMEOUT_MS);
    }

    const ttl = await withTimeout(redis.ttl(key), REDIS_TIMEOUT_MS);
    const resetAt = Date.now() + ttl * 1000;

    if (current > opts.maxRequests) {
      return { allowed: false, remaining: 0, resetAt };
    }

    return {
      allowed: true,
      remaining: opts.maxRequests - current,
      resetAt,
    };
  } catch {
    // If Redis is down or unreachable, allow the request (fail open)
    return { allowed: true, remaining: opts.maxRequests - 1, resetAt: Date.now() + opts.windowMs };
  }
}
