import type { RequestHandler } from "express";

import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { uploadsService } from "./uploads.service";

export const uploadsController = {
  uploadImage: asyncHandler(async (req, res) => {
    const image = await uploadsService.uploadImage(req.body, req.file);

    res.status(201).json(
      buildApiResponse({
        message: "Image uploaded successfully",
        data: {
          image
        }
      })
    );
  }) as RequestHandler,

  deleteImage: asyncHandler(async (req, res) => {
    const result = await uploadsService.deleteImage(req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Image deleted successfully",
        data: result
      })
    );
  }) as RequestHandler
};
