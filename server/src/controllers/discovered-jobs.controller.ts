
import type { Request, Response, NextFunction } from "express";
import { getDiscoveredJobs , getDiscoveredJobById,} from "../services/discovered-jobs.service.js";

export async function getDiscoveredJobsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 50
    ) {
      return res.status(400).json({
        message: "Invalid pagination parameters",
      });
    }

    const result = await getDiscoveredJobs({ page, limit });

    return res.status(200).json({
      message: "Discovered jobs fetched successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDiscoveredJobByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    const job = await getDiscoveredJobById(id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found or no longer active",
      });
    }

    return res.status(200).json({
      message: "Job details fetched successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
}