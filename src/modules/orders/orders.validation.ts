import { z } from "zod";

export const listOrdersSchema = z.object({
  body: z.object({}).optional(),
  query: z
    .object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      status: z.enum(["PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]).optional()
    })
    .optional(),
  params: z.object({}).optional()
});

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().uuid(),
    paymentMethod: z.enum(["COD"]).default("COD"),
    couponCode: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .transform((value) => value.toUpperCase())
      .refine((value) => /^[A-Z0-9_-]+$/.test(value), "Coupon code can only use letters, numbers, underscores, and hyphens")
      .optional(),
    notes: z.string().trim().max(500).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const orderParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    orderId: z.string().uuid()
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
    paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({
    orderId: z.string().uuid()
  })
});

export type ListOrdersQuery = z.infer<typeof listOrdersSchema>["query"];
export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>["body"];
