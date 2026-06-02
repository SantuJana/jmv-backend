CREATE TABLE "banners" (
  "id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "image_url" TEXT,
  "image_public_id" TEXT,
  "cta_label" TEXT,
  "cta_url" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "starts_at" TIMESTAMP(3),
  "ends_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),

  CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "banners_is_active_idx" ON "banners"("is_active");
CREATE INDEX "banners_sort_order_idx" ON "banners"("sort_order");
CREATE INDEX "banners_starts_at_idx" ON "banners"("starts_at");
CREATE INDEX "banners_ends_at_idx" ON "banners"("ends_at");
