import { Router } from "express";

import { UserRole } from "@/generated/prisma/enums";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/authorize.middleware";
import { validate } from "@/middlewares/validate.middleware";

import { couponsController } from "./coupons.controller";
import {
  couponParamsSchema,
  createCouponSchema,
  listCouponsSchema,
  updateCouponSchema,
  validateCouponSchema
} from "./coupons.validation";

export const couponsRouter = Router();

couponsRouter.use(authenticate);

couponsRouter.post("/validate", validate(validateCouponSchema), couponsController.validate);

couponsRouter.get("/manage", authorize(UserRole.ADMIN), validate(listCouponsSchema), couponsController.listForAdmin);
couponsRouter.post("/manage", authorize(UserRole.ADMIN), validate(createCouponSchema), couponsController.create);
couponsRouter.patch(
  "/manage/:couponId",
  authorize(UserRole.ADMIN),
  validate(updateCouponSchema),
  couponsController.update
);
couponsRouter.delete(
  "/manage/:couponId",
  authorize(UserRole.ADMIN),
  validate(couponParamsSchema),
  couponsController.remove
);
