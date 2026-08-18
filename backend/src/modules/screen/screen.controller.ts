import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { createScreen as createScreenService } from "./screen.service";
import { ScreenParams } from "./screen.validation";

export async function createScreen(req: Request<ScreenParams>, res: Response) {
  const screen = await createScreenService(
    req.user!.id,
    req.params.theaterId,
    req.body,
  );

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Screen created successfully",
    data: screen,
  });
}
