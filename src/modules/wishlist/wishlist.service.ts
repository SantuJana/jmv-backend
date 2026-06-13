import { wishlistRepository } from "./wishlist.repository";

export const wishlistService = {
  async getWishlist(userId: string) {
    const wishlist = await wishlistRepository.findOrCreateByUserId(userId);
    return wishlist;
  },

  async addItem(userId: string, productId: string) {
    const item = await wishlistRepository.addItem(userId, productId);
    return item;
  },

  async removeItem(userId: string, productId: string) {
    await wishlistRepository.removeItem(userId, productId);
    return true;
  }
};
