import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type AccessTokenPayload = {
  sub: string;
};

export type RefreshTokenPayload = {
  sub: string;
};

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

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
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

  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Invalid refresh token payload");
  }
  return {
    sub: payload.sub,
  };
}
