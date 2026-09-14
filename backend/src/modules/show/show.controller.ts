import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { createShow as createShowService } from "./show.service";
import { ShowParams } from "./show.validation";

export async function createShow(req: Request<ShowParams>, res: Response) {
  const show = await createShowService(
    req.user!.id,
    req.params.screenId,
    req.body,
  );

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Show created successfully",
    data: show,
  });
}
