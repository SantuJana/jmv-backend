import type { RequestHandler } from "express";

import { AppError } from "@/utils/app-error";
import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { cartService } from "./cart.service";

const getUserId = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) {
    throw new AppError("Authentication is required", 401);
  }

  return req.user.id;
};

export const cartController = {
  get: asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(getUserId(req));

    res.status(200).json(
      buildApiResponse({
        message: "Cart retrieved successfully",
        data: {
          cart
        }
      })
    );
  }) as RequestHandler,

  addItem: asyncHandler(async (req, res) => {
    const cart = await cartService.addItem(getUserId(req), req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Cart item added successfully",
        data: {
          cart
        }
      })
    );
  }) as RequestHandler,

  updateItem: asyncHandler(async (req, res) => {
    const cart = await cartService.updateItem(getUserId(req), req.params.itemId as string, req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Cart item updated successfully",
        data: {
          cart
        }
      })
    );
  }) as RequestHandler,

  removeItem: asyncHandler(async (req, res) => {
    const cart = await cartService.removeItem(getUserId(req), req.params.itemId as string);

    res.status(200).json(
      buildApiResponse({
        message: "Cart item removed successfully",
        data: {
          cart
        }
      })
    );
  }) as RequestHandler,

  clear: asyncHandler(async (req, res) => {
    const cart = await cartService.clear(getUserId(req));

    res.status(200).json(
      buildApiResponse({
        message: "Cart cleared successfully",
        data: {
          cart
        }
      })
    );
  }) as RequestHandler
};
