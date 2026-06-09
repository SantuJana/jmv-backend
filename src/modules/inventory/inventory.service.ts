import { AppError } from "@/utils/app-error";

import { inventoryRepository } from "./inventory.repository";
import type { ListLowStockQuery, UpdateVariantStockInput } from "./inventory.validation";

const toInventoryVariantResponse = (variant: Awaited<ReturnType<typeof inventoryRepository.findVariant>>) => {
  if (!variant) {
    return null;
  }

  return {
    id: variant.id,
    productId: variant.productId,
    name: variant.name,
    mrp: variant.mrp.toString(),
    price: variant.price.toString(),
    offerPrice: variant.price.toString(),
    stock: variant.stock,
    sku: variant.sku,
    unit: variant.unit,
    isActive: variant.isActive,
    product: {
      id: variant.product.id,
      name: variant.product.name,
      slug: variant.product.slug,
      isActive: variant.product.isActive,
      category: {
        id: variant.product.category.id,
        name: variant.product.category.name,
        slug: variant.product.category.slug
      }
    },
    updatedAt: variant.updatedAt
  };
};

export const inventoryService = {
  async listLowStock(query: Partial<ListLowStockQuery> = {}) {
    const threshold = query.threshold ?? 10;
    const variants = await inventoryRepository.listLowStock(threshold);

    return {
      threshold,
      variants: variants.map(toInventoryVariantResponse).filter((variant) => variant !== null)
    };
  },

  async updateStock(variantId: string, input: UpdateVariantStockInput) {
    const variant = await inventoryRepository.findVariant(variantId);

    if (!variant || variant.product.deletedAt) {
      throw new AppError("Product variant not found", 404);
    }

    const updatedVariant = await inventoryRepository.updateStock(variantId, input.stock);

    return toInventoryVariantResponse(updatedVariant);
  }
};
