import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/utils/app-error";
import { normalizePagination } from "@/utils/pagination";

import { couponsRepository } from "./coupons.repository";
import type { CreateCouponInput, ListCouponsQuery, UpdateCouponInput, ValidateCouponInput } from "./coupons.validation";

type CouponLike = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: { toString: () => string };
  minOrderAmount: { toString: () => string };
  maxDiscountAmount: { toString: () => string } | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const toMoneyString = (amount: { toString: () => string }) => amount.toString();

export const calculateCouponDiscount = (
  coupon: Pick<CouponLike, "discountType" | "discountValue" | "maxDiscountAmount">,
  subtotal: number
) => {
  const rawDiscount =
    coupon.discountType === "PERCENTAGE"
      ? subtotal * (Number(coupon.discountValue) / 100)
      : Number(coupon.discountValue);
  const maxDiscount = coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null;
  const discount = Math.min(rawDiscount, maxDiscount ?? rawDiscount, subtotal);

  return Number(discount.toFixed(2));
};

export function assertCouponCanApply(coupon: CouponLike | null, subtotal: number): asserts coupon is CouponLike {
  if (!coupon || coupon.deletedAt) {
    throw new AppError("Coupon not found", 404);
  }

  const now = new Date();

  if (!coupon.isActive) {
    throw new AppError("Coupon is not active", 409);
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    throw new AppError("Coupon is not active yet", 409);
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    throw new AppError("Coupon has expired", 409);
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError("Coupon usage limit reached", 409);
  }

  if (subtotal < Number(coupon.minOrderAmount)) {
    throw new AppError(`Coupon requires a minimum order of Rs. ${toMoneyString(coupon.minOrderAmount)}`, 409);
  }
};

const ensureCouponCodeIsUnique = async (code: string, currentCouponId?: string) => {
  const coupon = await couponsRepository.findByCode(code);

  if (coupon && coupon.id !== currentCouponId) {
    throw new AppError("A coupon with this code already exists", 409);
  }
};

const ensureValidCoupon = (input: {
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: string;
  startsAt?: Date;
  endsAt?: Date;
}) => {
  if (input.discountType === "PERCENTAGE" && input.discountValue && Number(input.discountValue) > 100) {
    throw new AppError("Percentage discount cannot exceed 100", 422);
  }

  if (input.startsAt && input.endsAt && input.startsAt > input.endsAt) {
    throw new AppError("Coupon start date must be before end date", 422);
  }
};

const toCouponResponse = (coupon: CouponLike) => ({
  id: coupon.id,
  code: coupon.code,
  title: coupon.title,
  description: coupon.description,
  discountType: coupon.discountType,
  discountValue: toMoneyString(coupon.discountValue),
  minOrderAmount: toMoneyString(coupon.minOrderAmount),
  maxDiscountAmount: coupon.maxDiscountAmount ? toMoneyString(coupon.maxDiscountAmount) : null,
  usageLimit: coupon.usageLimit,
  usageCount: coupon.usageCount,
  isActive: coupon.isActive,
  startsAt: coupon.startsAt,
  endsAt: coupon.endsAt,
  createdAt: coupon.createdAt,
  updatedAt: coupon.updatedAt,
  deletedAt: coupon.deletedAt
});

const toCouponData = (input: CreateCouponInput | UpdateCouponInput) => ({
  code: input.code,
  title: input.title,
  description: input.description,
  discountType: input.discountType,
  discountValue: input.discountValue,
  minOrderAmount: input.minOrderAmount,
  maxDiscountAmount: input.maxDiscountAmount,
  usageLimit: input.usageLimit,
  isActive: input.isActive,
  startsAt: input.startsAt,
  endsAt: input.endsAt
});

export const couponsService = {
  async listForAdmin(query: ListCouponsQuery = {}) {
    const pagination = normalizePagination(query);
    const where: Prisma.CouponWhereInput = {
      deletedAt: null
    };

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: "insensitive" } },
        { title: { contains: query.search, mode: "insensitive" } }
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [total, coupons] = await Promise.all([
      couponsRepository.count(where),
      couponsRepository.list(where, pagination)
    ]);

    return {
      coupons: coupons.map(toCouponResponse),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  },

  async validate(input: ValidateCouponInput) {
    const coupon = await couponsRepository.findByCode(input.code);
    const subtotal = Number(input.subtotal);

    assertCouponCanApply(coupon, subtotal);

    return {
      coupon: toCouponResponse(coupon),
      discountAmount: calculateCouponDiscount(coupon, subtotal).toFixed(2)
    };
  },

  async create(input: CreateCouponInput) {
    ensureValidCoupon(input);
    await ensureCouponCodeIsUnique(input.code);

    const coupon = await couponsRepository.create({
      code: input.code,
      title: input.title,
      description: input.description,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderAmount: input.minOrderAmount ?? "0",
      maxDiscountAmount: input.maxDiscountAmount,
      usageLimit: input.usageLimit,
      isActive: input.isActive ?? true,
      startsAt: input.startsAt,
      endsAt: input.endsAt
    });

    return toCouponResponse(coupon);
  },

  async update(couponId: string, input: UpdateCouponInput) {
    const coupon = await couponsRepository.findById(couponId);

    if (!coupon || coupon.deletedAt) {
      throw new AppError("Coupon not found", 404);
    }

    ensureValidCoupon({
      discountType: input.discountType ?? coupon.discountType,
      discountValue: input.discountValue ?? toMoneyString(coupon.discountValue),
      startsAt: input.startsAt ?? coupon.startsAt ?? undefined,
      endsAt: input.endsAt ?? coupon.endsAt ?? undefined
    });

    if (input.code) {
      await ensureCouponCodeIsUnique(input.code, couponId);
    }

    const updatedCoupon = await couponsRepository.update(couponId, toCouponData(input));

    return toCouponResponse(updatedCoupon);
  },

  async remove(couponId: string) {
    const coupon = await couponsRepository.findById(couponId);

    if (!coupon || coupon.deletedAt) {
      throw new AppError("Coupon not found", 404);
    }

    await couponsRepository.softDelete(couponId);

    return {
      deleted: true
    };
  }
};
