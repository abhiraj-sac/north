
import { prisma } from "../lib/prisma.js";
import { greenhouseAdapter } from "../adapters/greenhouse.adapter.js";
import { ingestJobs } from "./job-ingestion.service.js";

export async function syncGreenhouseJobs(sourceId: string) {
  const source = await prisma.jobSource.findUnique({
    where: { id: sourceId },
  });

  if (!source || !source.isActive) {
    throw new Error("Active Greenhouse source not found");
  }

  if (source.provider !== "GREENHOUSE") {
    throw new Error("Source is not a Greenhouse board");
  }

  const syncLog = await prisma.jobSyncLog.create({
    data: {
      sourceId: source.id,
      status: "RUNNING",
    },
  });

  try {
    const jobs = await greenhouseAdapter.fetchJobs(source);

    return await ingestJobs({
      sourceId: source.id,
      jobs,
      syncLogId: syncLog.id,
    });
  } catch (error) {
    await prisma.jobSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage:
          error instanceof Error ? error.message : "Unknown sync error",
      },
    });

    throw error;
  }
}
