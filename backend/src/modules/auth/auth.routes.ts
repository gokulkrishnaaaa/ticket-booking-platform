import { Router } from "express";
import { register, login } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { loginSchema, registerSchema } from "./auth.validation";

const authRouter = Router();

authRouter.post(
  "/register",
  validate({
    body: registerSchema,
  }),
  register,
);
authRouter.post(
  "/login",
  validate({
    body: loginSchema,
  }),
  login,
);

export default authRouter;
