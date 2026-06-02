import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { env } from "@/config/env";
import { swaggerSpec } from "@/config/swagger";
import { apiLimiter } from "@/middlewares/rate-limit.middleware";
import { errorHandler } from "@/middlewares/error-handler.middleware";
import { notFoundHandler } from "@/middlewares/not-found.middleware";
import { requestLogger } from "@/middlewares/request-logger.middleware";
import { apiRouter } from "@/routes";
import { buildApiResponse } from "@/utils/api-response";

export const createApp = () => {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"]
        }
      }
    })
  );

  const allowedOrigins = new Set([
    env.CORS_ORIGIN,
    env.API_BASE_URL,
    `http://localhost:${env.PORT}`,
    `http://127.0.0.1:${env.PORT}`
  ]);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        if (env.NODE_ENV !== "production") {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true
    })
  );

  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    },
    customSiteTitle: "JMV Grocery API Docs"
  };

  app.get("/api-docs.json", (_req, res) => {
    res.status(200).json(swaggerSpec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serveFiles(swaggerSpec, swaggerUiOptions),
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
  );

  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(apiLimiter);

  app.get("/health", (_req, res) => {
    res.status(200).json(
      buildApiResponse({
        message: "JMV Grocery API is healthy",
        data: {
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        }
      })
    );
  });

  app.use(env.API_PREFIX, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
