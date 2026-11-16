
import { prisma } from "../lib/prisma.js";
import { getJobSourceAdapter } from "../adapters/index.js";
import { ingestJobs } from "./job-ingestion.service.js";

export async function syncJobSource(sourceId: string) {
  const source = await prisma.jobSource.findUnique({
    where: { id: sourceId },
  });

  if (!source || !source.isActive) {
    throw new Error("Active job source not found");
  }

  const syncLog = await prisma.jobSyncLog.create({
    data: {
      sourceId: source.id,
      status: "RUNNING",
    },
  });

  try {
    const adapter = getJobSourceAdapter(source.provider);

    console.log(`Starting ${source.provider} sync...`);
    console.log(`Company: ${source.companyName}`);

    const jobs = await adapter.fetchJobs(source);

    const result = await ingestJobs({
      sourceId: source.id,
      jobs,
      syncLogId: syncLog.id,
    });

    return {
      source: source.companyName,
      ...result,
    };
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
