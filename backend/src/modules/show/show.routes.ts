import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/authenticate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import {
  createShowSchema,
  showParamsSchema,
  getShowsQuerySchema,
  showSeatParamsSchema,
} from "./show.validation";
import { UserRole } from "../../../generated/prisma/enums";
import { createShow, listShows, listShowSeats } from "./show.controller";

const router = Router();

router.post(
  "/screens/:screenId/shows",
  authenticate,
  authorize(UserRole.THEATER_CHAIN),
  validate({ body: createShowSchema, params: showParamsSchema }),
  createShow,
);

router.get("/shows", validate({ query: getShowsQuerySchema }), listShows);
router.get(
  "/shows/:showId/seats",
  validate({ params: showSeatParamsSchema }),
  listShowSeats,
);

export default router;
