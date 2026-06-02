import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/utils/app-error";
import { buildImageUrls } from "@/utils/cloudinary-image";
import { normalizePagination } from "@/utils/pagination";

import { bannersRepository } from "./banners.repository";
import type { CreateBannerInput, ListBannersQuery, UpdateBannerInput } from "./banners.validation";

const ensureValidSchedule = (input: { startsAt?: Date | null; endsAt?: Date | null }) => {
  if (input.startsAt && input.endsAt && input.startsAt > input.endsAt) {
    throw new AppError("Banner start date must be before end date", 422);
  }
};

const toBannerResponse = (banner: {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}) => ({
  id: banner.id,
  title: banner.title,
  subtitle: banner.subtitle,
  imageUrl: banner.imageUrl,
  imagePublicId: banner.imagePublicId,
  imageUrls: buildImageUrls(banner.imageUrl),
  ctaLabel: banner.ctaLabel,
  ctaUrl: banner.ctaUrl,
  sortOrder: banner.sortOrder,
  isActive: banner.isActive,
  startsAt: banner.startsAt,
  endsAt: banner.endsAt,
  createdAt: banner.createdAt,
  updatedAt: banner.updatedAt,
  deletedAt: banner.deletedAt
});

const toBannerData = (input: CreateBannerInput | UpdateBannerInput) => ({
  title: input.title,
  subtitle: input.subtitle,
  imageUrl: input.imageUrl,
  imagePublicId: input.imagePublicId,
  ctaLabel: input.ctaLabel,
  ctaUrl: input.ctaUrl,
  sortOrder: input.sortOrder,
  isActive: input.isActive,
  startsAt: input.startsAt,
  endsAt: input.endsAt
});

export const bannersService = {
  async list(query: ListBannersQuery = {}) {
    const pagination = normalizePagination(query);
    const now = new Date();
    const where: Prisma.BannerWhereInput = {
      isActive: true,
      deletedAt: null,
      AND: [
        {
          OR: [{ startsAt: null }, { startsAt: { lte: now } }]
        },
        {
          OR: [{ endsAt: null }, { endsAt: { gte: now } }]
        }
      ]
    };

    const [total, banners] = await Promise.all([
      bannersRepository.count(where),
      bannersRepository.list(where, pagination)
    ]);

    return {
      banners: banners.map(toBannerResponse),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  },

  async listForAdmin(query: ListBannersQuery = {}) {
    const pagination = normalizePagination(query);
    const where: Prisma.BannerWhereInput = {
      deletedAt: null
    };

    const [total, banners] = await Promise.all([
      bannersRepository.count(where),
      bannersRepository.list(where, pagination)
    ]);

    return {
      banners: banners.map(toBannerResponse),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  },

  async create(input: CreateBannerInput) {
    ensureValidSchedule(input);

    const banner = await bannersRepository.create({
      title: input.title,
      subtitle: input.subtitle,
      imageUrl: input.imageUrl,
      imagePublicId: input.imagePublicId,
      ctaLabel: input.ctaLabel,
      ctaUrl: input.ctaUrl,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      startsAt: input.startsAt,
      endsAt: input.endsAt
    });

    return toBannerResponse(banner);
  },

  async update(id: string, input: UpdateBannerInput) {
    const banner = await bannersRepository.findById(id);

    if (!banner || banner.deletedAt) {
      throw new AppError("Banner not found", 404);
    }

    ensureValidSchedule({
      startsAt: input.startsAt === undefined ? banner.startsAt : input.startsAt,
      endsAt: input.endsAt === undefined ? banner.endsAt : input.endsAt
    });

    const updatedBanner = await bannersRepository.update(id, toBannerData(input));

    return toBannerResponse(updatedBanner);
  },

  async remove(id: string) {
    const banner = await bannersRepository.findById(id);

    if (!banner || banner.deletedAt) {
      throw new AppError("Banner not found", 404);
    }

    await bannersRepository.softDelete(id);

    return {
      deleted: true
    };
  }
};
