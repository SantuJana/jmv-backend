import type { RequestHandler } from "express";

import { AppError } from "@/utils/app-error";
import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { ordersService } from "./orders.service";

const getUserId = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) {
    throw new AppError("Authentication is required", 401);
  }

  return req.user.id;
};

export const ordersController = {
  listMine: asyncHandler(async (req, res) => {
    const result = await ordersService.listForUser(getUserId(req), req.query);

    res.status(200).json(
      buildApiResponse({
        message: "Orders retrieved successfully",
        data: { orders: result.orders },
        meta: result.meta
      })
    );
  }) as RequestHandler,

  listForAdmin: asyncHandler(async (req, res) => {
    const result = await ordersService.listForAdmin(req.query);

    res.status(200).json(
      buildApiResponse({
        message: "Orders retrieved successfully",
        data: { orders: result.orders },
        meta: result.meta
      })
    );
  }) as RequestHandler,

  getMine: asyncHandler(async (req, res) => {
    const order = await ordersService.get(req.params.orderId as string, getUserId(req));

    res.status(200).json(
      buildApiResponse({
        message: "Order retrieved successfully",
        data: { order }
      })
    );
  }) as RequestHandler,

  getForAdmin: asyncHandler(async (req, res) => {
    const order = await ordersService.get(req.params.orderId as string);

    res.status(200).json(
      buildApiResponse({
        message: "Order retrieved successfully",
        data: { order }
      })
    );
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    const order = await ordersService.create(getUserId(req), req.body);

    res.status(201).json(
      buildApiResponse({
        message: "Order created successfully",
        data: { order }
      })
    );
  }) as RequestHandler,

  updateStatus: asyncHandler(async (req, res) => {
    const order = await ordersService.updateStatus(req.params.orderId as string, req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Order updated successfully",
        data: { order }
      })
    );
  }) as RequestHandler
};
