import { Router } from "express";
import { initiatePayment } from "./payment.controller";
import { validate } from "../../middleware/validate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import {
  initiatePaymentSchema,
  initiatePaymentParamsSchema,
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

export default router;
