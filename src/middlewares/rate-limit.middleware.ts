import rateLimit from "express-rate-limit";

import { buildApiResponse } from "@/utils/api-response";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(
      buildApiResponse({
        success: false,
        message: "Too many requests. Please try again later."
      })
    );
  }
});
