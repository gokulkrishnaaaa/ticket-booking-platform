import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../constants/http-status-codes";
import { verifyAccessToken } from "../security/token";

export function authenticate(req: Request, res: Response, next: NextFunction) {
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

    req.user = {
      id: payload.sub,
    };
    next();
  } catch {
    return next(
      new AppError("Invalid or expired token", HTTP_STATUS.UNAUTHORIZED),
    );
  }
}
