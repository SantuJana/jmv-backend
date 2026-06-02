import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma";

export const categoriesRepository = {
  count(where: Prisma.CategoryWhereInput) {
    return prisma.category.count({ where });
  },

  list(where: Prisma.CategoryWhereInput, pagination: { skip: number; take: number }) {
    return prisma.category.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [{ name: "asc" }],
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  },

  findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  },

  findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  },

  findActiveById(id: string) {
    return prisma.category.findFirst({
      where: {
        id,
        isActive: true,
        deletedAt: null
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  },

  findActiveBySlug(slug: string) {
    return prisma.category.findFirst({
      where: {
        slug,
        isActive: true,
        deletedAt: null
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  },

  create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data });
  },

  update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data
    });
  },

  softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });
  }
};
