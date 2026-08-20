import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { createSeatSchema, seatParamsSchema } from "./seat.validation";
import { UserRole } from "../../../generated/prisma/enums";
import { createSeat } from "./seat.controller";

const router = Router();

router.post(
  "/:screenId/seats",
  authenticate,
  authorize(UserRole.THEATER_CHAIN),
  validate({ body: createSeatSchema, params: seatParamsSchema }),
  createSeat,
);

export default router;
