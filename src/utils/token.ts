import crypto from "node:crypto";

import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { env } from "@/config/env";
import type { UserRole } from "@/generated/prisma/enums";

export type JwtUserPayload = {
  sub: string;
  role: UserRole;
};

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const parseDurationMs = (duration: string) => {
  const match = /^(\d+)([smhd])$/.exec(duration);

  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2] as "s" | "m" | "h" | "d";

  const multiplier = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000
  }[unit];

  return value * multiplier;
};

export const getRefreshTokenExpiry = () =>
  new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN));

export const signAccessToken = (payload: JwtUserPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]
  });

export const signRefreshToken = (payload: JwtUserPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUserPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtUserPayload;
