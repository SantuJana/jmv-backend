import type { RequestHandler } from "express";

import { buildApiResponse } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

import { productsService } from "./products.service";

export const productsController = {
  list: asyncHandler(async (req, res) => {
    const result = await productsService.list(req.query);

    res.status(200).json(
      buildApiResponse({
        message: "Products retrieved successfully",
        data: {
          products: result.products
        },
        meta: result.meta
      })
    );
  }) as RequestHandler,

  listForAdmin: asyncHandler(async (req, res) => {
    const result = await productsService.listForAdmin(req.query);

    res.status(200).json(
      buildApiResponse({
        message: "Products retrieved successfully",
        data: {
          products: result.products
        },
        meta: result.meta
      })
    );
  }) as RequestHandler,

  get: asyncHandler(async (req, res) => {
    const product = await productsService.get(req.params.idOrSlug as string);

    res.status(200).json(
      buildApiResponse({
        message: "Product retrieved successfully",
        data: {
          product
        }
      })
    );
  }) as RequestHandler,

  create: asyncHandler(async (req, res) => {
    const product = await productsService.create(req.body);

    res.status(201).json(
      buildApiResponse({
        message: "Product created successfully",
        data: {
          product
        }
      })
    );
  }) as RequestHandler,

  update: asyncHandler(async (req, res) => {
    const product = await productsService.update(req.params.id as string, req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Product updated successfully",
        data: {
          product
        }
      })
    );
  }) as RequestHandler,

  remove: asyncHandler(async (req, res) => {
    const result = await productsService.remove(req.params.id as string);

    res.status(200).json(
      buildApiResponse({
        message: "Product deleted successfully",
        data: result
      })
    );
  }) as RequestHandler,

  createVariant: asyncHandler(async (req, res) => {
    const variant = await productsService.createVariant(req.params.productId as string, req.body);

    res.status(201).json(
      buildApiResponse({
        message: "Product variant created successfully",
        data: {
          variant
        }
      })
    );
  }) as RequestHandler,

  updateVariant: asyncHandler(async (req, res) => {
    const variant = await productsService.updateVariant(req.params.variantId as string, req.body);

    res.status(200).json(
      buildApiResponse({
        message: "Product variant updated successfully",
        data: {
          variant
        }
      })
    );
  }) as RequestHandler,

  removeVariant: asyncHandler(async (req, res) => {
    const result = await productsService.removeVariant(req.params.variantId as string);

    res.status(200).json(
      buildApiResponse({
        message: "Product variant deleted successfully",
        data: result
      })
    );
  }) as RequestHandler
};
