
import { prisma } from "../lib/prisma.js";
import type { NormalizedJob } from "../types/job-ingestion.types.js";

interface IngestJobsInput {
  sourceId: string;
  jobs: NormalizedJob[];
  syncLogId: string;
}

export async function ingestJobs({
  sourceId,
  jobs,
  syncLogId,
}: IngestJobsInput) {
  let createdCount = 0;
  let updatedCount = 0;

  for (const job of jobs) {
    const existing = await prisma.job.findUnique({
      where: {
        sourceId_externalId: {
          sourceId,
          externalId: job.externalId,
        },
      },
      select: { id: true },
    });

    await prisma.job.upsert({
      where: {
        sourceId_externalId: {
          sourceId,
          externalId: job.externalId,
        },
      },
      update: {
        title: job.title,
        companyName: job.companyName,
        location: job.location,
        countryCode: job.countryCode,
        employmentType: job.employmentType,
        category: job.category,
        descriptionHtml: job.descriptionHtml,
        descriptionText: job.descriptionText,
        applyUrl: job.applyUrl,
        sourcePostedAt: job.sourcePostedAt,
        sourceUpdatedAt: job.sourceUpdatedAt,
        lastSeenAt: new Date(),
        status: "ACTIVE",
        rawPayload: JSON.parse(JSON.stringify(job.rawPayload)),
      },
      create: {
        sourceId,
        externalId: job.externalId,
        title: job.title,
        companyName: job.companyName,
        location: job.location,
        countryCode: job.countryCode,
        employmentType: job.employmentType,
        category: job.category,
        descriptionHtml: job.descriptionHtml,
        descriptionText: job.descriptionText,
        applyUrl: job.applyUrl,
        sourcePostedAt: job.sourcePostedAt,
        sourceUpdatedAt: job.sourceUpdatedAt,
        rawPayload: JSON.parse(JSON.stringify(job.rawPayload)),
      },
    });

    if (existing) {
      updatedCount++;
    } else {
      createdCount++;
    }
  }

  await prisma.$transaction([
    prisma.jobSource.update({
      where: { id: sourceId },
      data: { lastSyncedAt: new Date() },
    }),
    prisma.jobSyncLog.update({
      where: { id: syncLogId },
      data: {
        status: "SUCCESS",
        completedAt: new Date(),
        fetchedCount: jobs.length,
        createdCount,
        updatedCount,
      },
    }),
  ]);

  return {
    fetchedCount: jobs.length,
    createdCount,
    updatedCount,
  };
}
