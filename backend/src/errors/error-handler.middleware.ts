import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";
import { HTTP_STATUS } from "../constants/http-status-codes";
import { Prisma } from "../../generated/prisma/client";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError) {
    const response: {
      success: false;
      message: string;
      details?: unknown;
    } = {
      success: false,
      message: error.message,
    };

    if (error.details !== undefined) {
      response.details = error.details;
    }

    return res.status(error.statusCode).json(response);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: "A resource with the provided unique value already exists",
      });
    }
  }

  console.error(error);
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
}
