import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma";
import { assertCouponCanApply, calculateCouponDiscount } from "@/modules/coupons/coupons.service";

const orderInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true
    }
  },
  address: true,
  items: {
    orderBy: [{ createdAt: "asc" }],
    include: {
      variant: {
        select: {
          id: true,
          stock: true,
          isActive: true
        }
      }
    }
  }
} satisfies Prisma.OrderInclude;

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

export const ordersRepository = {
  count(where: Prisma.OrderWhereInput) {
    return prisma.order.count({ where });
  },

  list(where: Prisma.OrderWhereInput, pagination: { skip: number; take: number }) {
    return prisma.order.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [{ createdAt: "desc" }],
      include: orderInclude
    });
  },

  findById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude
    });
  },

  findAddressForUser(addressId: string, userId: string) {
    return prisma.address.findFirst({
      where: {
        id: addressId,
        userId
      }
    });
  },

  updateStatus(orderId: string, data: Prisma.OrderUpdateInput) {
    return prisma.order.update({
      where: { id: orderId },
      data,
      include: orderInclude
    });
  },

  createFromCart(input: {
    userId: string;
    addressId: string;
    paymentMethod: "COD";
    notes?: string;
    orderNumber: string;
    couponCode?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: input.userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("CART_EMPTY");
      }

      const orderItems = [];
      let subtotal = 0;

      for (const item of cart.items) {
        const { variant } = item;

        if (!variant.isActive || !variant.product.isActive || variant.product.deletedAt) {
          throw new Error("ITEM_UNAVAILABLE");
        }

        const stockUpdate = await tx.productVariant.updateMany({
          where: {
            id: variant.id,
            stock: {
              gte: item.quantity
            }
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        if (stockUpdate.count !== 1) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        const unitPrice = Number(variant.price);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        orderItems.push({
          variantId: variant.id,
          productName: variant.product.name,
          variantName: variant.name,
          sku: variant.sku,
          unit: variant.unit,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          total: lineTotal.toFixed(2)
        });
      }

      const deliveryFee = 0;
      let discountAmount = 0;
      let couponId: string | undefined;
      let couponCode: string | undefined;

      if (input.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: input.couponCode }
        });

        assertCouponCanApply(coupon, subtotal);

        if (!coupon) {
          throw new Error("COUPON_NOT_FOUND");
        }

        const couponUpdate = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            OR: [{ usageLimit: null }, { usageCount: { lt: coupon.usageLimit ?? 0 } }]
          },
          data: {
            usageCount: {
              increment: 1
            }
          }
        });

        if (couponUpdate.count !== 1) {
          throw new Error("COUPON_USAGE_LIMIT_REACHED");
        }

        couponId = coupon.id;
        couponCode = coupon.code;
        discountAmount = calculateCouponDiscount(coupon, subtotal);
      }

      const total = Math.max(0, subtotal + deliveryFee - discountAmount);

      const order = await tx.order.create({
        data: {
          orderNumber: input.orderNumber,
          userId: input.userId,
          addressId: input.addressId,
          paymentMethod: input.paymentMethod,
          paymentStatus: "PENDING",
          subtotal: subtotal.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          couponId,
          couponCode,
          total: total.toFixed(2),
          notes: input.notes,
          items: {
            create: orderItems
          }
        },
        include: orderInclude
      });

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id
        }
      });

      return order;
    });
  }
};
