import { Router } from "express";
import {
  signup,
  signin,
} from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validateBody.js";
import { signupSchema, signinSchema } from "../schemas/auth.schema.js";

const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), signup);
authRouter.post("/signin", validateBody(signinSchema), signin);

export default authRouter;