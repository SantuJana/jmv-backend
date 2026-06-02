import type { RequestHandler } from "express";

import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { bannersService } from "./banners.service";

export const bannersController = {
  list: asyncHandler(async (req, res) => {
    const result = await bannersService.list(req.query);

    res.status(200).json(
      buildApiResponse({
        message: "Banners retrieved successfully",
        data: {
          banners: result.banners
        },
        meta: result.meta
      })
    );
  }) as RequestHandler,

  listForAdmin: asyncHandler(async (req, res) => {
    const result = await bannersService.listForAdmin(req.query);

    res.status(200).json(
      buildApiResponse({
        message: "Banners retrieved successfully",
        data: {
          banners: result.banners
        },
        meta: result.meta
      })
    );
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    const banner = await bannersService.create(req.body);

    res.status(201).json(
      buildApiResponse({
        message: "Banner created successfully",
        data: {
          banner
        }
      })
    );
  }) as RequestHandler,

  update: asyncHandler(async (req, res) => {
    const banner = await bannersService.update(req.params.id as string, req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Banner updated successfully",
        data: {
          banner
        }
      })
    );
  }) as RequestHandler,

  remove: asyncHandler(async (req, res) => {
    const result = await bannersService.remove(req.params.id as string);

    res.status(200).json(
      buildApiResponse({
        message: "Banner deleted successfully",
        data: result
      })
    );
  }) as RequestHandler
};
