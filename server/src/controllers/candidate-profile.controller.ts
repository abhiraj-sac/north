
import type { Request, Response, NextFunction } from "express";

import { generateCandidateProfile } from "../services/candidate-profile.service.js";
import { prisma } from "../lib/prisma.ts";

type AuthenticatedRequest = Request & {
  userId?: string;
};

function describeVerificationFailure(reasons: string[]): string {
  if (reasons.includes("NO_UPLOADED_RESUMES")) {
    return "Upload at least one resume before generating your profile.";
  }
  if (reasons.includes("EXTRACTION_NOT_COMPLETED")) {
    return "One of your resumes is still being processed. Wait a moment and try again.";
  }
  if (
    reasons.includes("EXTRACTED_TEXT_EMPTY") ||
    reasons.includes("INSUFFICIENT_EXTRACTED_TEXT")
  ) {
    return "We couldn't read enough text from one of your resumes. Try a text-based PDF or DOCX.";
  }
  return "Resume verification failed.";
}

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
      const reasons = error.message
        .slice("RESUME_VERIFICATION_FAILED:".length)
        .split(",")
        .map((reason) => reason.split(":")[0] ?? reason);

      return res.status(422).json({
        message: "Resume verification failed",
        reasons,
        details: describeVerificationFailure(reasons),
      });
    }

    next(error);
  }
}


export async function getCandidateProfileController(
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

    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    return res.status(200).json({
  candidateProfile: candidateProfile?.profile ?? null,
  customizations: candidateProfile?.customizations ?? null,
});
  } catch (error) {
    next(error);
  }
}

export const updateCandidateProfileController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

if (!userId) {
  return res.status(401).json({
    message: "Unauthorized",
  });
}
    const { customizations } = req.body;

    if (!customizations || typeof customizations !== "object") {
      return res.status(400).json({
        message: "Valid customizations are required.",
      });
    }

    const candidateProfile = await prisma.candidateProfile.update({
      where: { userId },
      data: { customizations },
    });

    return res.status(200).json({
      message: "Profile customizations saved.",
      customizations: candidateProfile.customizations,
    });
  } catch (error) {
    console.error("Failed to save profile customizations:", error);

    return res.status(500).json({
      message: "Unable to save profile customizations.",
    });
  }
};