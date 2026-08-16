import jwt from "jsonwebtoken";
import { env } from "../config/env";
import crypto from "node:crypto";

export type AccessTokenPayload = {
  sub: string;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

const sessionId = crypto.randomUUID();

export function generateAccessToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
    },
    env.jwtAccessSecret,
    {
      expiresIn: env.jwtAccessExpiresIn,
    },
  );
}

export function generateRefreshToken(
  userId: string,
  sessionId: string,
): string {
  return jwt.sign(
    {
      sub: userId,
      jti: sessionId,
    },
    env.jwtRefreshSecret,
    {
      expiresIn: env.jwtRefreshExpiresIn,
    },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.jwtAccessSecret);

  //we expect an object(payload) not a string and is sub wrong type
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Invalid access token payload");
  }

  return {
    sub: payload.sub,
  };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.jwtRefreshSecret);

  if (
    typeof payload === "string" ||
    typeof payload.sub !== "string" ||
    typeof payload.jti !== "string"
  ) {
    throw new Error("Invalid refresh token payload");
  }
  return {
    sub: payload.sub,
    jti: payload.jti,
  };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
