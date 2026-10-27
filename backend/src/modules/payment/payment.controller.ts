import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { InitiatePaymentParams } from "./payment.validation";
import {
  initiatePayment as initiatePaymentService,
  verifyPayment as verifyPaymentService,
} from "./payment.service";

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

export async function verifyPayment(
  req: Request<InitiatePaymentParams>,
  res: Response,
) {
  const result = await verifyPaymentService(
    req.user!.id,
    req.params.bookingId,
    req.body,
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
}
