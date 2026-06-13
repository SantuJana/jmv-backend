import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/utils/app-error";
import { normalizePagination } from "@/utils/pagination";

import { ordersRepository, type OrderWithDetails } from "./orders.repository";
import type { CreateOrderInput, ListOrdersQuery, UpdateOrderStatusInput } from "./orders.validation";
import { notificationsService } from "../notifications/notifications.service";

const toMoneyString = (amount: { toString: () => string }) => amount.toString();

const toOrderResponse = (order: OrderWithDetails) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  userId: order.userId,
  addressId: order.addressId,
  status: order.status,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  subtotal: toMoneyString(order.subtotal),
  deliveryFee: toMoneyString(order.deliveryFee),
  discountAmount: toMoneyString(order.discountAmount),
  couponCode: order.couponCode,
  total: toMoneyString(order.total),
  notes: order.notes,
  user: order.user,
  address: order.address,
  items: order.items.map((item) => ({
    id: item.id,
    variantId: item.variantId,
    productName: item.productName,
    variantName: item.variantName,
    sku: item.sku,
    unit: item.unit,
    quantity: item.quantity,
    mrp: toMoneyString(item.mrp),
    unitPrice: toMoneyString(item.unitPrice),
    offerPrice: toMoneyString(item.unitPrice),
    total: toMoneyString(item.total),
    createdAt: item.createdAt,
    product: item.variant.product
  })),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

const buildOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `JMV-${timestamp}-${random}`;
};

const toOrderError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return error;
  }

  if (error.message === "CART_EMPTY") {
    return new AppError("Cart is empty", 409);
  }

  if (error.message === "ITEM_UNAVAILABLE") {
    return new AppError("One or more cart items are no longer available", 409);
  }

  if (error.message === "INSUFFICIENT_STOCK") {
    return new AppError("One or more cart items exceed available stock", 409);
  }

  if (error.message === "COUPON_USAGE_LIMIT_REACHED") {
    return new AppError("Coupon usage limit reached", 409);
  }

  if (error.message === "COUPON_NOT_FOUND") {
    return new AppError("Coupon not found", 404);
  }

  return error;
};

const buildWhere = (query: ListOrdersQuery = {}, userId?: string) => {
  const where: Prisma.OrderWhereInput = {};

  if (userId) {
    where.userId = userId;
  }

  if (query.status) {
    where.status = query.status;
  }

  return where;
};

export const ordersService = {
  async listForUser(userId: string, query: ListOrdersQuery = {}) {
    const pagination = normalizePagination(query);
    const where = buildWhere(query, userId);
    const [total, orders] = await Promise.all([
      ordersRepository.count(where),
      ordersRepository.list(where, pagination)
    ]);

    return {
      orders: orders.map(toOrderResponse),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  },

  async listForAdmin(query: ListOrdersQuery = {}) {
    const pagination = normalizePagination(query);
    const where = buildWhere(query);
    const [total, orders] = await Promise.all([
      ordersRepository.count(where),
      ordersRepository.list(where, pagination)
    ]);

    return {
      orders: orders.map(toOrderResponse),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  },

  async get(orderId: string, userId?: string) {
    const order = await ordersRepository.findById(orderId);

    if (!order || (userId && order.userId !== userId)) {
      throw new AppError("Order not found", 404);
    }

    return toOrderResponse(order);
  },

  async create(userId: string, input: CreateOrderInput) {
    const address = await ordersRepository.findAddressForUser(input.addressId, userId);

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    try {
      const order = await ordersRepository.createFromCart({
        userId,
        addressId: input.addressId,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        orderNumber: buildOrderNumber(),
        couponCode: input.couponCode
      });

      return toOrderResponse(order);
    } catch (error) {
      throw toOrderError(error);
    }
  },

  async updateStatus(orderId: string, input: UpdateOrderStatusInput) {
    const order = await ordersRepository.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const updatedOrder = await ordersRepository.updateStatus(orderId, {
      status: input.status,
      paymentStatus: input.paymentStatus
    });

    if (input.status && input.status !== order.status) {
      const statusConfigs: Record<string, { title: string; message: string; imageUrl: string }> = {
        CONFIRMED: {
          title: "Order Confirmed! 🎉",
          message: `Your order #${order.orderNumber.slice(-8)} has been confirmed!`,
          imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        },
        PACKED: {
          title: "Order Packed & Ready! 📦",
          message: "Your items have been carefully packed and are ready to ship.",
          imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
        },
        OUT_FOR_DELIVERY: {
          title: "Out for Delivery! 🛵",
          message: "Our delivery partner is on their way to your address.",
          imageUrl: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80",
        },
        DELIVERED: {
          title: "Delivered! 🛍️",
          message: "Your package has been successfully delivered. Thank you for shopping with JMV!",
          imageUrl: "https://images.unsplash.com/photo-1620455212530-ebec009f3336?auto=format&fit=crop&w=600&q=80",
        },
        CANCELLED: {
          title: "Order Cancelled ⚠️",
          message: `Your order #${order.orderNumber.slice(-8)} has been cancelled.`,
          imageUrl: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=600&q=80",
        },
      };

      const config = statusConfigs[input.status];
      if (config) {
        // Send asynchronously without blocking the response
        notificationsService.sendPushNotification(
          order.userId,
          config.title,
          config.message,
          { orderId: order.id },
          config.imageUrl
        ).catch((err) => console.error("Failed to send push notification:", err));
      }
    }

    return toOrderResponse(updatedOrder);
  }
};
