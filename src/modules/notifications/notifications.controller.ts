import type { Request, Response } from "express";
import { z } from "zod";

import { buildApiResponse } from "@/utils/api-response";
import { AppError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { notificationsService } from "./notifications.service";

const RegisterTokenSchema = z.object({
  token: z.string().min(1, "Token is required")
});

export const notificationsController = {
  registerToken: asyncHandler(async (req: Request, res: Response) => {
    const parsed = RegisterTokenSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError("Invalid token format", 400);
    }

    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    await notificationsService.registerToken(req.user.id, parsed.data.token);

    res.status(200).json(buildApiResponse({ message: "Push token registered successfully" }));
  })
};
