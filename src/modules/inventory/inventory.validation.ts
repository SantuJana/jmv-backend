import { z } from "zod";

export const listLowStockSchema = z.object({
  body: z.object({}).optional(),
  query: z
    .object({
      threshold: z.coerce.number().int().min(0).max(1000).default(10)
    })
    .optional(),
  params: z.object({}).optional()
});

export const updateVariantStockSchema = z.object({
  body: z.object({
    stock: z.number().int().min(0).max(1_000_000)
  }),
  query: z.object({}).optional(),
  params: z.object({
    variantId: z.string().uuid()
  })
});

export type ListLowStockQuery = z.infer<typeof listLowStockSchema>["query"];
export type UpdateVariantStockInput = z.infer<typeof updateVariantStockSchema>["body"];
