import { AppError } from "@/utils/app-error";
import { buildImageUrls, buildObjectStorageImageUrl } from "@/utils/object-storage-image";

import { cartRepository, type CartWithItems } from "./cart.repository";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.validation";

const toMoneyString = (amount: number) => amount.toFixed(2);

const toCartResponse = (cart: CartWithItems | null) => {
  if (!cart) {
    return {
      id: null,
      userId: null,
      items: [],
      subtotal: "0.00",
      totalItems: 0
    };
  }

  const items = cart.items.map((item) => {
    const price = Number(item.variant.price);
    const lineTotal = price * item.quantity;

    return {
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: toMoneyString(price),
      lineTotal: toMoneyString(lineTotal),
      variant: {
        id: item.variant.id,
        name: item.variant.name,
        mrp: item.variant.mrp.toString(),
        price: item.variant.price.toString(),
        offerPrice: item.variant.price.toString(),
        sku: item.variant.sku,
        unit: item.variant.unit,
        stock: item.variant.stock,
        isActive: item.variant.isActive
      },
      product: {
        id: item.variant.product.id,
        name: item.variant.product.name,
        slug: item.variant.product.slug,
        imageUrl: buildObjectStorageImageUrl(item.variant.product.imageUrl, item.variant.product.imagePublicId),
        imageUrls: buildImageUrls(item.variant.product.imageUrl, item.variant.product.imagePublicId),
        isActive: item.variant.product.isActive
      },
      category: {
        id: item.variant.product.category.id,
        name: item.variant.product.category.name,
        slug: item.variant.product.category.slug
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  });

  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    subtotal: toMoneyString(subtotal),
    totalItems,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt
  };
};

const getOrCreateCart = async (userId: string) => {
  const existingCart = await cartRepository.findByUserId(userId);

  if (existingCart) {
    return existingCart;
  }

  return cartRepository.createForUser(userId);
};

export const cartService = {
  async getCart(userId: string) {
    const cart = await getOrCreateCart(userId);

    return toCartResponse(cart);
  },

  async addItem(userId: string, input: AddCartItemInput) {
    const [cart, variant] = await Promise.all([
      getOrCreateCart(userId),
      cartRepository.findVariantForCart(input.variantId)
    ]);

    if (!variant) {
      throw new AppError("Product variant not found", 404);
    }

    const existingItem = await cartRepository.findItem(cart.id, input.variantId);
    const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;

    if (nextQuantity > variant.stock) {
      throw new AppError("Requested quantity exceeds available stock", 409, {
        availableStock: variant.stock
      });
    }

    if (existingItem) {
      await cartRepository.updateItem(existingItem.id, nextQuantity);
    } else {
      await cartRepository.addItem(cart.id, input.variantId, input.quantity);
    }

    return this.getCart(userId);
  },

  async updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
    const item = await cartRepository.findItemByIdForUser(itemId, userId);

    if (!item) {
      throw new AppError("Cart item not found", 404);
    }

    if (!item.variant.isActive || !item.variant.product.isActive || item.variant.product.deletedAt) {
      throw new AppError("Product variant is no longer available", 409);
    }

    if (input.quantity > item.variant.stock) {
      throw new AppError("Requested quantity exceeds available stock", 409, {
        availableStock: item.variant.stock
      });
    }

    await cartRepository.updateItem(itemId, input.quantity);

    return this.getCart(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const item = await cartRepository.findItemByIdForUser(itemId, userId);

    if (!item) {
      throw new AppError("Cart item not found", 404);
    }

    await cartRepository.removeItem(itemId);

    return this.getCart(userId);
  },

  async clear(userId: string) {
    const cart = await getOrCreateCart(userId);

    await cartRepository.clearCart(cart.id);

    return this.getCart(userId);
  }
};
