import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { authenticate } from "../../middleware/authenticate.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { verifyTheaterChain } from "../theater-chain/theater-chain.controller";

const adminRouter = Router();

adminRouter.patch(
  "/theater-chains/:id/verify",
  authenticate,
  authorize(UserRole.ADMIN),
  verifyTheaterChain,
);

export default adminRouter;
