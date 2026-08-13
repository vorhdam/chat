import "server-only";

import { redis, RedisClient } from "bun";

const redisClientSingleton = () => {
  return process.env.REDIS_URL ? new RedisClient(process.env.REDIS_URL) : redis;
};

declare const globalThis: {
    redisGlobal: RedisClient;
  } & typeof global;

/**
 * ### Redis Client
 * @description The Redis Client that is used for caching and ratelimiting.
 */
const client = globalThis.redisGlobal ?? redisClientSingleton();

if (!client.connected) await client.connect();

if (process.env.NODE_ENV !== "production") globalThis.redisGlobal = client;

export default client;
