CREATE TYPE "CouponDiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" "CouponDiscountType" NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "min_order_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "max_discount_amount" DECIMAL(10,2),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "orders" ADD COLUMN "coupon_id" UUID;
ALTER TABLE "orders" ADD COLUMN "coupon_code" TEXT;
ALTER TABLE "orders" ADD COLUMN "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
CREATE INDEX "coupons_code_idx" ON "coupons"("code");
CREATE INDEX "coupons_is_active_idx" ON "coupons"("is_active");
CREATE INDEX "coupons_starts_at_idx" ON "coupons"("starts_at");
CREATE INDEX "coupons_ends_at_idx" ON "coupons"("ends_at");
CREATE INDEX "orders_coupon_id_idx" ON "orders"("coupon_id");

ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
