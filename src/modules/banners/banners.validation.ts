import { z } from "zod";

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

const nullableDateSchema = z
  .union([z.null(), z.coerce.date()])
  .optional();

const optionalNullableText = (max: number) => z.union([z.string().trim().max(max), z.null()]).optional();
const optionalNullableRequiredText = (max: number) =>
  z.union([z.string().trim().min(1).max(max), z.null()]).optional();
const optionalNullableUrl = z.union([z.string().trim().url(), z.null()]).optional();

const bannerBodySchema = z.object({
  title: z.string().trim().min(2).max(140),
  subtitle: optionalNullableText(240),
  imageUrl: optionalNullableUrl,
  imagePublicId: optionalNullableRequiredText(255),
  ctaLabel: optionalNullableText(60),
  ctaUrl: optionalNullableText(255),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  startsAt: nullableDateSchema,
  endsAt: nullableDateSchema
});

export const listBannersSchema = z.object({
  body: z.object({}).optional(),
  query: paginationQuerySchema.optional(),
  params: z.object({}).optional()
});

export const createBannerSchema = z.object({
  body: bannerBodySchema,
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const updateBannerSchema = z.object({
  body: bannerBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid()
  })
});

export const deleteBannerSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid()
  })
});

export type ListBannersQuery = z.infer<typeof listBannersSchema>["query"];
export type CreateBannerInput = z.infer<typeof createBannerSchema>["body"];
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>["body"];
