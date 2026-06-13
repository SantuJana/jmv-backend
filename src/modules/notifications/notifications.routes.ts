import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import { notificationsController } from "./notifications.controller";

export const notificationsRouter = Router();

notificationsRouter.post("/token", authenticate, notificationsController.registerToken);
