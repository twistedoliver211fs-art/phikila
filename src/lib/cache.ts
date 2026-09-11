import redis from "@/lib/redis";

const DEFAULT_TTL = 300; // 5 minutes

interface CacheOptions {
  ttl?: number;
}

export async function get<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch {
    return null;
  }
}

export async function set(key: string, value: unknown, ttl: number = DEFAULT_TTL): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttl });
  } catch {
    // Silently fail — cache is optional
  }
}

export async function del(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // Silently fail
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Silently fail
  }
}

export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const ttl = options.ttl ?? DEFAULT_TTL;

  const cached = await get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  await set(key, data, ttl);
  return data;
}

export const cache = {
  get,
  set,
  del,
  invalidatePattern,
  getOrSet,
};
