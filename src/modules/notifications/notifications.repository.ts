import { prisma } from "@/config/prisma";

export const notificationsRepository = {
  async saveToken(userId: string, expoPushToken: string) {
    return prisma.userDevice.upsert({
      where: {
        expoPushToken
      },
      create: {
        userId,
        expoPushToken
      },
      update: {
        userId
      }
    });
  },

  async getUserTokens(userId: string) {
    const devices = await prisma.userDevice.findMany({
      where: { userId },
      select: { expoPushToken: true }
    });
    return devices.map((d) => d.expoPushToken);
  }
};
