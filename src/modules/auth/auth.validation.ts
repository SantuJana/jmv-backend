import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Please enter your name." })
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name must be 100 characters or less."),
    email: z
      .string({ required_error: "Please enter your email address." })
      .trim()
      .email("Please enter a valid email address.")
      .toLowerCase(),
    phone: z
      .string()
      .trim()
      .min(7, "Phone number must be at least 7 digits.")
      .max(20, "Phone number must be 20 characters or less.")
      .optional(),
    password: z
      .string({ required_error: "Please enter a password." })
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must be 72 characters or less.")
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const logoutSchema = refreshSchema;

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshInput = z.infer<typeof refreshSchema>["body"];
