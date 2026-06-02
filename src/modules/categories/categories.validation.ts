import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens");

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

export const listCategoriesSchema = z.object({
  body: z.object({}).optional(),
  query: paginationQuerySchema.optional(),
  params: z.object({}).optional()
});

export const getCategorySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    idOrSlug: z.string().trim().min(1)
  })
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    slug: slugSchema.optional(),
    imageUrl: z.string().trim().url().optional(),
    imagePublicId: z.string().trim().min(1).max(255).optional(),
    isActive: z.boolean().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const updateCategorySchema = z.object({
  body: createCategorySchema.shape.body.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid()
  })
});

export const deleteCategorySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid()
  })
});

export type ListCategoriesQuery = z.infer<typeof listCategoriesSchema>["query"];
export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
