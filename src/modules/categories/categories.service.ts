import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/utils/app-error";
import { buildImageUrls } from "@/utils/cloudinary-image";
import { normalizePagination } from "@/utils/pagination";

import { categoriesRepository } from "./categories.repository";
import type { CreateCategoryInput, ListCategoriesQuery, UpdateCategoryInput } from "./categories.validation";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ensureUniqueSlug = async (slug: string, currentCategoryId?: string) => {
  const existingCategory = await categoriesRepository.findBySlug(slug);

  if (existingCategory && existingCategory.id !== currentCategoryId) {
    throw new AppError("A category with this slug already exists", 409);
  }
};

const toCategoryResponse = (category: {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  _count?: { products: number };
}) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  imageUrl: category.imageUrl,
  imagePublicId: category.imagePublicId,
  imageUrls: buildImageUrls(category.imageUrl),
  isActive: category.isActive,
  productsCount: category._count?.products ?? 0,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  deletedAt: category.deletedAt
});

export const categoriesService = {
  async list(query: ListCategoriesQuery = {}) {
    const pagination = normalizePagination(query);
    const where: Prisma.CategoryWhereInput = {
      isActive: true,
      deletedAt: null
    };

    const [total, categories] = await Promise.all([
      categoriesRepository.count(where),
      categoriesRepository.list(where, pagination)
    ]);

    return {
      categories: categories.map(toCategoryResponse),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  },

  async get(idOrSlug: string) {
    const category = UUID_PATTERN.test(idOrSlug)
      ? await categoriesRepository.findActiveById(idOrSlug)
      : await categoriesRepository.findActiveBySlug(idOrSlug);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return toCategoryResponse(category);
  },

  async create(input: CreateCategoryInput) {
    const slug = input.slug ?? slugify(input.name);

    if (!slug) {
      throw new AppError("Category slug could not be generated", 422);
    }

    await ensureUniqueSlug(slug);

    const category = await categoriesRepository.create({
      name: input.name,
      slug,
      imageUrl: input.imageUrl,
      imagePublicId: input.imagePublicId,
      isActive: input.isActive ?? true
    });

    return toCategoryResponse(category);
  },

  async update(id: string, input: UpdateCategoryInput) {
    const category = await categoriesRepository.findById(id);

    if (!category || category.deletedAt) {
      throw new AppError("Category not found", 404);
    }

    const nextSlug = input.slug ?? (input.name ? slugify(input.name) : undefined);

    if (nextSlug) {
      await ensureUniqueSlug(nextSlug, id);
    }

    const updatedCategory = await categoriesRepository.update(id, {
      name: input.name,
      slug: nextSlug,
      imageUrl: input.imageUrl,
      imagePublicId: input.imagePublicId,
      isActive: input.isActive
    });

    return toCategoryResponse(updatedCategory);
  },

  async remove(id: string) {
    const category = await categoriesRepository.findById(id);

    if (!category || category.deletedAt) {
      throw new AppError("Category not found", 404);
    }

    await categoriesRepository.softDelete(id);

    return {
      deleted: true
    };
  }
};
