
import type { Request, Response, NextFunction } from "express";
import { verifyUserResumes } from "../services/resume-verification.service.js";

type AuthenticatedRequest = Request & {
  userId?: string;
};

export async function verifyUserResumesController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await verifyUserResumes(userId);

    if (!result.passed) {
      return res.status(422).json({
        message: "Resume verification failed",
        failureReasons: result.failureReasons,
      });
    }

    return res.status(200).json({
      message: "All resumes verified successfully",
      resumes: result.resumes.map((resume) => ({
        resumeId: resume.resumeId,
        filename: resume.filename,
      })),
    });
  } catch (error) {
    next(error);
  }
}
