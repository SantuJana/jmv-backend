import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  findUserByPhone(phone: string) {
    return prisma.user.findUnique({
      where: { phone }
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  },

  createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data
    });
  },

  replaceRefreshTokensForUser(data: Prisma.RefreshTokenUncheckedCreateInput) {
    return prisma.$transaction(async (tx: any) => {
      await tx.refreshToken.deleteMany({
        where: {
          userId: data.userId
        }
      });

      return tx.refreshToken.create({
        data
      });
    });
  },

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: true
      }
    });
  },

  revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }
};
