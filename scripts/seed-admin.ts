import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";

import { PrismaClient } from "../src/generated/prisma/client";
import { UserRole, UserStatus } from "../src/generated/prisma/enums";

const adminEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  ADMIN_NAME: z.string().trim().min(2).default("JMV Admin"),
  ADMIN_EMAIL: z.string().trim().email().toLowerCase(),
  ADMIN_PASSWORD: z.string().min(8).max(72),
  ADMIN_PHONE: z.string().trim().min(7).max(20).optional()
});

const parsedEnv = adminEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid admin seed configuration", parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsedEnv.data;
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});
const prisma = new PrismaClient({
  adapter
});

const main = async () => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: env.ADMIN_EMAIL
    }
  });

  if (existingUser) {
    if (existingUser.role !== UserRole.ADMIN) {
      await prisma.user.update({
        where: {
          id: existingUser.id
        },
        data: {
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE
        }
      });

      console.log(`Promoted existing user ${env.ADMIN_EMAIL} to ADMIN.`);
      return;
    }

    console.log(`Admin user ${env.ADMIN_EMAIL} already exists.`);
    return;
  }

  if (env.ADMIN_PHONE) {
    const existingPhone = await prisma.user.findUnique({
      where: {
        phone: env.ADMIN_PHONE
      }
    });

    if (existingPhone) {
      throw new Error("ADMIN_PHONE is already used by another account");
    }
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

  await prisma.user.create({
    data: {
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      phone: env.ADMIN_PHONE,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    }
  });

  console.log(`Created admin user ${env.ADMIN_EMAIL}.`);
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
