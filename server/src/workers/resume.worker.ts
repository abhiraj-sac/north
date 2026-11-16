
import "../lib/env.js";
import "dotenv/config";
import { Worker } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { RESUME_EXTRACTION_QUEUE } from "../queues/resume.queue.js";
import { extractResumeText } from "../services/resume-parser.service.js";

interface ResumeExtractionJob {
  userId: string;
  resumeId: string;
}

export const resumeWorker = new Worker<ResumeExtractionJob>(
  RESUME_EXTRACTION_QUEUE,
  async (job) => {
    const { userId, resumeId } = job.data;
    
    console.log(`Starting resume extraction: ${resumeId}`);

    await extractResumeText(userId, resumeId);

    console.log(`Resume extraction completed: ${resumeId}`);

    return { resumeId, status: "COMPLETED" };
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

resumeWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

resumeWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

resumeWorker.on("error", (error) => {
  console.error("Resume worker error:", error);
});
