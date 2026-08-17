import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../constants/http-status-codes";
import { verifyAccessToken } from "../security/token";
import prisma from "../lib/prisma";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(
      new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED),
    );
  }

  const [schema, token] = authHeader.split(" ");

  if (schema !== "Bearer" || !token) {
    return next(
      new AppError("Invalid authentication token", HTTP_STATUS.UNAUTHORIZED),
    );
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return next(
        new AppError("Invalid or expired token", HTTP_STATUS.UNAUTHORIZED),
      );
    }

    req.user = {
      id: user.id,
      role: user.role,
    };
    next();
  } catch {
    return next(
      new AppError("Invalid or expired token", HTTP_STATUS.UNAUTHORIZED),
    );
  }
}
