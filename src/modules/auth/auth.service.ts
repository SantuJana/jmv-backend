import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import { UserStatus } from "@/generated/prisma/enums";
import type { UserRole } from "@/generated/prisma/enums";
import { AppError } from "@/utils/app-error";
import {
  getRefreshTokenExpiry,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "@/utils/token";

import { authRepository } from "./auth.repository";
import type { LoginInput, RefreshInput, RegisterInput } from "./auth.validation";

const { JsonWebTokenError, TokenExpiredError } = jsonwebtoken;

const PASSWORD_SALT_ROUNDS = 12;

const toAuthUser = (user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: Date;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt
});

const issueTokenPair = async (user: { id: string; role: UserRole }) => {
  const payload = {
    sub: user.id,
    role: user.role
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const refreshTokenHash = hashToken(refreshToken);

  await authRepository.replaceRefreshTokensForUser({
    userId: user.id,
    tokenHash: refreshTokenHash,
    expiresAt: getRefreshTokenExpiry()
  });

  return {
    accessToken,
    refreshToken
  };
};

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new AppError("An account with this email already exists", 409);
    }

    if (input.phone) {
      const existingPhone = await authRepository.findUserByPhone(input.phone);

      if (existingPhone) {
        throw new AppError("An account with this phone number already exists", 409);
      }
    }

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash
    });
    const tokens = await issueTokenPair(user);

    return {
      user: toAuthUser(user),
      tokens
    };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError("Your account is not active", 403);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokens = await issueTokenPair(user);

    return {
      user: toAuthUser(user),
      tokens
    };
  },

  async refresh(input: RefreshInput) {
    let payload: ReturnType<typeof verifyRefreshToken>;

    try {
      payload = verifyRefreshToken(input.refreshToken);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AppError("Refresh token has expired", 401);
      }

      if (error instanceof JsonWebTokenError) {
        throw new AppError("Invalid refresh token", 401);
      }

      throw error;
    }

    const oldTokenHash = hashToken(input.refreshToken);
    const storedToken = await authRepository.findRefreshToken(oldTokenHash);

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
      throw new AppError("Refresh token is no longer valid", 401);
    }

    if (storedToken.user.status !== UserStatus.ACTIVE) {
      throw new AppError("Your account is not active", 403);
    }

    if (storedToken.userId !== payload.sub) {
      throw new AppError("Invalid refresh token", 401);
    }

    const newAccessToken = signAccessToken({
      sub: storedToken.user.id,
      role: storedToken.user.role
    });
    const newRefreshToken = signRefreshToken({
      sub: storedToken.user.id,
      role: storedToken.user.role
    });
    const newRefreshTokenHash = hashToken(newRefreshToken);

    await authRepository.replaceRefreshTokensForUser({
      userId: storedToken.user.id,
      tokenHash: newRefreshTokenHash,
      expiresAt: getRefreshTokenExpiry()
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  },

  async logout(input: RefreshInput) {
    await authRepository.revokeRefreshToken(hashToken(input.refreshToken));

    return {
      loggedOut: true
    };
  }
};
