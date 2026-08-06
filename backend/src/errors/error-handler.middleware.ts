import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";
import { HTTP_STATUS } from "../constants/http-status-codes";

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

  console.error(error);
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
}
