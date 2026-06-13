import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/utils/app-error";
import { deleteReplacedImage } from "@/utils/image-cleanup";
import { buildImageUrls, buildObjectStorageImageUrl } from "@/utils/object-storage-image";
import { normalizePagination } from "@/utils/pagination";

import { productsRepository } from "./products.repository";
import type {
  CreateProductInput,
  CreateVariantInput,
  ListProductsQuery,
  UpdateProductInput,
  UpdateVariantInput
} from "./products.validation";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const ensureProductSlugIsUnique = async (slug: string, currentProductId?: string) => {
  const product = await productsRepository.findBySlug(slug);

  if (product && product.id !== currentProductId) {
    throw new AppError("A product with this slug already exists", 409);
  }
};

const ensureSkuIsUnique = async (sku: string, currentVariantId?: string) => {
  const variant = await productsRepository.findVariantBySku(sku);

  if (variant && variant.id !== currentVariantId) {
    throw new AppError(`A variant with SKU ${sku} already exists`, 409);
  }
};

const getVariantOfferPrice = (variant: { price?: string; offerPrice?: string }) => variant.offerPrice ?? variant.price;

const getVariantMrp = (variant: { mrp?: string; price?: string; offerPrice?: string }) =>
  variant.mrp ?? variant.offerPrice ?? variant.price;

const ensureOfferPriceDoesNotExceedMrp = (mrp: string, offerPrice: string) => {
  if (Number(offerPrice) > Number(mrp)) {
    throw new AppError("Offer price cannot be greater than MRP", 422);
  }
};

const ensureCategoryExists = async (categoryId: string) => {
  const category = await productsRepository.findCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }
};

const toVariantResponse = (variant: {
  id: string;
  name: string;
  mrp: { toString: () => string };
  price: { toString: () => string };
  stock: number;
  sku: string;
  unit: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: variant.id,
  name: variant.name,
  mrp: variant.mrp.toString(),
  price: variant.price.toString(),
  offerPrice: variant.price.toString(),
  stock: variant.stock,
  sku: variant.sku,
  unit: variant.unit,
  isActive: variant.isActive,
  createdAt: variant.createdAt,
  updatedAt: variant.updatedAt
});

const toProductResponse = (
  product: {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  category: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  variants: Array<Parameters<typeof toVariantResponse>[0]>;
  },
  options: { includeInactiveVariants?: boolean } = {}
) => ({
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    imageUrl: buildObjectStorageImageUrl(product.imageUrl, product.imagePublicId),
    imagePublicId: product.imagePublicId,
    imageUrls: buildImageUrls(product.imageUrl, product.imagePublicId),
    isActive: product.isActive,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
      isActive: product.category.isActive
    },
    variants: product.variants
      .filter((variant) => options.includeInactiveVariants || variant.isActive)
      .map(toVariantResponse),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    deletedAt: product.deletedAt
  });

const buildPublicProductWhere = (query: ListProductsQuery = {}) => {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,
    category: {
      isActive: true,
      deletedAt: null
    }
  };

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.categorySlug) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      {
        category: {
          slug: query.categorySlug
        }
      }
    ];
  }

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive"
        }
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive"
        }
      }
    ];
  }

  return where;
};

