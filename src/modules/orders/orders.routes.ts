import { Router } from "express";

import { UserRole } from "@/generated/prisma/enums";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { validate } from "@/middlewares/validate.middleware";

import { ordersController } from "./orders.controller";
import { createOrderSchema, listOrdersSchema, orderParamsSchema, updateOrderStatusSchema } from "./orders.validation";

export const ordersRouter = Router();

ordersRouter.use(authenticate);

/**
 * @swagger
 * /orders/mine:
 *   get:
 *     summary: List my orders
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
ordersRouter.get("/mine", validate(listOrdersSchema), ordersController.listMine);

/**
 * @swagger
 * /orders/mine/{orderId}:
 *   get:
 *     summary: Get my order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
ordersRouter.get("/mine/:orderId", validate(orderParamsSchema), ordersController.getMine);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create order from cart
 *     description: Creates a COD order from the authenticated user's cart, reduces stock, and clears the cart.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *             properties:
 *               addressId:
 *                 type: string
 *                 format: uuid
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD]
 *                 default: COD
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Order created successfully
 *       404:
 *         description: Address not found
 *       409:
 *         description: Cart empty, item unavailable, or insufficient stock
 */
ordersRouter.post("/", validate(createOrderSchema), ordersController.create);

/**
 * @swagger
 * /orders/manage:
 *   get:
 *     summary: List all orders for admin
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       403:
 *         description: Admin access required
 */
ordersRouter.get("/manage", authorize(UserRole.ADMIN), validate(listOrdersSchema), ordersController.listForAdmin);

/**
 * @swagger
 * /orders/manage/{orderId}:
 *   get:
 *     summary: Get order for admin
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
ordersRouter.get("/manage/:orderId", authorize(UserRole.ADMIN), validate(orderParamsSchema), ordersController.getForAdmin);

/**
 * @swagger
 * /orders/manage/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PACKED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED]
 *               paymentStatus:
 *                 type: string
 *                 enum: [PENDING, PAID, FAILED, REFUNDED]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
ordersRouter.patch(
  "/manage/:orderId/status",
  authorize(UserRole.ADMIN),
  validate(updateOrderStatusSchema),
  ordersController.updateStatus
);
