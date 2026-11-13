
import { prisma } from "../lib/prisma.js";

interface GreenhouseJob {
  id: number;
  title: string;
  updated_at?: string;
  location?: {
    name?: string;
  };
  content?: string;
  absolute_url: string;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

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
    const url =
      `https://boards-api.greenhouse.io/v1/boards/` +
      `${encodeURIComponent(source.boardToken)}/jobs?content=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Greenhouse API failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as GreenhouseResponse;
    const jobs = data.jobs ?? [];

    let createdCount = 0;
    let updatedCount = 0;

    for (const job of jobs) {
      const externalId = String(job.id);

      const existing = await prisma.job.findUnique({
        where: {
          sourceId_externalId: {
            sourceId: source.id,
            externalId,
          },
        },
        select: { id: true },
      });

      const sourceUpdatedAt = job.updated_at
        ? new Date(job.updated_at)
        : null;

      const validUpdatedAt =
        sourceUpdatedAt && !Number.isNaN(sourceUpdatedAt.getTime())
          ? sourceUpdatedAt
          : null;

      const descriptionHtml = job.content ?? "";

      await prisma.job.upsert({
        where: {
          sourceId_externalId: {
            sourceId: source.id,
            externalId,
          },
        },
        update: {
          title: job.title,
          companyName: source.companyName,
          location: job.location?.name ?? null,
          countryCode: source.countryCode,
          descriptionHtml,
          descriptionText: cleanHtml(descriptionHtml),
          applyUrl: job.absolute_url,
          sourceUpdatedAt: validUpdatedAt,
          lastSeenAt: new Date(),
          status: "ACTIVE",
          rawPayload: JSON.parse(JSON.stringify(job)),
        },
        create: {
          sourceId: source.id,
          externalId,
          title: job.title,
          companyName: source.companyName,
          location: job.location?.name ?? null,
          countryCode: source.countryCode,
          descriptionHtml,
          descriptionText: cleanHtml(descriptionHtml),
          applyUrl: job.absolute_url,
          sourceUpdatedAt: validUpdatedAt,
          rawPayload: JSON.parse(JSON.stringify(job)),
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
        where: { id: source.id },
        data: { lastSyncedAt: new Date() },
      }),
      prisma.jobSyncLog.update({
        where: { id: syncLog.id },
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
      source: source.companyName,
      fetchedCount: jobs.length,
      createdCount,
      updatedCount,
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
