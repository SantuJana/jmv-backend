import { Router } from "express";

import { UserRole } from "@/generated/prisma/enums";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { validate } from "@/middlewares/validate.middleware";

import { categoriesController } from "./categories.controller";
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategorySchema,
  listCategoriesSchema,
  updateCategorySchema
} from "./categories.validation";

export const categoriesRouter = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List active categories
 *     description: Retrieve active, non-deleted product categories with pagination.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of categories per page
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                         categories:
 *                           type: array
 *                           items:
 *                             $ref: "#/components/schemas/Category"
 *                     meta:
 *                       $ref: "#/components/schemas/PaginationMeta"
 */
categoriesRouter.get("/", validate(listCategoriesSchema), categoriesController.list);

/**
 * @swagger
 * /categories/{idOrSlug}:
 *   get:
 *     summary: Get category
 *     description: Retrieve an active category by UUID or slug.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *         example: fresh-fruits
 *     responses:
 *       200:
 *         description: Category retrieved successfully
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
 *                         category:
 *                           $ref: "#/components/schemas/Category"
 *       404:
 *         description: Category not found
 */
categoriesRouter.get("/:idOrSlug", validate(getCategorySchema), categoriesController.get);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create category
 *     description: Create a product category. Requires an admin bearer token.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fresh Fruits
 *               slug:
 *                 type: string
 *                 example: fresh-fruits
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://storage.example.com/jmv/jmv/categories/fruits.jpg
 *               imagePublicId:
 *                 type: string
 *                 example: categories/fruits
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Category slug already exists
 *       422:
 *         description: Validation failed
 */
categoriesRouter.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createCategorySchema),
  categoriesController.create
);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update category
 *     description: Update a product category. Requires an admin bearer token.
 *     tags:
 *       - Categories
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
 *               name:
 *                 type: string
 *                 example: Seasonal Fruits
 *               slug:
 *                 type: string
 *                 example: seasonal-fruits
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               imagePublicId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category slug already exists
 *       422:
 *         description: Validation failed
 */
categoriesRouter.patch(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateCategorySchema),
  categoriesController.update
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Soft delete a product category. Requires an admin bearer token.
 *     tags:
 *       - Categories
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
 *         description: Category deleted successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 */
categoriesRouter.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(deleteCategorySchema),
  categoriesController.remove
);
