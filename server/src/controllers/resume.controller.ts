import type { Request, Response, NextFunction } from "express";
import { getUserResumes } from "../services/resume.service.js";

type AuthenticatedRequest = Request & {
  userId?: string;
};

export async function getResumes(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const resumes = await getUserResumes(req.userId);

    return res.status(200).json({
      resumes,
    });
  } catch (error) {
    next(error);
  }
}