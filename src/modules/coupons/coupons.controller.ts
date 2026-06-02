import type { RequestHandler } from "express";

import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { couponsService } from "./coupons.service";

export const couponsController = {
  listForAdmin: asyncHandler(async (req, res) => {
    const result = await couponsService.listForAdmin(req.query);

    res.status(200).json(
      buildApiResponse({
        message: "Coupons retrieved successfully",
        data: { coupons: result.coupons },
        meta: result.meta
      })
    );
  }) as RequestHandler,

  validate: asyncHandler(async (req, res) => {
    const result = await couponsService.validate(req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Coupon applied successfully",
        data: result
      })
    );
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    const coupon = await couponsService.create(req.body);

    res.status(201).json(
      buildApiResponse({
        message: "Coupon created successfully",
        data: { coupon }
      })
    );
  }) as RequestHandler,

  update: asyncHandler(async (req, res) => {
    const coupon = await couponsService.update(req.params.couponId as string, req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Coupon updated successfully",
        data: { coupon }
      })
    );
  }) as RequestHandler,

  remove: asyncHandler(async (req, res) => {
    const result = await couponsService.remove(req.params.couponId as string);

    res.status(200).json(
      buildApiResponse({
        message: "Coupon deleted successfully",
        data: result
      })
    );
  }) as RequestHandler
};
