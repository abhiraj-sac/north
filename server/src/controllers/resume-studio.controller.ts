import type { Request, Response, NextFunction } from "express";

import { getResumeStudioContext } from "../services/resume-studio.service.js";
import {
  generateResumeStudio,
  getGeneratedResume,
  updateGeneratedResume,
} from "../services/resume-studio-generation.service.js";
type AuthenticatedRequest = Request & {
  userId?: string;
};
import { generateResumePdf } from "../services/resume-pdf.service.js";

// GENERATE RESUME
export async function generateResumeStudioController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const jobId = req.params.jobId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (typeof jobId !== "string") {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const resume = await generateResumeStudio(userId, jobId);

    return res.status(200).json({
      message: "Resume generated successfully",
      resume,
    });
  } catch (error) {
    next(error);
  }
}


// GET GENERATED RESUME
export async function getGeneratedResumeController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const jobId = req.params.jobId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (typeof jobId !== "string") {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const resume = await getGeneratedResume(userId, jobId);

    if (!resume) {
      return res.status(404).json({
        message: "Generated resume not found",
      });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    next(error);
  }
}


// UPDATE GENERATED RESUME
export async function updateGeneratedResumeController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const jobId = req.params.jobId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (typeof jobId !== "string") {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const resume = await updateGeneratedResume(
      userId,
      jobId,
      req.body.content
    );

    return res.status(200).json({
      message: "Resume updated successfully",
      resume,
    });
  } catch (error) {
    next(error);
  }
}

// GET RESUME STUDIO CONTEXT
export async function getResumeStudioContextController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const jobId = req.params.jobId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (typeof jobId !== "string") {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const context = await getResumeStudioContext(userId, jobId);

    return res.status(200).json({
      message: "Resume Studio context fetched successfully",
      ...context,
    });

  } catch (error) {
    if (error instanceof Error && error.message === "JOB_NOT_FOUND") {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (
      error instanceof Error &&
      error.message === "CANDIDATE_PROFILE_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Candidate profile not found",
      });
    }

    next(error);
  }
}


export async function downloadResumePdfController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const jobId = req.params.jobId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (typeof jobId !== "string") {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const resume = await getGeneratedResume(userId, jobId);

    if (!resume) {
      return res.status(404).json({
        message: "Generated resume not found",
      });
    }

    const content = resume.content;

    if (
      !content ||
      typeof content !== "object" ||
      Array.isArray(content)
    ) {
      return res.status(422).json({
        message: "Invalid resume content",
      });
    }

    const pdfBuffer = await generateResumePdf(
      content as Record<string, unknown>
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="north-resume.pdf"'
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
