
import { prisma } from "../src/lib/prisma.js";
import {
  isCsItJob,
  isIndiaLocatedJob,
  isRecentlyUpdated,
} from "../src/services/job-filter.service.js";

async function main() {
  const totalJobs = await prisma.job.count();

  const activeJobs = await prisma.job.count({
    where: { status: "ACTIVE" },
  });

  const jobs = await prisma.job.findMany({
    where: { status: "ACTIVE" },
    include: {
      source: {
        select: {
          companyName: true,
          provider: true,
        },
      },
    },
    orderBy: {
      sourceUpdatedAt: "desc",
    },
  });

  const cutoff = new Date(Date.now() - 168 * 60 * 60 * 1000);

  let recentCount = 0;
  let indiaCount = 0;
  let csItCount = 0;
  let finalEligibleCount = 0;

  console.log("\n========== NORTH JOB DIAGNOSTICS ==========\n");

  console.log("Total jobs in database:", totalJobs);
  console.log("Active jobs:", activeJobs);
  console.log("24-hour cutoff:", cutoff.toISOString());

  console.log("\n========== INDIVIDUAL JOB CHECKS ==========\n");

  for (const job of jobs) {
    const isRecent = isRecentlyUpdated(job.sourceUpdatedAt, 168);
    const isIndia = isIndiaLocatedJob(job.location);

    const isCsIt = isCsItJob({
      title: job.title,
      description: job.descriptionText ?? "",
      location: job.location,
    });

    const eligible = isRecent && isIndia && isCsIt;

    if (isRecent) recentCount++;
    if (isIndia) indiaCount++;
    if (isCsIt) csItCount++;
    if (eligible) finalEligibleCount++;

    console.log({
      title: job.title,
      company: job.companyName,
      source: job.source.provider,
      location: job.location,
      updatedAt: job.sourceUpdatedAt,
      descriptionLength: job.descriptionText?.length ?? 0,
      checks: {
        recent24Hours: isRecent,
        indiaLocation: isIndia,
        csItCategory: isCsIt,
        finalEligible: eligible,
      },
    });
  }

  console.log("\n========== FILTER SUMMARY ==========\n");

  console.log("Active jobs:", activeJobs);
  console.log("Updated within 24 hours:", recentCount);
  console.log("India location matched:", indiaCount);
  console.log("CS/IT keyword matched:", csItCount);
  console.log("Passed all three filters:", finalEligibleCount);

  console.log("\n==========================================\n");
}

main()
  .catch((error) => {
    console.error("Job inspection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
