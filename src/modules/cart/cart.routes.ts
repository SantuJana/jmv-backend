import { Router } from "express";

import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";

import { cartController } from "./cart.controller";
import { addCartItemSchema, removeCartItemSchema, updateCartItemSchema } from "./cart.validation";

export const cartRouter = Router();

cartRouter.use(authenticate);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get cart
 *     description: Retrieve the authenticated customer's cart. Creates an empty cart if one does not exist.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                         cart:
 *                           $ref: "#/components/schemas/Cart"
 *       401:
 *         description: Authentication token is required
 */
cartRouter.get("/", cartController.get);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add cart item
 *     description: Add a product variant to the authenticated customer's cart, or increase quantity if it already exists.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - variantId
 *               - quantity
 *             properties:
 *               variantId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 example: 2
 *     responses:
 *       200:
 *         description: Cart item added successfully
 *       401:
 *         description: Authentication token is required
 *       404:
 *         description: Product variant not found
 *       409:
 *         description: Requested quantity exceeds available stock
 *       422:
 *         description: Validation failed
 */
cartRouter.post("/items", validate(addCartItemSchema), cartController.addItem);

/**
 * @swagger
 * /cart/items/{itemId}:
 *   patch:
 *     summary: Update cart item
 *     description: Replace the quantity for an item in the authenticated customer's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       401:
 *         description: Authentication token is required
 *       404:
 *         description: Cart item not found
 *       409:
 *         description: Product variant is unavailable or quantity exceeds stock
 *       422:
 *         description: Validation failed
 */
cartRouter.patch("/items/:itemId", validate(updateCartItemSchema), cartController.updateItem);

/**
 * @swagger
 * /cart/items/{itemId}:
 *   delete:
 *     summary: Remove cart item
 *     description: Remove an item from the authenticated customer's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cart item removed successfully
 *       401:
 *         description: Authentication token is required
 *       404:
 *         description: Cart item not found
 */
cartRouter.delete("/items/:itemId", validate(removeCartItemSchema), cartController.removeItem);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from the authenticated customer's cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Authentication token is required
 */
cartRouter.delete("/", cartController.clear);
