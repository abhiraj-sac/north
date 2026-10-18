import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO 1: req.body ko validate karo
    const result = schema.safeParse(req.body);

    // TODO 2: Invalid hua toh 400 response bhejo
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    // TODO 3: Valid hua toh parsed data set karo
   req.body = result.data;

    // TODO 4: next() call karo
    next();
  };
}