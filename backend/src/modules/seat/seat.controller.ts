import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { createSeat as createSeatService } from "./seat.service";
import { SeatParams } from "./seat.validation";

export async function createSeat(req: Request<SeatParams>, res: Response) {
  const seat = await createSeatService(
    req.user!.id,
    req.params.screenId,
    req.body,
  );

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Seat created successfully",
    data: seat,
  });
}
