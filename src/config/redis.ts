import Redis from "ioredis";

import { env } from "@/config/env";

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: () => null
    })
  : null;

redis?.on("error", () => {
  // Startup health checks report Redis availability explicitly.
});

export const checkRedisConnection = async () => {
  if (!redis) {
    return {
      configured: false
    };
  }

  if (redis.status === "wait") {
    await redis.connect();
  }

  await redis.ping();

  return {
    configured: true
  };
};
