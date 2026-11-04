import { Router } from "express";
import { getResumes } from "../controllers/resume.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.ts";
import {
  completeResumeUploadController,
} from "../controllers/resume-upload.controller.js";
import { initiateResumeUpload } from "../controllers/resume-upload.controller.js";
const resumeRouter = Router();
import {
  downloadResume,
} from "../controllers/resume-upload.controller.js";

resumeRouter.get("/", authenticateToken, getResumes);
resumeRouter.post("/upload-init",authenticateToken,initiateResumeUpload);
resumeRouter.post(
  "/:resumeId/complete",
  authenticateToken,
  completeResumeUploadController
);

resumeRouter.get("/:resumeId/download", authenticateToken, downloadResume);

export default resumeRouter;