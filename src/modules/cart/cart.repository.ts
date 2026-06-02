import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma";

const cartInclude = {
  items: {
    orderBy: [{ createdAt: "asc" }],
    include: {
      variant: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    }
  }
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;

export const cartRepository = {
  findByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: cartInclude
    });
  },

  createForUser(userId: string) {
    return prisma.cart.create({
      data: {
        user: {
          connect: {
            id: userId
          }
        }
      },
      include: cartInclude
    });
  },

  findVariantForCart(variantId: string) {
    return prisma.productVariant.findFirst({
      where: {
        id: variantId,
        isActive: true,
        product: {
          isActive: true,
          deletedAt: null,
          category: {
            isActive: true,
            deletedAt: null
          }
        }
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
  },

  findItem(cartId: string, variantId: string) {
    return prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId,
          variantId
        }
      }
    });
  },

  findItemByIdForUser(itemId: string, userId: string) {
    return prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId
        }
      },
      include: {
        variant: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });
  },

  addItem(cartId: string, variantId: string, quantity: number) {
    return prisma.cartItem.create({
      data: {
        cartId,
        variantId,
        quantity
      }
    });
  },

  updateItem(itemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });
  },

  removeItem(itemId: string) {
    return prisma.cartItem.delete({
      where: { id: itemId }
    });
  },

  clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: {
        cartId
      }
    });
  }
};
