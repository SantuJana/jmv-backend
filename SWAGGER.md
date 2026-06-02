# Swagger Documentation Guide

This file explains how to add Swagger/OpenAPI documentation to your API endpoints.

## Quick Start

1. Add JSDoc comments above your route handlers with `@swagger` tags
2. The documentation will automatically be picked up from `src/modules/**/*.routes.ts` files
3. Access the documentation at `/api-docs` when running your server
4. Access the raw OpenAPI JSON at `/api-docs.json`

## Example: Documenting an Endpoint

Add JSDoc comments before your route definition:

```typescript
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Server error
 */
authRouter.post("/register", validate(registerSchema), asyncHandler(authController.register));
```

## Common Patterns

### Protected Endpoints (Requiring Bearer Token)
```typescript
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 */
```

### Path Parameters
```typescript
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
```

### Query Parameters
```typescript
/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of products
 */
```

## File Structure

- **Swagger config**: `src/config/swagger.ts` - Main Swagger configuration
- **API docs endpoint**: `/api-docs` - Access Swagger UI here
- **OpenAPI JSON endpoint**: `/api-docs.json` - Raw OpenAPI specification
- **Documentation source**: JSDoc comments in `src/modules/**/*.routes.ts`

## Tips

- Use consistent tags for grouping related endpoints (e.g., "Auth", "Products", "Orders")
- Include meaningful descriptions and examples
- Document all response codes, especially errors
- Keep schemas reusable and DRY
- Use the Swagger UI to test endpoints directly

## Access Swagger UI

1. Start your development server: `npm run dev`
2. Open browser to the API port configured in `.env`, for example: `http://localhost:5000/api-docs`
3. You can test endpoints directly from the UI with "Try it out" button
