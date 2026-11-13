
import { Queue } from "bullmq";
import { redisConnection } from "../lib/redis.js";

export const RESUME_EXTRACTION_QUEUE = "resume-extraction";

export const resumeExtractionQueue = new Queue(
  RESUME_EXTRACTION_QUEUE,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  }
);
