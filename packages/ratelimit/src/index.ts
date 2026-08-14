import "server-only";

import config from "@repo/config";
import redis from "@repo/redis";

type LimitedBy = undefined | "user" | "global";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  reset: string;
  ttl: number;
  limitedBy?: LimitedBy;
};

async function checkLimit(
  key: string,
  limit: number,
  duration: number,
  limitedBy: LimitedBy,
): Promise<RateLimitResult> {
  try {
    const [current, ttlRaw] = await Promise.all([
      redis.incr(key),
      redis.ttl(key),
    ]);

    let ttl = ttlRaw;

    if (current === 1 || ttlRaw < 0) {
      await redis.expire(key, duration);
      ttl = duration;
    }

    const allowed = current <= limit;

    return {
      allowed,
      remaining: Math.max(0, limit - current),
      reset: reset(ttl),
      ttl,
      limitedBy: allowed ? undefined : limitedBy,
    };
  } catch (err) {
    console.error(`Ratelimit: Redis error for key "${key}"`, err);
    return {
      allowed: true,
      remaining: limit,
      reset: reset(duration),
      ttl: duration,
    };
  }
}

const reset = (ttl: number) => new Date(Date.now() + ttl * 1000).toISOString();

const limitUser = (ip: string) =>
  checkLimit(
    `ratelimit:${ip}`,
    config.ratelimit.clientLimit,
    config.ratelimit.clientDuration,
    "user",
  );

const limitGlobal = () =>
  checkLimit(
    "ratelimit:global",
    config.ratelimit.globalLimit,
    config.ratelimit.globalDuration,
    "global",
  );

/**
 * ### Rate Limiter
 * @description The ratelimiter intended to stop malicious or spam requests which checks for **per-user** and **global** patterns.
 * @param ip The ip of the request
 * @returns The verdict of the ratelimiter
 */
export default async function rateLimit(ip: string): Promise<RateLimitResult> {
  const [userResult, globalResult] = await Promise.all([
    limitUser(ip),
    limitGlobal(),
  ]);

  return globalResult.allowed ? userResult : globalResult;
}
