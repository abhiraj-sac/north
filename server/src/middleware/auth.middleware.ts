
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type AuthenticatedRequest = Request & {
  userId?: string;
};

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid authorization header",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    );

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string"
    ) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.userId = payload.sub;

    next(); 
  } catch {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}
