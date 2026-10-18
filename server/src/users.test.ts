import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma.js";
import app from "./app.js";

vi.mock("./lib/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("GET /api/users/me", () => {
  // Keep your existing two tests here.
  it("should return 401 when token is missing and nothing more", async () => {
    const response = await request(app).get("/api/users/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Authentication token is required",
    });
  });


  it("should return 401 when token is invalid", async () => {
  const response = await request(app)
    .get("/api/users/me")
    .set("Authorization", "Bearer invalid-token");

  expect(response.status).toBe(401);
  expect(response.body).toEqual({
    message: "Invalid or expired authentication token",
  });
})

  it("should return the logged-in user with a valid token", async () => {
    vi.stubEnv("JWT_SECRET", "test-secret");

    const fakeUser = {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      fakeUser as never,
    );

    const token = jwt.sign(
      {},
      process.env.JWT_SECRET!,
      {
        subject: "test-user-id",
        expiresIn: "1h",
      },
    );

    const response = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      id: fakeUser.id,
      name: fakeUser.name,
      email: fakeUser.email,
      createdAt: fakeUser.createdAt.toISOString(),
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "test-user-id" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  });
});