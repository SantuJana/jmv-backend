import type { RequestHandler } from "express";

import { AppError } from "@/utils/app-error";
import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { usersService } from "./users.service";

const getUserId = (req: Parameters<RequestHandler>[0]) => {
  if (!req.user) {
    throw new AppError("Authentication is required", 401);
  }

  return req.user.id;
};

export const usersController = {
  listUsers: asyncHandler(async (req, res) => {
    const result = await usersService.listUsers(req.query);

    res.status(200).json(
      buildApiResponse({
        message: "Users retrieved successfully",
        data: { users: result.users },
        meta: result.meta
      })
    );
  }) as RequestHandler,

  updateUserStatus: asyncHandler(async (req, res) => {
    const user = await usersService.updateUserStatus(
      req.params.userId as string,
      req.body,
      getUserId(req)
    );

    res.status(200).json(
      buildApiResponse({
        message: "User status updated successfully",
        data: { user }
      })
    );
  }) as RequestHandler,

  getUserDetails: asyncHandler(async (req, res) => {
    const user = await usersService.getUserDetails(req.params.userId as string);

    res.status(200).json(
      buildApiResponse({
        message: "User retrieved successfully",
        data: { user }
      })
    );
  }) as RequestHandler,

  updateProfile: asyncHandler(async (req, res) => {
    const user = await usersService.updateProfile(getUserId(req), req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Profile updated successfully",
        data: { user }
      })
    );
  }) as RequestHandler,

  listAddresses: asyncHandler(async (req, res) => {
    const addresses = await usersService.listAddresses(getUserId(req));

    res.status(200).json(
      buildApiResponse({
        message: "Addresses retrieved successfully",
        data: { addresses }
      })
    );
  }) as RequestHandler,

  createAddress: asyncHandler(async (req, res) => {
    const address = await usersService.createAddress(getUserId(req), req.body);

    res.status(201).json(
      buildApiResponse({
        message: "Address created successfully",
        data: { address }
      })
    );
  }) as RequestHandler,

  updateAddress: asyncHandler(async (req, res) => {
    const address = await usersService.updateAddress(getUserId(req), req.params.addressId as string, req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Address updated successfully",
        data: { address }
      })
    );
  }) as RequestHandler,

  deleteAddress: asyncHandler(async (req, res) => {
    const result = await usersService.deleteAddress(getUserId(req), req.params.addressId as string);

    res.status(200).json(
      buildApiResponse({
        message: "Address deleted successfully",
        data: result
      })
    );
  }) as RequestHandler
};
