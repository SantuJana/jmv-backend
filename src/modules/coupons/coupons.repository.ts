import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma";

export const couponsRepository = {
  count(where: Prisma.CouponWhereInput) {
    return prisma.coupon.count({ where });
  },

  list(where: Prisma.CouponWhereInput, pagination: { skip: number; take: number }) {
    return prisma.coupon.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [{ createdAt: "desc" }]
    });
  },

  findById(couponId: string) {
    return prisma.coupon.findUnique({
      where: { id: couponId }
    });
  },

  findByCode(code: string) {
    return prisma.coupon.findUnique({
      where: { code }
    });
  },

  create(data: Prisma.CouponCreateInput) {
    return prisma.coupon.create({ data });
  },

  update(couponId: string, data: Prisma.CouponUpdateInput) {
    return prisma.coupon.update({
      where: { id: couponId },
      data
    });
  },

  softDelete(couponId: string) {
    return prisma.coupon.update({
      where: { id: couponId },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });
  }
};
