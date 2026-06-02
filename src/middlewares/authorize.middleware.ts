import type { RequestHandler } from "express";

import type { UserRole } from "@/generated/prisma/enums";
import { AppError } from "@/utils/app-error";

export const authorize =
  (...allowedRoles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication is required", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to access this resource", 403));
    }

    return next();
  };
