import "server-only";

import config from "@repo/config";
import redis from "@repo/redis";

function safeParse<T>(value: string | null): T | null {
  if (value === null) return null;

  try {
    return JSON.parse(value) as T;
  } catch (err) {
    console.warn("Cache: Failed to parse cached JSON:", err);
    return null;
  }
}

function safeStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch (err) {
    console.warn("Cache: Failed to serialize cache value:", err);
    return null;
  }
}

/** Acquire a lock, returning a token if we got it, or null if someone else holds it. */
async function acquireLock(key: string, ttl: number): Promise<string | null> {
  const token = crypto.randomUUID();
  const result = await redis.set(
    `${key}:lock`,
    token,
    "NX",
    "PX",
    ttl.toString(),
  );
  return result === "OK" ? token : null;
}

/** Release the lock only if we still own it (avoids deleting someone else's lock). */
async function releaseLock(key: string, token: string): Promise<void> {
  const lockKey = `${key}:lock`;
  const current = await redis.get(lockKey);
  if (current === token) await redis.del(lockKey);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * ### Get Cache
 * @description Get the stored cache associated to a key. Returns null on a
 * miss, a parse error, or a Redis error — all of these just mean "compute it".
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    return safeParse<T>(raw);
  } catch (err) {
    console.error("Cache: Redis GET failed:", err);
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
  ttl = config.cache.duration * 1000,
): Promise<void> {
  const json = safeStringify(value);
  if (json === null) return; // do not store invalid JSON

  try {
    await redis.setex(key, ttl, json);
  } catch (err) {
    console.error("Cache: Redis SET failed:", err);
  }
}

/**
 * ### Clear Cache
 * @description Clear a key from the cache.
 */
export async function clearCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Cache: Redis DEL failed:", err);
  }
}

/**
 * ### Cache
 * @description Cache-aside helper.
 * - Pass a plain value (or resolved Promise) to just cache that value directly — no locking needed.
 * - Pass a function to compute-and-cache it, with stampede protection: only the first
 *   concurrent caller for a given key runs `compute`, the rest poll the cache and
 *   receive the result once it's written. If the computing caller doesn't finish
 *   within `lockTimeout` (e.g. it crashed), waiters give up and compute it themselves
 *   instead of waiting forever.
 */
export async function cache<TReturn>(
  key: string,
  compute: (() => Promise<TReturn>) | Promise<TReturn> | TReturn,
  options: { ttl?: number; lockTimeout?: number; pollIntervalMs?: number } = {},
): Promise<TReturn> {
  const ttl = options.ttl ?? config.cache.duration * 1000;
  const lockTimeoutMs = options.lockTimeout ?? config.cache.lockTimeout;
  const pollIntervalMs = options.pollIntervalMs ?? config.cache.pollInterval;

  const cached = await getCache<TReturn>(key);
  if (cached !== null) return cached;

  if (typeof compute !== "function") {
    const result = await Promise.resolve(compute);
    await setCache(key, result, ttl);
    return result;
  }

  const token = await acquireLock(key, lockTimeoutMs);

  if (!token) {
    const deadline = Date.now() + lockTimeoutMs;
    while (Date.now() < deadline) {
      await sleep(pollIntervalMs);
      const retry = await getCache<TReturn>(key);
      if (retry !== null) return retry;
    }
  }

  try {
    const result = await (compute as () => Promise<TReturn>)();
    await setCache(key, result, ttl);
    return result;
  } finally {
    if (token) await releaseLock(key, token);
  }
}
