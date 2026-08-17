import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { UserRole } from "../../../generated/prisma/enums";
import { createTheaterSchema } from "./theater.validation";
import { createTheater } from "./theater.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.THEATER_CHAIN),
  validate({
    body: createTheaterSchema,
  }),
  createTheater,
);

export default router;
