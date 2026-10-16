import { Router } from "express";
import { getMe } from "../controllers/users.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const usersRouter = Router();

usersRouter.get("/me", authenticateToken, getMe);

export default usersRouter;