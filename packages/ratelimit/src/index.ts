import "server-only";

import redis from "@repo/redis";

const defaultDuration = 60;
const defaultLimit = 300;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  reset: string;
  ttl: number;
};

/**
 * ## Rate Limiter
 * @description The ratelimiter intended to stop malicious or spam requests
 * @param ip The ip of the request
 * @returns The verdict of the ratelimiter
 */
export default async function rateLimit(ip: string): Promise<RateLimitResult> {
  const key = `ratelimit:${ip}`;

  try {
    const created = await redis.set(
      key,
      "1",
      "EX",
      defaultDuration.toString(),
      "NX",
    );

    let current: number;
    let ttl: number;

    if (created === "OK") {
      current = 1;
      ttl = defaultDuration;
    } else {
      current = await redis.incr(key);
      const ttlRaw = await redis.ttl(key);
      ttl = ttlRaw < 0 ? defaultDuration : ttlRaw;
    }

    const allowed = current <= defaultLimit;
    const remaining = Math.max(0, defaultLimit - current);

    return {
      allowed,
      remaining,
      reset: new Date(Date.now() + ttl * 1000).toISOString(),
      ttl,
    };
  } catch (err) {
    console.error("Ratelimit: Redis error", err);
    return {
      allowed: true,
      remaining: defaultLimit,
      reset: new Date(Date.now() + defaultDuration * 1000).toISOString(),
      ttl: defaultDuration,
    };
  }
}
