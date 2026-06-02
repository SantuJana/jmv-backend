import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { env } from "@/config/env";
import { AppError } from "@/utils/app-error";
import { buildApiResponse } from "@/utils/api-response";

const formatFieldName = (path: (string | number)[]) => {
  const field = path[0] === "body" || path[0] === "query" || path[0] === "params" ? path[1] : path[0];

  return typeof field === "string" ? field : "request";
};

const buildValidationErrors = (error: ZodError) =>
  error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = formatFieldName(issue.path);

    errors[field] = [...(errors[field] ?? []), issue.message];

    return errors;
  }, {});

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    const errors = buildValidationErrors(error);
    const firstMessage = Object.entries(errors)
      .flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`))
      .at(0);

    return res.status(422).json(
      buildApiResponse({
        success: false,
        message: firstMessage ?? "Validation failed",
        errors
      })
    );
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      buildApiResponse({
        success: false,
        message: error.message,
        errors: error.details
      })
    );
  }

  console.error(error);

  return res.status(500).json(
    buildApiResponse({
      success: false,
      message: "Internal server error",
      errors: env.NODE_ENV === "production" ? undefined : error
    })
  );
};
