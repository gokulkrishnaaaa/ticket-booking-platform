import jwt from "jsonwebtoken";
import { env } from "../config/env";

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
