import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";
import { AppError } from "../errors/AppError";
import { HTTP_STATUS } from "../constants/http-status-codes";

type ValidationSchema = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

function validatePart<T extends ZodTypeAny>(schema: T, data: unknown) {
  return schema.safeParse(data);
}

export function validate(schemas: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = validatePart(schemas.body, req.body);

      if (!result.success) {
        throw new AppError(
          "Validation failed",
          HTTP_STATUS.BAD_REQUEST,
          result.error.flatten(),
        );
      }

      req.body = result.data;
    }

    if (schemas.params) {
      const result = validatePart(schemas.params, req.params);

      if (!result.success) {
        throw new AppError(
          "Validation failed",
          HTTP_STATUS.BAD_REQUEST,
          result.error.flatten(),
        );
      }
    }

    if (schemas.query) {
      const result = validatePart(schemas.query, req.query);

      if (!result.success) {
        throw new AppError(
          "Validation failed",
          HTTP_STATUS.BAD_REQUEST,
          result.error.flatten(),
        );
      }
    }

    next();
  };
}
