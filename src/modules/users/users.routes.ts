import { Router } from "express";

import { UserRole } from "@/generated/prisma/enums";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { validate } from "@/middlewares/validate.middleware";

import { usersController } from "./users.controller";
import {
  addressParamsSchema,
  createAddressSchema,
  listUsersSchema,
  updateAddressSchema,
  updateUserStatusSchema,
  userParamsSchema,
  updateProfileSchema
} from "./users.validation";

export const usersRouter = Router();

usersRouter.use(authenticate);

/**
 * @swagger
 * /users/manage:
 *   get:
 *     summary: List users for admin
 *     description: Retrieve users with order and address counts. Requires an admin bearer token.
 *     tags:
 *       - Users
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, BLOCKED]
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, CUSTOMER]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 */
usersRouter.get("/manage", authorize(UserRole.ADMIN), validate(listUsersSchema), usersController.listUsers);

/**
 * @swagger
 * /users/manage/{userId}:
 *   get:
 *     summary: Get user details for admin
 *     description: Retrieve a user with addresses and recent orders. Requires an admin bearer token.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
usersRouter.get("/manage/:userId", authorize(UserRole.ADMIN), validate(userParamsSchema), usersController.getUserDetails);

/**
 * @swagger
 * /users/manage/{userId}/status:
 *   patch:
 *     summary: Update user status
 *     description: Block or unblock a user. Requires an admin bearer token.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *                 enum: [ACTIVE, BLOCKED]
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       401:
 *         description: Authentication token is required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       409:
 *         description: Cannot block your own account
 */
usersRouter.patch(
  "/manage/:userId/status",
  authorize(UserRole.ADMIN),
  validate(updateUserStatusSchema),
  usersController.updateUserStatus
);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update my profile
 *     description: Update profile details for the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication token is required
 *       409:
 *         description: Email or phone already in use
 */
usersRouter.patch("/me", validate(updateProfileSchema), usersController.updateProfile);

/**
 * @swagger
 * /users/me/addresses:
 *   get:
 *     summary: List my addresses
 *     description: Retrieve addresses for the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
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
 *                         addresses:
 *                           type: array
 *                           items:
 *                             $ref: "#/components/schemas/Address"
 *       401:
 *         description: Authentication token is required
 */
usersRouter.get("/me/addresses", usersController.listAddresses);

/**
 * @swagger
 * /users/me/addresses:
 *   post:
 *     summary: Create my address
 *     description: Create an address for the authenticated user. The first address becomes default automatically.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - line1
 *               - city
 *               - state
 *               - postalCode
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [HOME, WORK, OTHER]
 *                 example: HOME
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               line1:
 *                 type: string
 *                 example: 12 Market Street
 *               line2:
 *                 type: string
 *                 example: Near City Mall
 *               city:
 *                 type: string
 *                 example: Kolkata
 *               state:
 *                 type: string
 *                 example: West Bengal
 *               postalCode:
 *                 type: string
 *                 example: "700001"
 *               country:
 *                 type: string
 *                 example: India
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Address created successfully
 *       401:
 *         description: Authentication token is required
 *       422:
 *         description: Validation failed
 */
usersRouter.post("/me/addresses", validate(createAddressSchema), usersController.createAddress);

/**
 * @swagger
 * /users/me/addresses/{addressId}:
 *   patch:
 *     summary: Update my address
 *     description: Update an address owned by the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
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
 *               type:
 *                 type: string
 *                 enum: [HOME, WORK, OTHER]
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               line1:
 *                 type: string
 *               line2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       401:
 *         description: Authentication token is required
 *       404:
 *         description: Address not found
 *       422:
 *         description: Validation failed
 */
usersRouter.patch("/me/addresses/:addressId", validate(updateAddressSchema), usersController.updateAddress);

/**
 * @swagger
 * /users/me/addresses/{addressId}:
 *   delete:
 *     summary: Delete my address
 *     description: Delete an address owned by the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Authentication token is required
 *       404:
 *         description: Address not found
 */
usersRouter.delete("/me/addresses/:addressId", validate(addressParamsSchema), usersController.deleteAddress);
