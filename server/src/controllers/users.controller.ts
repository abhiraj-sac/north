
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

type AuthenticatedRequest = Request & {
  userId?: string;
};

export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}
