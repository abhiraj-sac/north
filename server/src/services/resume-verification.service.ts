
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

interface VerificationChecks {
  ownershipVerified: boolean;
  uploadCompleted: boolean;
  extractionCompleted: boolean;
  textExists: boolean;
  sufficientText: boolean;
}

interface VerificationResult {
  passed: boolean;
  rawText: string | null;
  extractionId: string | null;
  checks: VerificationChecks;
  failureReasons: string[];
}

export async function verifyResume(
  userId: string,
  resumeId: string
): Promise<VerificationResult> {
  // 1. Verify resume ownership and upload status
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
      uploadStatus: "UPLOADED",
    },
    include: {
      extractions: {
        where: {
          status: "COMPLETED",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  const extraction = resume?.extractions[0];

  // 2. Safely extract rawText from Prisma JSON
  const result = extraction?.result;

  let rawText = "";

  if (
    result !== null &&
    typeof result === "object" &&
    !Array.isArray(result) &&
    "rawText" in result &&
    typeof result.rawText === "string"
  ) {
    rawText = result.rawText.trim();
  }

  // 3. Perform verification checks
  const checks: VerificationChecks = {
    ownershipVerified: !!resume,
    uploadCompleted: !!resume,
    extractionCompleted: !!extraction,
    textExists: rawText.length > 0,
    sufficientText: rawText.length >= 100,
  };

  const failureReasons: string[] = [];

  if (!resume) {
    failureReasons.push("RESUME_NOT_FOUND_OR_NOT_OWNED");
  }

  if (resume && !extraction) {
    failureReasons.push("EXTRACTION_NOT_COMPLETED");
  }

  if (extraction && !checks.textExists) {
    failureReasons.push("EXTRACTED_TEXT_EMPTY");
  }

  if (checks.textExists && !checks.sufficientText) {
    failureReasons.push("INSUFFICIENT_EXTRACTED_TEXT");
  }

  const passed = failureReasons.length === 0;

  // 4. Convert checks into Prisma-compatible JSON
  const checksJson: Prisma.InputJsonObject = {
    ownershipVerified: checks.ownershipVerified,
    uploadCompleted: checks.uploadCompleted,
    extractionCompleted: checks.extractionCompleted,
    textExists: checks.textExists,
    sufficientText: checks.sufficientText,
  };

  // 5. Save verification result
  if (extraction) {
    await prisma.resumeVerification.upsert({
      where: {
        extractionId: extraction.id,
      },
      create: {
        extractionId: extraction.id,
        status: passed ? "PASSED" : "FAILED",
        checks: checksJson,
        failureReasons,
        verifiedAt: new Date(),
      },
      update: {
        status: passed ? "PASSED" : "FAILED",
        checks: checksJson,
        failureReasons,
        verifiedAt: new Date(),
      },
    });
  }

  // 6. Return verified text for next processing stage
  return {
    passed,
    rawText: passed ? rawText : null,
    extractionId: extraction?.id ?? null,
    checks,
    failureReasons,
  };
}




interface VerifiedResume {
  resumeId: string;
  extractionId: string;
  filename: string;
  rawText: string;
}

interface UserResumeVerificationResult {
  passed: boolean;
  resumes: VerifiedResume[];
  failureReasons: string[];
}

export async function verifyUserResumes(
  userId: string
): Promise<UserResumeVerificationResult> {
  // 1. Fetch all uploaded resumes belonging to this user
  const resumes = await prisma.resume.findMany({
    where: {
      userId,
      uploadStatus: "UPLOADED",
    },
    include: {
      extractions: {
        where: {
          status: "COMPLETED",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const verifiedResumes: VerifiedResume[] = [];
  const failureReasons: string[] = [];

  // 2. Ensure user has at least one uploaded resume
  if (resumes.length === 0) {
    return {
      passed: false,
      resumes: [],
      failureReasons: ["NO_UPLOADED_RESUMES"],
    };
  }

  // 3. Verify every uploaded resume
  for (const resume of resumes) {
    const extraction = resume.extractions[0];

    if (!extraction) {
      failureReasons.push(
        `EXTRACTION_NOT_COMPLETED:${resume.id}`
      );
      continue;
    }

    const result = extraction.result;

    const rawText =
      result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      "rawText" in result &&
      typeof result.rawText === "string"
        ? result.rawText.trim()
        : "";

    if (!rawText) {
      failureReasons.push(
        `EXTRACTED_TEXT_EMPTY:${resume.id}`
      );
      continue;
    }

    if (rawText.length < 100) {
      failureReasons.push(
        `INSUFFICIENT_EXTRACTED_TEXT:${resume.id}`
      );
      continue;
    }

    // 4. Save verification result
    const checksJson: Prisma.InputJsonObject = {
      ownershipVerified: true,
      uploadCompleted: true,
      extractionCompleted: true,
      textExists: true,
      sufficientText: true,
    };

    await prisma.resumeVerification.upsert({
      where: {
        extractionId: extraction.id,
      },
      create: {
        extractionId: extraction.id,
        status: "PASSED",
        checks: checksJson,
        failureReasons: [],
        verifiedAt: new Date(),
      },
      update: {
        status: "PASSED",
        checks: checksJson,
        failureReasons: [],
        verifiedAt: new Date(),
      },
    });

    // 5. Collect complete extracted text
    verifiedResumes.push({
      resumeId: resume.id,
      extractionId: extraction.id,
      filename: resume.originalFilename,
      rawText,
    });
  }

  // 6. All-or-nothing verification
  const passed =
    failureReasons.length === 0 &&
    verifiedResumes.length === resumes.length;

  return {
    passed,
    resumes: passed ? verifiedResumes : [],
    failureReasons,
  };
}
