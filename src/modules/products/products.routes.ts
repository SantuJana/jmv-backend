import { Router } from "express";

import { UserRole } from "@/generated/prisma/enums";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { validate } from "@/middlewares/validate.middleware";

import { productsController } from "./products.controller";
import {
  createProductSchema,
  createVariantSchema,
  deleteProductSchema,
  deleteVariantSchema,
  getProductSchema,
  listProductsSchema,
  updateProductSchema,
  updateVariantSchema
} from "./products.validation";

export const productsRouter = Router();

const adminOnly = [authenticate, authorize(UserRole.ADMIN)];

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List active products
 *     description: Retrieve active, non-deleted products with active categories and variants.
 *     tags:
 *       - Products
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search product name or description
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: categorySlug
 *         schema:
 *           type: string
 *         example: fresh-fruits
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
 *                         products:
 *                           type: array
 *                           items:
 *                             $ref: "#/components/schemas/Product"
 *                     meta:
 *                       $ref: "#/components/schemas/PaginationMeta"
 */
productsRouter.get("/", validate(listProductsSchema), productsController.list);

/**
 * @swagger
 * /products/manage:
 *   get:
 *     summary: List all products for admin
 *     description: Retrieve products and variants for catalog management, including inactive records.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 */
productsRouter.get(
  "/manage",
  ...adminOnly,
  validate(listProductsSchema),
  productsController.listForAdmin
);

/**
 * @swagger
 * /products/{idOrSlug}:
 *   get:
 *     summary: Get product
 *     description: Retrieve an active product by UUID or slug.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *         example: shimla-apple
 *     responses:
 *       200:
 *         description: Product retrieved successfully
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
 *                         product:
 *                           $ref: "#/components/schemas/Product"
 *       404:
 *         description: Product not found
 */
productsRouter.get("/:idOrSlug", validate(getProductSchema), productsController.get);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create product
 *     description: Create a product and optional variants. Requires an admin bearer token.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - name
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: Shimla Apple
 *               slug:
 *                 type: string
 *                 example: shimla-apple
 *               description:
 *                 type: string
 *                 example: Fresh and crisp apples.
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               imagePublicId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - price
 *                     - sku
 *                     - unit
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: 1 kg
 *                     price:
 *                       type: string
 *                       example: "120.00"
 *                     stock:
 *                       type: integer
 *                       example: 25
 *                     sku:
 *                       type: string
 *                       example: APPLE-1KG
 *                     unit:
 *                       type: string
 *                       example: kg
 *                     isActive:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Product slug or variant SKU already exists
 *       422:
 *         description: Validation failed
 */
productsRouter.post("/", ...adminOnly, validate(createProductSchema), productsController.create);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update product
 *     description: Update product details. Requires an admin bearer token.
 *     tags:
 *       - Products
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
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               imagePublicId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product or category not found
 *       409:
 *         description: Product slug already exists
 *       422:
 *         description: Validation failed
 */
productsRouter.patch("/:id", ...adminOnly, validate(updateProductSchema), productsController.update);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product
 *     description: Soft delete a product. Requires an admin bearer token.
 *     tags:
 *       - Products
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
 *         description: Product deleted successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
productsRouter.delete("/:id", ...adminOnly, validate(deleteProductSchema), productsController.remove);

/**
 * @swagger
 * /products/{productId}/variants:
 *   post:
 *     summary: Create product variant
 *     description: Add a variant to an existing product. Requires an admin bearer token.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *             required:
 *               - name
 *               - price
 *               - sku
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *                 example: 500 g
 *               price:
 *                 type: string
 *                 example: "65.00"
 *               stock:
 *                 type: integer
 *                 example: 40
 *               sku:
 *                 type: string
 *                 example: APPLE-500G
 *               unit:
 *                 type: string
 *                 example: g
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product variant created successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       409:
 *         description: Variant SKU already exists
 *       422:
 *         description: Validation failed
 */
productsRouter.post("/:productId/variants", ...adminOnly, validate(createVariantSchema), productsController.createVariant);

/**
 * @swagger
 * /products/variants/{variantId}:
 *   patch:
 *     summary: Update product variant
 *     description: Update variant price, stock, SKU, unit, or active state. Requires an admin bearer token.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
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
 *               price:
 *                 type: string
 *                 example: "70.00"
 *               stock:
 *                 type: integer
 *               sku:
 *                 type: string
 *               unit:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product variant updated successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Variant not found
 *       409:
 *         description: Variant SKU already exists
 *       422:
 *         description: Validation failed
 */
productsRouter.patch(
  "/variants/:variantId",
  ...adminOnly,
  validate(updateVariantSchema),
  productsController.updateVariant
);

/**
 * @swagger
 * /products/variants/{variantId}:
 *   delete:
 *     summary: Delete product variant
 *     description: Deactivate a product variant. Requires an admin bearer token.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product variant deleted successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Variant not found
 */
productsRouter.delete(
  "/variants/:variantId",
  ...adminOnly,
  validate(deleteVariantSchema),
  productsController.removeVariant
);
