import { Request, Response } from "express";
import { reserveSeats as reserveSeatsService } from "./booking.service";
import { ReserveSeatsParams } from "./booking.validation";
import { HTTP_STATUS } from "../../constants/http-status-codes";

export async function reserveSeats(
  req: Request<ReserveSeatsParams>,
  res: Response,
) {
  const booking = await reserveSeatsService(
    req.user!.id,
    req.params.showId,
    req.body.showSeatIds,
  );

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: booking,
  });
}
