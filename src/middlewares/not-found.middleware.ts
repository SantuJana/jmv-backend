import type { RequestHandler } from "express";

import { buildApiResponse } from "@/utils/api-response";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json(
    buildApiResponse({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`
    })
  );
};
