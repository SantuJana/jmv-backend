import type { RequestHandler } from "express";

import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { uploadsService } from "./uploads.service";

export const uploadsController = {
  getImage: asyncHandler(async (req, res) => {
    const objectKey = req.params[0];
    const image = await uploadsService.getImage(objectKey);

    res.setHeader("Content-Type", image.contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    if (image.contentLength) {
      res.setHeader("Content-Length", image.contentLength);
    }

    if (image.etag) {
      res.setHeader("ETag", image.etag);
    }

    if (image.lastModified) {
      res.setHeader("Last-Modified", image.lastModified);
    }

    res.status(200).send(image.body);
  }) as RequestHandler,

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
