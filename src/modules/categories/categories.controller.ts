import type { RequestHandler } from "express";

import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { categoriesService } from "./categories.service";

export const categoriesController = {
  list: asyncHandler(async (req, res) => {
    const result = await categoriesService.list(req.query);

    res.status(200).json(
      buildApiResponse({
        message: "Categories retrieved successfully",
        data: {
          categories: result.categories
        },
        meta: result.meta
      })
    );
  }) as RequestHandler,

  get: asyncHandler(async (req, res) => {
    const category = await categoriesService.get(req.params.idOrSlug as string);

    res.status(200).json(
      buildApiResponse({
        message: "Category retrieved successfully",
        data: {
          category
        }
      })
    );
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    const category = await categoriesService.create(req.body);

    res.status(201).json(
      buildApiResponse({
        message: "Category created successfully",
        data: {
          category
        }
      })
    );
  }) as RequestHandler,

  update: asyncHandler(async (req, res) => {
    const category = await categoriesService.update(req.params.id as string, req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Category updated successfully",
        data: {
          category
        }
      })
    );
  }) as RequestHandler,

  remove: asyncHandler(async (req, res) => {
    const result = await categoriesService.remove(req.params.id as string);

    res.status(200).json(
      buildApiResponse({
        message: "Category deleted successfully",
        data: result
      })
    );
  }) as RequestHandler
};
