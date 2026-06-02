import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma";

export const usersRepository = {
  countUsers(where: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  },

  listUsers(where: Prisma.UserWhereInput, pagination: { skip: number; take: number }) {
    return prisma.user.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [{ createdAt: "desc" }],
      include: {
        _count: {
          select: {
            orders: true,
            addresses: true
          }
        }
      }
    });
  },

  findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId }
    });
  },

  findUserDetails(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
        },
        orders: {
          orderBy: [{ createdAt: "desc" }],
          take: 10,
          include: {
            items: true
          }
        },
        _count: {
          select: {
            orders: true,
            addresses: true
          }
        }
      }
    });
  },

  updateUserStatus(userId: string, status: Prisma.UserUpdateInput["status"]) {
    return prisma.user.update({
      where: { id: userId },
      data: { status },
      include: {
        _count: {
          select: {
            orders: true,
            addresses: true
          }
        }
      }
    });
  },

  listAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });
  },

  findAddressByIdForUser(addressId: string, userId: string) {
    return prisma.address.findFirst({
      where: {
        id: addressId,
        userId
      }
    });
  },

  countAddresses(userId: string) {
    return prisma.address.count({
      where: { userId }
    });
  },

  createAddress(userId: string, data: Omit<Prisma.AddressUncheckedCreateInput, "userId">) {
    return prisma.$transaction(async (tx: any) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false }
        });
      }

      return tx.address.create({
        data: {
          ...data,
          userId
        }
      });
    });
  },

  updateAddress(addressId: string, userId: string, data: Prisma.AddressUpdateInput) {
    return prisma.$transaction(async (tx: any) => {
      if (data.isDefault === true) {
        await tx.address.updateMany({
          where: {
            userId,
            id: {
              not: addressId
            }
          },
          data: { isDefault: false }
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data
      });
    });
  },

  deleteAddress(addressId: string, userId: string) {
    return prisma.$transaction(async (tx: any) => {
      const deletedAddress = await tx.address.delete({
        where: { id: addressId }
      });

      if (deletedAddress.isDefault) {
        const nextDefaultAddress = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" }
        });

        if (nextDefaultAddress) {
          await tx.address.update({
            where: { id: nextDefaultAddress.id },
            data: { isDefault: true }
          });
        }
      }

      return deletedAddress;
    });
  }
};
