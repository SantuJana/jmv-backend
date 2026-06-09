ALTER TABLE "order_items" ADD COLUMN "mrp" DECIMAL(10,2);

UPDATE "order_items" SET "mrp" = "unit_price" WHERE "mrp" IS NULL;

ALTER TABLE "order_items" ALTER COLUMN "mrp" SET NOT NULL;
