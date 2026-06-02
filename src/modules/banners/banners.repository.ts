import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma";

export const bannersRepository = {
  count(where: Prisma.BannerWhereInput) {
    return prisma.banner.count({ where });
  },

  list(where: Prisma.BannerWhereInput, pagination: { skip: number; take: number }) {
    return prisma.banner.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
  },

  findById(id: string) {
    return prisma.banner.findUnique({
      where: { id }
    });
  },

  create(data: Prisma.BannerCreateInput) {
    return prisma.banner.create({ data });
  },

  update(id: string, data: Prisma.BannerUpdateInput) {
    return prisma.banner.update({
      where: { id },
      data
    });
  },

  softDelete(id: string) {
    return prisma.banner.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });
  }
};
