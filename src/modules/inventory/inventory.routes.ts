import { Router } from "express";

import { UserRole } from "@/generated/prisma/enums";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { validate } from "@/middlewares/validate.middleware";

import { inventoryController } from "./inventory.controller";
import { listLowStockSchema, updateVariantStockSchema } from "./inventory.validation";

export const inventoryRouter = Router();

inventoryRouter.use(authenticate, authorize(UserRole.ADMIN));

/**
 * @swagger
 * /inventory/low-stock:
 *   get:
 *     summary: List low-stock variants
 *     description: Retrieve product variants at or below the given stock threshold. Requires an admin bearer token.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 1000
 *           default: 10
 *     responses:
 *       200:
 *         description: Low-stock variants retrieved successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 */
inventoryRouter.get("/low-stock", validate(listLowStockSchema), inventoryController.listLowStock);

/**
 * @swagger
 * /inventory/variants/{variantId}/stock:
 *   patch:
 *     summary: Update variant stock
 *     description: Set stock for a product variant. Requires an admin bearer token.
 *     tags:
 *       - Inventory
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
 *             required:
 *               - stock
 *             properties:
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product variant not found
 */
inventoryRouter.patch("/variants/:variantId/stock", validate(updateVariantStockSchema), inventoryController.updateStock);
