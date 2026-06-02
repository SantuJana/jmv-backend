import { z } from "zod";

export const uploadImageSchema = z.object({
  body: z.object({
    folder: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-zA-Z0-9/_-]+$/, "Folder can contain letters, numbers, slashes, underscores, and hyphens")
      .default("jmv/products")
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const deleteImageSchema = z.object({
  body: z.object({
    publicId: z.string().trim().min(1).max(255)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>["body"];
export type DeleteImageInput = z.infer<typeof deleteImageSchema>["body"];
