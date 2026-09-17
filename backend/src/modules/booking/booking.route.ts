import { Router } from "express";
import { reserveSeats } from "./booking.controller";
import { validate } from "../../middleware/validate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import {
  reserveSeatsSchema,
  reserveSeatsParamsSchema,
} from "./booking.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/shows/:showId/reservations",
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate({ params: reserveSeatsParamsSchema, body: reserveSeatsSchema }),
  reserveSeats,
);

export default router;
