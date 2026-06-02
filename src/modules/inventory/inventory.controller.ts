import type { RequestHandler } from "express";

import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { inventoryService } from "./inventory.service";

export const inventoryController = {
  listLowStock: asyncHandler(async (req, res) => {
    const result = await inventoryService.listLowStock(req.query);

    res.status(200).json(
      buildApiResponse({
        message: "Low-stock variants retrieved successfully",
        data: result
      })
    );
  }) as RequestHandler,

  updateStock: asyncHandler(async (req, res) => {
    const variant = await inventoryService.updateStock(req.params.variantId as string, req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Stock updated successfully",
        data: { variant }
      })
    );
  }) as RequestHandler
};
