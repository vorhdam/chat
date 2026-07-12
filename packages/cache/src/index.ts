import redis from "@repo/redis";

const cacheDuration = 1000 * 60 * 10;

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch (err) {
    console.warn("Failed to parse cached JSON:", err);
    return null;
  }
}

function safeStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch (err) {
    console.warn("Failed to serialize cache value:", err);
    return null;
  }
}

async function acquireLock(key: string, ttl: number): Promise<boolean> {
  const lockKey = `${key}:lock`;
  const result = await redis.set(lockKey, "1", "NX", "PX", ttl.toString());
  return result === "OK";
}

async function releaseLock(key: string): Promise<void> {
  await redis.del(`${key}:lock`);
}

/**
 * ### Get Cache
 * @description Get the stored cache associated to a key.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    return safeParse<T>(raw);
  } catch (err) {
    console.error("Redis GET failed:", err);
    return null;
  }
}

/**
 * ### Set Cache
 * @description Set a new cache with a unique key.
 */
export async function setCache(
  key: string,
  value: unknown,
  ttl = cacheDuration,
): Promise<void> {
  const json = safeStringify(value);

  if (json === null) return; // do not store invalid JSON

  try {
    await redis.setex(key, ttl, json);
  } catch (err) {
    console.error("Redis SET failed:", err);
  }
}

/**
 * ### Clear Cache
 * @description Clear a key form the cache.
 */
export async function clearCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Redis DEL failed:", err);
  }
}

/**
 * ### Cache
 * @description Wrap around a function or value to cache its result.
 */
export async function cache<TReturn>(
  key: string,
  compute: (() => Promise<TReturn>) | Promise<TReturn> | TReturn,
  options: { ttl?: number; lockTimeout?: number } = {},
): Promise<TReturn> {
  const ttl = options.ttl ?? cacheDuration;
  const lockTimeoutMs = options.lockTimeout ?? 5000;

  const namespaced = key;

  const initial = await getCache<TReturn>(key);
  if (initial !== null) return initial;

  const hasLock = await acquireLock(namespaced, lockTimeoutMs);
  if (!hasLock) {
    await new Promise((r) => setTimeout(r, 50));

    const retry = await getCache<TReturn>(key);
    if (retry !== null) return retry;
  }

  try {
    const result = await (typeof compute === "function"
      ? (compute as () => Promise<TReturn>)()
      : Promise.resolve(compute));

    await setCache(key, result, ttl);
    return result;
  } finally {
    if (hasLock) await releaseLock(namespaced);
  }
}
