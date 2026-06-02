import { checkDatabaseConnection } from "@/config/prisma";
import { env } from "@/config/env";
import { checkRedisConnection } from "@/config/redis";

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) =>
  Promise.race([
    promise,
    new Promise<never>((_resolve, reject) => {
      setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
};

export const logStartupHealth = async () => {
  console.log("Checking infrastructure connections...");

  try {
    await withTimeout(checkDatabaseConnection(), 5_000);
    console.log("Database: connected");
  } catch (error) {
    console.error(`Database: unavailable (${getErrorMessage(error)})`);
  }

  if (!env.REDIS_URL) {
    console.log("Redis: not configured");
    return;
  }

  try {
    await withTimeout(checkRedisConnection(), 5_000);
    console.log("Redis: connected");
  } catch (error) {
    console.error(`Redis: unavailable (${getErrorMessage(error)})`);
  }
};
