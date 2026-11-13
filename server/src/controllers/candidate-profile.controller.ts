
import type { Request, Response, NextFunction } from "express";

import { generateCandidateProfile } from "../services/candidate-profile.service.js";

type AuthenticatedRequest = Request & {
  userId?: string;
};

export async function generateCandidateProfileController(
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

    const candidateProfile = await generateCandidateProfile(userId);

    return res.status(200).json({
      message: "Candidate profile generated successfully",
      candidateProfile,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("RESUME_VERIFICATION_FAILED:")
    ) {
      return res.status(422).json({
        message: "Resume verification failed",
        details: error.message.split(":")[1],
      });
    }

    next(error);
  }
}
