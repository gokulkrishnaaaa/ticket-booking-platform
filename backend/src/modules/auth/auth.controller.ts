import { Request, Response } from "express";
import {
  register as registerUser,
  login as loginUser,
  logout as logoutUser,
  refreshAccessToken,
} from "./auth.service";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { env } from "../../config/env";
import { AppError } from "../../errors/AppError";
import { success } from "zod";

export async function register(req: Request, res: Response) {
  const user = await registerUser(req.body);

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: user,
  });
}

export async function login(req: Request, res: Response) {
  const { accessToken, refreshToken } = await loginUser(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
  });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      accessToken,
    },
  });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError("Refresh token required", HTTP_STATUS.UNAUTHORIZED);
  }

  const result = await refreshAccessToken(refreshToken);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
  });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      accessToken: result.accessToken,
    },
  });
}

export async function getMe(req: Request, res: Response) {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      userId: req.user?.id,
    },
  });
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
  });

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logged out successfully",
  });
}
