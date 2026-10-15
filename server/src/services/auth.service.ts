
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

type SigninInput = {
  email: string;
  password: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET_MISSING");
  }

  return secret;
}

export async function signupUser(input: SignupInput) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
}

export async function signinUser(input: SigninInput) {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isPasswordCorrect = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!isPasswordCorrect) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    { sub: user.id },
    getJwtSecret(),
    { expiresIn: "15m" },
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}
