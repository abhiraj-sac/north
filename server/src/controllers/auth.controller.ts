
import type { Request, Response } from "express";
import {
  signupUser,
  signinUser,
} from "../services/auth.service.js";

export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const user = await signupUser({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Signup failed",
    });
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await signinUser({
      email,
      password,
    });

    return res.status(200).json({
      message: "Signin successful",
      ...result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.error("Signin error:", error);

    return res.status(500).json({
      message: "Signin failed",
    });
  }
}
