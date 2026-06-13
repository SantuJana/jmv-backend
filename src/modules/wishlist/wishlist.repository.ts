import { prisma } from "@/config/prisma";

export const wishlistRepository = {
  findOrCreateByUserId(userId: string) {
    return prisma.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                variants: {
                  where: { isActive: true }
                }
              }
            }
          }
        }
      }
    });
  },

  findByUserId(userId: string) {
    return prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                variants: {
                  where: { isActive: true }
                }
              }
            }
          }
        }
      }
    });
  },

  async addItem(userId: string, productId: string) {
    const wishlist = await this.findOrCreateByUserId(userId);

    return prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productId
      },
      include: {
        product: {
          include: {
            category: true,
            variants: {
              where: { isActive: true }
            }
          }
        }
      }
    });
  },

  async removeItem(userId: string, productId: string) {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId }
    });

    if (!wishlist) {
      return null;
    }

    try {
      return await prisma.wishlistItem.delete({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId
          }
        }
      });
    } catch {
      // Record not found
      return null;
    }
  }
};
