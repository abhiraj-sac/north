import express, { Router } from "express";
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
import {
  deleteResumeController,
  uploadResumeFileController,
} from "../controllers/resume-upload.controller.js";
resumeRouter.get("/", authenticateToken, getResumes);
resumeRouter.post("/upload-init",authenticateToken,initiateResumeUpload);
// Raw file body (PDF/DOCX) sent by the client; stored in S3 by the server.
resumeRouter.put(
  "/:resumeId/file",
  authenticateToken,
  express.raw({ type: () => true, limit: "15mb" }),
  uploadResumeFileController
);
resumeRouter.post(
  "/:resumeId/complete",
  authenticateToken,
  completeResumeUploadController
);
resumeRouter.delete(
  "/:resumeId",
  authenticateToken,
  deleteResumeController
);
resumeRouter.get("/:resumeId/download", authenticateToken, downloadResume);

export default resumeRouter;