export const productsService = {
  async list(query: ListProductsQuery = {}) {
    const pagination = normalizePagination(query);
    const where = buildPublicProductWhere(query);
    const [total, products] = await Promise.all([
      productsRepository.count(where),
      productsRepository.list(where, pagination)
    ]);

    return {
      products: products.map((product) => toProductResponse(product)),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  },

  async listForAdmin(query: ListProductsQuery = {}) {
    const pagination = normalizePagination(query);
    const where: Prisma.ProductWhereInput = {
      deletedAt: null
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.categorySlug) {
      where.category = {
        slug: query.categorySlug
      };
    }

    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: query.search,
            mode: "insensitive"
          }
        }
      ];
    }

    const [total, products] = await Promise.all([
      productsRepository.count(where),
      productsRepository.list(where, pagination)
    ]);

    return {
      products: products.map((product) => toProductResponse(product, { includeInactiveVariants: true })),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  },

  async get(idOrSlug: string) {
    const lookup: Prisma.ProductWhereInput = UUID_PATTERN.test(idOrSlug)
      ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
      : { slug: idOrSlug };
    const product = await productsRepository.findFirst({
      ...lookup,
      isActive: true,
      deletedAt: null,
      category: {
        isActive: true,
        deletedAt: null
      }
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return toProductResponse(product);
  },

  async create(input: CreateProductInput) {
    await ensureCategoryExists(input.categoryId);

    const slug = input.slug ?? slugify(input.name);

    if (!slug) {
      throw new AppError("Product slug could not be generated", 422);
    }

    await ensureProductSlugIsUnique(slug);

    for (const variant of input.variants ?? []) {
      await ensureSkuIsUnique(variant.sku);
      ensureOfferPriceDoesNotExceedMrp(getVariantMrp(variant)!, getVariantOfferPrice(variant)!);
    }

    const product = await productsRepository.create({
      category: {
        connect: {
          id: input.categoryId
        }
      },
      name: input.name,
      slug,
      description: input.description,
      imageUrl: input.imageUrl,
      imagePublicId: input.imagePublicId,
      isActive: input.isActive ?? true,
      variants: input.variants
        ? {
            create: input.variants.map((variant) => ({
              name: variant.name,
              mrp: getVariantMrp(variant)!,
              price: getVariantOfferPrice(variant)!,
              stock: variant.stock ?? 0,
              sku: variant.sku,
              unit: variant.unit,
              isActive: variant.isActive ?? true
            }))
          }
        : undefined
    });

    return toProductResponse(product);
  },

  async update(id: string, input: UpdateProductInput) {
    const product = await productsRepository.findById(id);

    if (!product || product.deletedAt) {
      throw new AppError("Product not found", 404);
    }

    if (input.categoryId) {
      await ensureCategoryExists(input.categoryId);
    }

    const nextSlug = input.slug ?? (input.name ? slugify(input.name) : undefined);

    if (nextSlug) {
      await ensureProductSlugIsUnique(nextSlug, id);
    }

    const updatedProduct = await productsRepository.update(id, {
      category: input.categoryId
        ? {
            connect: {
              id: input.categoryId
            }
          }
        : undefined,
      name: input.name,
      slug: nextSlug,
      description: input.description,
      imageUrl: input.imageUrl,
      imagePublicId: input.imagePublicId,
      isActive: input.isActive
    });

    if (Object.prototype.hasOwnProperty.call(input, "imagePublicId")) {
      await deleteReplacedImage({
        previousPublicId: product.imagePublicId,
        nextPublicId: input.imagePublicId
      });
    }

    return toProductResponse(updatedProduct);
  },

  async remove(id: string) {
    const product = await productsRepository.findById(id);

    if (!product || product.deletedAt) {
      throw new AppError("Product not found", 404);
    }

    await productsRepository.softDelete(id);

    return {
      deleted: true
    };
  },

  async createVariant(productId: string, input: CreateVariantInput) {
    const product = await productsRepository.findById(productId);

    if (!product || product.deletedAt) {
      throw new AppError("Product not found", 404);
    }

    await ensureSkuIsUnique(input.sku);

    ensureOfferPriceDoesNotExceedMrp(getVariantMrp(input)!, getVariantOfferPrice(input)!);

    const variant = await productsRepository.createVariant({
      product: {
        connect: {
          id: productId
        }
      },
      name: input.name,
      mrp: getVariantMrp(input)!,
      price: getVariantOfferPrice(input)!,
      stock: input.stock ?? 0,
      sku: input.sku,
      unit: input.unit,
      isActive: input.isActive ?? true
    });

    return toVariantResponse(variant);
  },

  async updateVariant(variantId: string, input: UpdateVariantInput) {
    const variant = await productsRepository.findVariantById(variantId);

    if (!variant || variant.product.deletedAt) {
      throw new AppError("Variant not found", 404);
    }

    if (input.sku) {
      await ensureSkuIsUnique(input.sku, variantId);
    }

    const nextMrp = input.mrp ?? variant.mrp.toString();
    const nextOfferPrice = getVariantOfferPrice(input) ?? variant.price.toString();
    ensureOfferPriceDoesNotExceedMrp(nextMrp, nextOfferPrice);

    const updatedVariant = await productsRepository.updateVariant(variantId, {
      name: input.name,
      mrp: input.mrp,
      price: getVariantOfferPrice(input),
      stock: input.stock,
      sku: input.sku,
      unit: input.unit,
      isActive: input.isActive
    });

    return toVariantResponse(updatedVariant);
  },

  async removeVariant(variantId: string) {
    const variant = await productsRepository.findVariantById(variantId);

    if (!variant || variant.product.deletedAt) {
      throw new AppError("Variant not found", 404);
    }

    await productsRepository.deactivateVariant(variantId);

    return {
      deleted: true
    };
  }
};
