import { Router } from "express";
import { register, login, getMe, refresh } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { loginSchema, registerSchema } from "./auth.validation";
import { authenticate } from "../../middleware/auth.middleware";

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

authRouter.post("/refresh", refresh);
authRouter.get("/me", authenticate, getMe);

export default authRouter;
