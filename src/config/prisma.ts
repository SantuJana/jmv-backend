import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

import { env } from "@/config/env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});

export const checkDatabaseConnection = async () => {
  await prisma.$queryRaw`SELECT 1`;
};
