import { AddressType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/utils/app-error";
import { normalizePagination } from "@/utils/pagination";

import { usersRepository } from "./users.repository";
import { authRepository } from "../auth/auth.repository";
import type {
  CreateAddressInput,
  ListUsersQuery,
  UpdateAddressInput,
  UpdateUserStatusInput,
  UpdateProfileInput
} from "./users.validation";

const toAddressResponse = (address: {
  id: string;
  userId: string;
  type: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: address.id,
  userId: address.userId,
  type: address.type,
  fullName: address.fullName,
  phone: address.phone,
  line1: address.line1,
  line2: address.line2,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
  isDefault: address.isDefault,
  createdAt: address.createdAt,
  updatedAt: address.updatedAt
});

const toManagedUserResponse = (user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    orders: number;
    addresses: number;
  };
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
  ordersCount: user._count.orders,
  addressesCount: user._count.addresses,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const toOrderSummaryResponse = (order: {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: { toString: () => string };
  createdAt: Date;
  items: Array<unknown>;
}) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  paymentStatus: order.paymentStatus,
  total: order.total.toString(),
  itemsCount: order.items.length,
  createdAt: order.createdAt
});

const toManagedUserDetailsResponse = (user: NonNullable<Awaited<ReturnType<typeof usersRepository.findUserDetails>>>) => ({
  ...toManagedUserResponse(user),
  addresses: user.addresses.map(toAddressResponse),
  recentOrders: user.orders.map(toOrderSummaryResponse)
});

const buildUsersWhere = (query: ListUsersQuery = {}) => {
  const where: Prisma.UserWhereInput = {
    deletedAt: null
  };

  if (query.role) {
    where.role = query.role;
  }

  if (query.status) {
    where.status = query.status;
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
        email: {
          contains: query.search,
          mode: "insensitive"
        }
      },
      {
        phone: {
          contains: query.search,
          mode: "insensitive"
        }
      }
    ];
  }

  return where;
};

export const usersService = {
  async listUsers(query: ListUsersQuery = {}) {
    const pagination = normalizePagination(query);
    const where = buildUsersWhere(query);
    const [total, users] = await Promise.all([
      usersRepository.countUsers(where),
      usersRepository.listUsers(where, pagination)
    ]);

    return {
      users: users.map(toManagedUserResponse),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await usersRepository.findUserById(userId);

    if (!user || user.deletedAt) {
      throw new AppError("User not found", 404);
    }

    if (input.email && input.email !== user.email) {
      const existingUser = await authRepository.findUserByEmail(input.email);
      if (existingUser) {
        throw new AppError("An account with this email already exists", 409);
      }
    }

    if (input.phone && input.phone !== user.phone) {
      const existingPhone = await authRepository.findUserByPhone(input.phone);
      if (existingPhone) {
        throw new AppError("An account with this phone number already exists", 409);
      }
    }

    const updatedUser = await usersRepository.updateUserById(userId, {
      name: input.name,
      email: input.email,
      phone: input.phone
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt
    };
  },

  async updateUserStatus(userId: string, input: UpdateUserStatusInput, currentUserId: string) {
    if (userId === currentUserId && input.status === "BLOCKED") {
      throw new AppError("You cannot block your own account", 409);
    }

    const user = await usersRepository.findUserById(userId);

    if (!user || user.deletedAt) {
      throw new AppError("User not found", 404);
    }

    const updatedUser = await usersRepository.updateUserStatus(userId, input.status);

    return toManagedUserResponse(updatedUser);
  },

  async getUserDetails(userId: string) {
    const user = await usersRepository.findUserDetails(userId);

    if (!user || user.deletedAt) {
      throw new AppError("User not found", 404);
    }

    return toManagedUserDetailsResponse(user);
  },

  async listAddresses(userId: string) {
    const addresses = await usersRepository.listAddresses(userId);

    return addresses.map(toAddressResponse);
  },

  async createAddress(userId: string, input: CreateAddressInput) {
    const addressCount = await usersRepository.countAddresses(userId);
    const address = await usersRepository.createAddress(userId, {
      type: input.type ?? AddressType.HOME,
      fullName: input.fullName,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country ?? "India",
      isDefault: input.isDefault ?? addressCount === 0
    });

    return toAddressResponse(address);
  },

  async updateAddress(userId: string, addressId: string, input: UpdateAddressInput) {
    const address = await usersRepository.findAddressByIdForUser(addressId, userId);

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    const updatedAddress = await usersRepository.updateAddress(addressId, userId, {
      type: input.type,
      fullName: input.fullName,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      isDefault: input.isDefault
    });

    return toAddressResponse(updatedAddress);
  },

  async deleteAddress(userId: string, addressId: string) {
    const address = await usersRepository.findAddressByIdForUser(addressId, userId);

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    await usersRepository.deleteAddress(addressId, userId);

    return {
      deleted: true
    };
  }
};
