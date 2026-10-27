import { Router } from "express";
import { initiatePayment, verifyPayment } from "./payment.controller";
import { validate } from "../../middleware/validate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import {
  initiatePaymentSchema,
  initiatePaymentParamsSchema,
  verifyPaymentSchema,
} from "./payment.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/bookings/:bookingId/payments",
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate({
    params: initiatePaymentParamsSchema,
    body: initiatePaymentSchema,
  }),
  initiatePayment,
);
router.post(
  "/bookings/:bookingId/payments/verify",
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate({
    params: initiatePaymentParamsSchema,
    body: verifyPaymentSchema,
  }),
  verifyPayment,
);

export default router;
