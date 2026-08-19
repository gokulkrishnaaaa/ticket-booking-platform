import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { UserRole } from "../../../generated/prisma/enums";
import { createMovieSchema } from "./movie.validation";
import { createMovie } from "./movie.controller";
import { validate } from "../../middleware/validate.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validate({
    body: createMovieSchema,
  }),
  createMovie,
);

export default router;
