import { Router } from "express";
import {
  register,
  login,
  getMe,
  refresh,
  logout,
  logoutAll,
} from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { loginSchema, registerSchema } from "./auth.validation";
import { authenticate } from "../../middleware/authenticate.middleware";

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
authRouter.post("/logout", logout);
authRouter.post("/logout-all", authenticate, logoutAll);

export default authRouter;
