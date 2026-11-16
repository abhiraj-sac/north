import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";

import {
  getResumeStudioContextController,
  generateResumeStudioController,
  getGeneratedResumeController,
  updateGeneratedResumeController,
  downloadResumePdfController
} from "../controllers/resume-studio.controller.js";

const router = Router();

// GET JOB + CANDIDATE CONTEXT
router.get(
  "/:jobId/context",
  authenticateToken,
  getResumeStudioContextController
);

// GENERATE RESUME
router.post(
  "/:jobId/generate",
  authenticateToken,
  generateResumeStudioController
);

// GET GENERATED RESUME
router.get(
  "/:jobId/resume",
  authenticateToken,
  getGeneratedResumeController
);
router.get(
  "/:jobId/resume/pdf",
  authenticateToken,
  downloadResumePdfController
);
// UPDATE GENERATED RESUME
router.put(
  "/:jobId/resume",
  authenticateToken,
  updateGeneratedResumeController
);

export default router;