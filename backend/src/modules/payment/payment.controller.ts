import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import {
  InitiatePaymentParams,
  InitiatePaymentInput,
} from "./payment.validation";
import { initiatePayment as initiatePaymentService } from "./payment.service";

export async function initiatePayment(
  req: Request<InitiatePaymentParams>,
  res: Response,
) {
  const result = await initiatePaymentService(
    req.user!.id,
    req.params.bookingId,
    req.body.paymentMethod,
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
}
