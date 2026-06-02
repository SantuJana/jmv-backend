import type { RequestHandler } from "express";

import { env } from "@/config/env";

export const requestLogger: RequestHandler = (req, res, next) => {
  if (env.NODE_ENV === "test") {
    return next();
  }

  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
  });

  return next();
};
