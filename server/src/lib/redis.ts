import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not configured");
}

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redisConnection.on("connect", () => {
  console.log("Redis connected");
});

redisConnection.on("error", (error: Error) => {
  console.error("Redis connection error:", error);
});
