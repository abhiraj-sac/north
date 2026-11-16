import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";

import {
  generateCandidateProfileController,
  getCandidateProfileController,
    updateCandidateProfileController,
} from "../controllers/candidate-profile.controller.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getCandidateProfileController
);

router.post(
  "/",
  authenticateToken,
  generateCandidateProfileController
);
router.put("/", authenticateToken, updateCandidateProfileController);
export default router;