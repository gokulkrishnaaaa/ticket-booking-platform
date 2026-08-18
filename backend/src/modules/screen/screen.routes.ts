import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { validate } from "../../middleware/validate.middleware";
import { UserRole } from "../../../generated/prisma/enums";
import { createScreenSchema, screenParamsSchema } from "./screen.validation";
import { createScreen } from "./screen.controller";

const router = Router();

router.post(
  "/:theaterId/screens",
  authenticate,
  authorize(UserRole.THEATER_CHAIN),
  validate({
    body: createScreenSchema,
    params: screenParamsSchema,
  }),
  createScreen,
);

export default router;
