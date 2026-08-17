import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../constants/http-status-codes";
import { UserRole } from "../../generated/prisma/enums";

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED),
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    next();
  };
}
