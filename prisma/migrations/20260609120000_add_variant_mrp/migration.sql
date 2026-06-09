ALTER TABLE "product_variants" ADD COLUMN "mrp" DECIMAL(10,2);

UPDATE "product_variants" SET "mrp" = "price" WHERE "mrp" IS NULL;

ALTER TABLE "product_variants" ALTER COLUMN "mrp" SET NOT NULL;
