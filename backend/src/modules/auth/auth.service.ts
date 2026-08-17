import prisma from "../../lib/prisma";
import { LoginInput, RegisterInput } from "./auth.validation";
import { AppError } from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { hashPassword, comparePassword } from "../../security/password";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  RefreshTokenPayload,
  verifyRefreshToken,
} from "../../security/token";
import { durationToMilliseconds } from "../../utils/duration";
import { env } from "../../config/env";

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
  const sessionId = crypto.randomUUID();

  const refreshToken = generateRefreshToken(user.id, sessionId);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + durationToMilliseconds(env.jwtRefreshExpiresIn),
  );

  await prisma.refreshSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

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

  const session = await prisma.refreshSession.findUnique({
    where: {
      id: payload.jti,
    },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    throw new AppError(
      "Invalid or expired refresh token",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  const tokenHash = hashToken(refreshToken);

  if (tokenHash !== session.tokenHash) {
    throw new AppError(
      "Invalid or expired refresh token",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  const newSessionId = crypto.randomUUID();
  const newRefreshToken = generateRefreshToken(payload.sub, newSessionId);

  const newTokenHash = hashToken(newRefreshToken);
  const newExpiresAt = new Date(
    Date.now() + durationToMilliseconds(env.jwtRefreshExpiresIn),
  );

  await prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshSession.updateMany({
      where: {
        id: session.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (revoked.count !== 1) {
      throw new AppError(
        "Invalid or expired refresh token",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    await tx.refreshSession.create({
      data: {
        id: newSessionId,
        userId: payload.sub,
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
      },
    });
  });

  const accessToken = generateAccessToken(payload.sub);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(refreshToken: string) {
  let payload: RefreshTokenPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return;
  }

  await prisma.refreshSession.updateMany({
    where: {
      id: payload.jti,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function logoutAll(userId: string) {
  await prisma.refreshSession.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}
