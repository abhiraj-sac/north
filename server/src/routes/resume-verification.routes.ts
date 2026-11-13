
import { Router } from "express";
import { verifyUserResumesController } from "../controllers/resume-verification.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticateToken, verifyUserResumesController);

export default router;