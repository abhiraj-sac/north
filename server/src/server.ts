import "./lib/env.js";
import app from "./app.js";
import { testS3Connection } from "./lib/s3.js";
import { cleanupDeletingResumes } from "./services/resume-cleanup.service.js";

const PORT = Number(process.env.PORT) || 3000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

let cleanupRunning = false;

async function runResumeCleanup() {
  if (cleanupRunning) {
    return;
  }

  cleanupRunning = true;

  try {
    await cleanupDeletingResumes();
  } catch (error) {
    console.error("Resume cleanup worker failed:", error);
  } finally {
    cleanupRunning = false;
  }
}

const server = app.listen(PORT, async () => {
  console.log(`NORTH API running on port ${PORT}`);

  try {
    await testS3Connection();
  } catch (error) {
    console.error("AWS S3 connection failed:", error);
  }

  // Run once when the server starts
  void runResumeCleanup();

  // Retry every 5 minutes
  setInterval(() => {
    void runResumeCleanup();
  }, CLEANUP_INTERVAL);
});