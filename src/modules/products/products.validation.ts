import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens");

const moneySchema = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d{1,2})?$/, "Amount must be a valid decimal with up to two places");

const variantFieldsSchema = z.object({
  name: z.string().trim().min(1).max(100),
  mrp: moneySchema.optional(),
  price: moneySchema.optional(),
  offerPrice: moneySchema.optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().trim().min(2).max(80),
  unit: z.string().trim().min(1).max(40),
  isActive: z.boolean().optional()
});

const variantBodySchema = variantFieldsSchema.refine((value) => value.price || value.offerPrice, {
  message: "Offer price is required",
  path: ["offerPrice"]
});

const productBodySchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2).max(150),
  slug: slugSchema.optional(),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.string().trim().url().optional(),
  imagePublicId: z.string().trim().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
  variants: z.array(variantBodySchema).max(20).optional()
});

export const listProductsSchema = z.object({
  body: z.object({}).optional(),
  query: z
    .object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      search: z.string().trim().min(1).max(120).optional(),
      categoryId: z.string().uuid().optional(),
      categorySlug: slugSchema.optional()
    })
    .optional(),
  params: z.object({}).optional()
});

export const getProductSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    idOrSlug: z.string().trim().min(1)
  })
});

export const createProductSchema = z.object({
  body: productBodySchema,
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const updateProductSchema = z.object({
  body: productBodySchema
    .omit({ variants: true })
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required"
    }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid()
  })
});

export const deleteProductSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid()
  })
});

export const createVariantSchema = z.object({
  body: variantBodySchema,
  query: z.object({}).optional(),
  params: z.object({
    productId: z.string().uuid()
  })
});

export const updateVariantSchema = z.object({
  body: variantFieldsSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  }),
  query: z.object({}).optional(),
  params: z.object({
    variantId: z.string().uuid()
  })
});

export const deleteVariantSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    variantId: z.string().uuid()
  })
});

export type ListProductsQuery = z.infer<typeof listProductsSchema>["query"];
export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
export type CreateVariantInput = z.infer<typeof createVariantSchema>["body"];
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>["body"];
