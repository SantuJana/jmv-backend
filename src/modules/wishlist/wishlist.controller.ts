import type { RequestHandler } from "express";

import { AppError } from "@/utils/app-error";
import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { wishlistService } from "./wishlist.service";

const getUserId = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) {
    throw new AppError("Authentication is required", 401);
  }
  return req.user.id;
};

export const wishlistController = {
  getWishlist: asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.getWishlist(getUserId(req));

    res.status(200).json(
      buildApiResponse({
        message: "Wishlist retrieved successfully",
        data: { wishlist }
      })
    );
  }) as RequestHandler,

  addItem: asyncHandler(async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
      throw new AppError("Product ID is required", 400);
    }

    const item = await wishlistService.addItem(getUserId(req), productId);

    res.status(201).json(
      buildApiResponse({
        message: "Item added to wishlist",
        data: { item }
      })
    );
  }) as RequestHandler,

  removeItem: asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
      throw new AppError("Product ID is required", 400);
    }

    await wishlistService.removeItem(getUserId(req), productId);

    res.status(200).json(
      buildApiResponse({
        message: "Item removed from wishlist",
        data: null
      })
    );
  }) as RequestHandler
};
