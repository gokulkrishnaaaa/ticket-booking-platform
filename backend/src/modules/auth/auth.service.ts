import prisma from "../../lib/prisma";
import { LoginInput, RegisterInput } from "./auth.validation";
import { AppError } from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { hashPassword, comparePassword } from "../../security/password";
import {
  generateAccessToken,
  generateRefreshToken,
  RefreshTokenPayload,
  verifyRefreshToken,
} from "../../security/token";

const dummyHash =
  "$2a$12$1Mie/9EeBP1r9Na5d0/1tOeInu1Q/KsV2rbxWEMyu/E/Ij.Qz0/Hq";

export async function register(data: RegisterInput) {
  const normalizedEmail = data.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new AppError("User already exists", HTTP_STATUS.CONFLICT);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: normalizedEmail,
      passwordHash: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
}

export async function login(data: LoginInput) {
  const normalizedEmail = data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  const passwordHash = user?.passwordHash ?? dummyHash;

  const isPasswordValid = await comparePassword(data.password, passwordHash);

  if (!user || !isPasswordValid) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: RefreshTokenPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(
      "Invalid or expired refresh token",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  const accessToken = generateAccessToken(payload.sub);

  return {
    accessToken,
  };
}
