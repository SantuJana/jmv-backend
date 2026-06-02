import { Router } from "express";

import { UserRole } from "@/generated/prisma/enums";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { validate } from "@/middlewares/validate.middleware";

import { bannersController } from "./banners.controller";
import { createBannerSchema, deleteBannerSchema, listBannersSchema, updateBannerSchema } from "./banners.validation";

export const bannersRouter = Router();

const adminOnly = [authenticate, authorize(UserRole.ADMIN)];

/**
 * @swagger
 * /banners:
 *   get:
 *     summary: List active banners
 *     description: Retrieve active, scheduled storefront banners with pagination.
 *     tags:
 *       - Banners
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
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
 *                         banners:
 *                           type: array
 *                           items:
 *                             $ref: "#/components/schemas/Banner"
 *                     meta:
 *                       $ref: "#/components/schemas/PaginationMeta"
 */
bannersRouter.get("/", validate(listBannersSchema), bannersController.list);

/**
 * @swagger
 * /banners/manage:
 *   get:
 *     summary: List banners for admin
 *     description: Retrieve non-deleted banners for admin management, including inactive and unscheduled records.
 *     tags:
 *       - Banners
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 */
bannersRouter.get("/manage", ...adminOnly, validate(listBannersSchema), bannersController.listForAdmin);

/**
 * @swagger
 * /banners:
 *   post:
 *     summary: Create banner
 *     description: Create a storefront banner. Requires an admin bearer token.
 *     tags:
 *       - Banners
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Fresh Deals This Week
 *               subtitle:
 *                 type: string
 *                 nullable: true
 *                 example: Save on fruits, snacks, and daily essentials.
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               imagePublicId:
 *                 type: string
 *                 nullable: true
 *               ctaLabel:
 *                 type: string
 *                 nullable: true
 *                 example: Shop now
 *               ctaUrl:
 *                 type: string
 *                 nullable: true
 *                 example: /products?categorySlug=snacks
 *               sortOrder:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               endsAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Banner created successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       422:
 *         description: Validation failed
 */
bannersRouter.post("/", ...adminOnly, validate(createBannerSchema), bannersController.create);

/**
 * @swagger
 * /banners/{id}:
 *   patch:
 *     summary: Update banner
 *     description: Update a storefront banner. Requires an admin bearer token.
 *     tags:
 *       - Banners
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *                 nullable: true
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               imagePublicId:
 *                 type: string
 *                 nullable: true
 *               ctaLabel:
 *                 type: string
 *                 nullable: true
 *               ctaUrl:
 *                 type: string
 *                 nullable: true
 *               sortOrder:
 *                 type: integer
 *                 minimum: 0
 *               isActive:
 *                 type: boolean
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               endsAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Banner not found
 *       422:
 *         description: Validation failed
 */
bannersRouter.patch("/:id", ...adminOnly, validate(updateBannerSchema), bannersController.update);

/**
 * @swagger
 * /banners/{id}:
 *   delete:
 *     summary: Delete banner
 *     description: Soft delete a storefront banner. Requires an admin bearer token.
 *     tags:
 *       - Banners
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Banner not found
 */
bannersRouter.delete("/:id", ...adminOnly, validate(deleteBannerSchema), bannersController.remove);
