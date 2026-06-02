import { prisma } from "@/config/prisma";

const variantInclude = {
  product: {
    include: {
      category: true
    }
  }
} as const;

export const inventoryRepository = {
  listLowStock(threshold: number) {
    return prisma.productVariant.findMany({
      where: {
        stock: {
          lte: threshold
        },
        product: {
          deletedAt: null
        }
      },
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
      include: variantInclude
    });
  },

  findVariant(variantId: string) {
    return prisma.productVariant.findUnique({
      where: { id: variantId },
      include: variantInclude
    });
  },

  updateStock(variantId: string, stock: number) {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
      include: variantInclude
    });
  }
};
