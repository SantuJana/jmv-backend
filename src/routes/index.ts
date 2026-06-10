import { Router } from "express";

import { authRouter } from "@/modules/auth/auth.routes";
import { bannersRouter } from "@/modules/banners/banners.routes";
import { cartRouter } from "@/modules/cart/cart.routes";
import { categoriesRouter } from "@/modules/categories/categories.routes";
import { couponsRouter } from "@/modules/coupons/coupons.routes";
import { inventoryRouter } from "@/modules/inventory/inventory.routes";
import { notificationsRouter } from "@/modules/notifications/notifications.routes";
import { ordersRouter } from "@/modules/orders/orders.routes";
import { paymentsRouter } from "@/modules/payments/payments.routes";
import { productsRouter } from "@/modules/products/products.routes";
import { uploadsRouter } from "@/modules/uploads/uploads.routes";
import { usersRouter } from "@/modules/users/users.routes";
import { wishlistRouter } from "@/modules/wishlist/wishlist.routes";
import { buildApiResponse } from "@/utils/api-response";

export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.status(200).json(buildApiResponse({ message: "JMV Grocery API v1" }));
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/banners", bannersRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/coupons", couponsRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/wishlist", wishlistRouter);
