import { Request, Response } from "express";
import { register as registerUser, login as loginUser } from "./auth.service";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { env } from "../../config/env";

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
    secure : env.nodeEnv === "production",
    sameSite : "lax"
  })

  return res.status(HTTP_STATUS.OK).json({
    success :  true,
    data : {
        accessToken,
    }
  })
}
