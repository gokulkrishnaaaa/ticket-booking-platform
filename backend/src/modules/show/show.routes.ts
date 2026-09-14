import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { createShowSchema, showParamsSchema } from "./show.validation";
import { UserRole } from "../../../generated/prisma/enums";
import { createShow } from "./show.controller";

const router = Router();

router.post(
  "/:screenId/shows",
  authenticate,
  authorize(UserRole.THEATER_CHAIN),
  validate({ body: createShowSchema, params: showParamsSchema }),
  createShow,
);

export default router;
