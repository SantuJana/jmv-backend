import { z } from "zod";

const moneySchema = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d{1,2})?$/, "Amount must be a valid decimal with up to two places");

const couponCodeSchema = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .transform((value) => value.toUpperCase())
  .refine((value) => /^[A-Z0-9_-]+$/.test(value), "Coupon code can only use letters, numbers, underscores, and hyphens");

const dateSchema = z.coerce.date();

const couponBodySchema = z.object({
  code: couponCodeSchema,
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: moneySchema,
  minOrderAmount: moneySchema.optional(),
  maxDiscountAmount: moneySchema.optional(),
  usageLimit: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  startsAt: dateSchema.optional(),
  endsAt: dateSchema.optional()
});

export const listCouponsSchema = z.object({
  body: z.object({}).optional(),
  query: z
    .object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      search: z.string().trim().min(1).max(120).optional(),
      isActive: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional()
    })
    .optional(),
  params: z.object({}).optional()
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: couponCodeSchema,
    subtotal: moneySchema
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const createCouponSchema = z.object({
  body: couponBodySchema,
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const updateCouponSchema = z.object({
  body: couponBodySchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required"
    }),
  query: z.object({}).optional(),
  params: z.object({
    couponId: z.string().uuid()
  })
});

export const couponParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    couponId: z.string().uuid()
  })
});

export type ListCouponsQuery = z.infer<typeof listCouponsSchema>["query"];
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>["body"];
export type CreateCouponInput = z.infer<typeof createCouponSchema>["body"];
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>["body"];
