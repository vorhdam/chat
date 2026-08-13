import "server-only";

import config from "@repo/config";
import redis from "@repo/redis";

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
      config.ratelimit.duration.toString(),
      "NX",
    );

    let current: number;
    let ttl: number;

    if (created === "OK") {
      current = 1;
      ttl = config.ratelimit.duration;
    } else {
      current = await redis.incr(key);
      const ttlRaw = await redis.ttl(key);
      ttl = ttlRaw < 0 ? config.ratelimit.duration : ttlRaw;
    }

    const allowed = current <= config.ratelimit.limit;
    const remaining = Math.max(0, config.ratelimit.limit - current);

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
      remaining: config.ratelimit.limit,
      reset: new Date(
        Date.now() + config.ratelimit.duration * 1000,
      ).toISOString(),
      ttl: config.ratelimit.duration,
    };
  }
}
