import { Router } from "express";

import { UserRole } from "@/generated/prisma/enums";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { validate } from "@/middlewares/validate.middleware";

import { uploadsController } from "./uploads.controller";
import { uploadImageFile } from "./uploads.middleware";
import { deleteImageSchema, uploadImageSchema } from "./uploads.validation";

export const uploadsRouter = Router();

uploadsRouter.get("/image/*", uploadsController.getImage);

/**
 * @swagger
 * /uploads/image:
 *   post:
 *     summary: Upload image
 *     description: Upload an image to S3-compatible MinIO object storage. Requires an admin bearer token.
 *     tags:
 *       - Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: JPEG, PNG, WEBP, or GIF image up to 5 MB
 *               folder:
 *                 type: string
 *                 default: jmv/products
 *                 example: jmv/categories
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/ApiResponse"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         image:
 *                           $ref: "#/components/schemas/UploadedImage"
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       422:
 *         description: Validation failed or invalid image
 *       503:
 *         description: MinIO object storage is not configured
 */
uploadsRouter.post(
  "/image",
  authenticate,
  authorize(UserRole.ADMIN),
  uploadImageFile,
  validate(uploadImageSchema),
  uploadsController.uploadImage
);

/**
 * @swagger
 * /uploads/image:
 *   delete:
 *     summary: Delete image
 *     description: Delete an image from S3-compatible MinIO object storage by object key. Requires an admin bearer token.
 *     tags:
 *       - Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicId
 *             properties:
 *               publicId:
 *                 type: string
 *                 example: jmv/products/shimla-apple
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       422:
 *         description: Validation failed
 *       503:
 *         description: MinIO object storage is not configured
 */
uploadsRouter.delete(
  "/image",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(deleteImageSchema),
  uploadsController.deleteImage
);
