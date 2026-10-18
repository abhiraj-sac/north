import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Request error:", err);

  if (err instanceof Error && err.message === "EMAIL_ALREADY_EXISTS") {
    return res.status(409).json({
      message: "Email is already registered",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
}