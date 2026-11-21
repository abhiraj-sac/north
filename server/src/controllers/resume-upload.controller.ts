import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getResumeDownloadUrl } from "../services/resume-upload.service.js";
import { createResumeUpload, completeResumeUpload } from "../services/resume-upload.service.js";
import { deleteResume, uploadResumeFile } from "../services/resume-upload.service.js";

type AuthenticatedRequest = Request & {
  userId?: string;
};

const uploadSchema = z.object({
  originalFilename: z.string().trim().min(1).max(255),
  mimeType: z.enum([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
  sizeBytes: z.number().int().positive(),
});


export async function initiateResumeUpload(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const validation = uploadSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid file details",
        errors: validation.error.flatten(),
      });
    }

    const { originalFilename, mimeType, sizeBytes } = validation.data;

    const result = await createResumeUpload(
      req.userId,
      originalFilename,
      mimeType,
      sizeBytes
    );

    return res.status(201).json({
      message: "Resume upload initialized",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_FILE_TYPE") {
        return res.status(400).json({ message: "Only PDF and DOCX files are allowed" });
      }

      if (error.message === "INVALID_FILE_SIZE") {
        return res.status(400).json({ message: "File size must be between 1 byte and 15 MB" });
      }

      if (error.message === "RESUME_LIMIT_REACHED") {
        return res.status(409).json({ message: "Maximum 3 resumes allowed" });
      }
    }

    next(error);
  }
}


export async function completeResumeUploadController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

const resumeId = req.params.resumeId;

if (typeof resumeId !== "string" || !resumeId) {
  return res.status(400).json({
    message: "Valid Resume ID is required",
  });
}

    if (!resumeId) {
      return res.status(400).json({
        message: "Resume ID is required",
      });
    }

    const result = await completeResumeUpload(
      req.userId,
      resumeId
    );

    return res.status(200).json({
      message: "Resume uploaded successfully",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "RESUME_NOT_FOUND") {
        return res.status(404).json({
          message: "Resume not found or upload is not pending",
        });
      }

      if (error.message === "FILE_SIZE_MISMATCH") {
        return res.status(400).json({
          message: "Uploaded file size does not match",
        });
      }

      if (error.message === "UPLOAD_ALREADY_COMPLETED") {
        return res.status(409).json({
          message: "Resume upload has already been completed",
        });
      }
    }

    next(error);
  }
}

export async function downloadResume(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const resumeId = req.params.resumeId;

    if (typeof resumeId !== "string" || !resumeId) {
      return res.status(400).json({
        message: "Valid Resume ID is required",
      });
    }

    const result = await getResumeDownloadUrl(req.userId, resumeId);

    return res.status(200).json({
      message: "Download URL generated successfully",
      ...result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RESUME_NOT_FOUND") {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    next(error);
  }
}

export async function deleteResumeController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const resumeId = req.params.resumeId;

    if (typeof resumeId !== "string" || !resumeId.trim()) {
      return res.status(400).json({
        message: "Valid Resume ID is required",
      });
    }

    const result = await deleteResume(req.userId, resumeId);

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "RESUME_NOT_FOUND") {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    next(error);
  }
}

export async function uploadResumeFileController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const resumeId = String(req.params.resumeId);

    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    await uploadResumeFile(req.userId, resumeId, req.body);

    return res.status(200).json({ message: "Resume file uploaded" });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "RESUME_NOT_FOUND":
          return res.status(404).json({ message: "Resume upload not found" });
        case "UPLOAD_EXPIRED":
          return res.status(410).json({ message: "Upload expired. Please try again." });
        case "INVALID_FILE_SIZE":
          return res.status(400).json({ message: "File size must be between 1 byte and 15 MB" });
        case "INVALID_FILE_CONTENT":
          return res.status(400).json({ message: "File content does not match its type" });
      }
    }

    next(error);
  }
}
