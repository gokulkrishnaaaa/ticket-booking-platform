import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { registerTheaterChainSchema } from "./theater-chain.validation";
import { registerTheaterChain } from "./theater-chain.controller";

const theaterChainRouter = Router();

theaterChainRouter.post(
  "/register",
  validate({ body: registerTheaterChainSchema }),
  registerTheaterChain,
);

export default theaterChainRouter;
