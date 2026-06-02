import type { RequestHandler } from "express";

import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { authService } from "./auth.service";

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    res.status(201).json(
      buildApiResponse({
        message: "Account registered successfully",
        data: result
      })
    );
  }) as RequestHandler,

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Logged in successfully",
        data: result
      })
    );
  }) as RequestHandler,

  refresh: asyncHandler(async (req, res) => {
    const tokens = await authService.refresh(req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Token refreshed successfully",
        data: {
          tokens
        }
      })
    );
  }) as RequestHandler,

  logout: asyncHandler(async (req, res) => {
    const result = await authService.logout(req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Logged out successfully",
        data: result
      })
    );
  }) as RequestHandler
};
