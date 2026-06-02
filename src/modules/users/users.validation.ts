import { z } from "zod";

const addressTypeSchema = z.enum(["HOME", "WORK", "OTHER"]);

const addressBodySchema = z.object({
  type: addressTypeSchema.optional(),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(3).max(180),
  line2: z.string().trim().max(180).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(80).optional(),
  isDefault: z.boolean().optional()
});

export const createAddressSchema = z.object({
  body: addressBodySchema,
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const updateAddressSchema = z.object({
  body: addressBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  }),
  query: z.object({}).optional(),
  params: z.object({
    addressId: z.string().uuid()
  })
});

export const addressParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    addressId: z.string().uuid()
  })
});

export const listUsersSchema = z.object({
  body: z.object({}).optional(),
  query: z
    .object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
      status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
      search: z.string().trim().min(1).max(120).optional()
    })
    .optional(),
  params: z.object({}).optional()
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "BLOCKED"])
  }),
  query: z.object({}).optional(),
  params: z.object({
    userId: z.string().uuid()
  })
});

export const userParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    userId: z.string().uuid()
  })
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>["body"];
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>["body"];
export type ListUsersQuery = z.infer<typeof listUsersSchema>["query"];
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>["body"];
