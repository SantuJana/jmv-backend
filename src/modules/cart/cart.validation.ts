import { z } from "zod";

export const addCartItemSchema = z.object({
  body: z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1).max(100)
  }),
  query: z.object({}).optional(),
  params: z.object({
    itemId: z.string().uuid()
  })
});

export const removeCartItemSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    itemId: z.string().uuid()
  })
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>["body"];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>["body"];
