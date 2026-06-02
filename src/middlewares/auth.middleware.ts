import type { RequestHandler } from "express";
import jsonwebtoken from "jsonwebtoken";

import { AppError } from "@/utils/app-error";
import { verifyAccessToken } from "@/utils/token";

const { TokenExpiredError } = jsonwebtoken;

export const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is required", 401));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role
    };

    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new AppError("Authentication token has expired", 401));
    }

    return next(new AppError("Invalid authentication token", 401));
  }
};
