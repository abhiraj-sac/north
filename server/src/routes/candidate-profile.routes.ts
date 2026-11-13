
import { Router } from "express";

import { authenticateToken } from "../middleware/auth.middleware.js";

import {
  generateCandidateProfileController,
} from "../controllers/candidate-profile.controller.js";

const router = Router();

router.post(
  "/",
  authenticateToken,
  generateCandidateProfileController
);

export default router;
