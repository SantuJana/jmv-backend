import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma";

const productInclude = {
  category: true,
  variants: {
    orderBy: [{ name: "asc" }]
  }
} satisfies Prisma.ProductInclude;

export const productsRepository = {
  count(where: Prisma.ProductWhereInput) {
    return prisma.product.count({ where });
  },

  list(where: Prisma.ProductWhereInput, pagination: { skip: number; take: number }) {
    return prisma.product.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [{ name: "asc" }],
      include: productInclude
    });
  },

  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: productInclude
    });
  },

  findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: productInclude
    });
  },

  findFirst(where: Prisma.ProductWhereInput) {
    return prisma.product.findFirst({
      where,
      include: productInclude
    });
  },

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
      include: productInclude
    });
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: productInclude
    });
  },

  softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      },
      include: productInclude
    });
  },

  findCategoryById(id: string) {
    return prisma.category.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });
  },

  findVariantById(id: string) {
    return prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true
      }
    });
  },

  findVariantBySku(sku: string) {
    return prisma.productVariant.findUnique({
      where: { sku }
    });
  },

  createVariant(data: Prisma.ProductVariantCreateInput) {
    return prisma.productVariant.create({
      data
    });
  },

  updateVariant(id: string, data: Prisma.ProductVariantUpdateInput) {
    return prisma.productVariant.update({
      where: { id },
      data
    });
  },

  deactivateVariant(id: string) {
    return prisma.productVariant.update({
      where: { id },
      data: {
        isActive: false
      }
    });
  }
};
