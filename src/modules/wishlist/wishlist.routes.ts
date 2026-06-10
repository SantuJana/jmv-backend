import { Router } from "express";

import { authenticate } from "@/middlewares/auth.middleware";
import { wishlistController } from "./wishlist.controller";

export const wishlistRouter = Router();

wishlistRouter.use(authenticate);

wishlistRouter.get("/", wishlistController.getWishlist);
wishlistRouter.post("/items", wishlistController.addItem);
wishlistRouter.delete("/items/:productId", wishlistController.removeItem);
