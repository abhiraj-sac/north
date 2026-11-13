import { prisma } from "../lib/prisma.js";

interface GetDiscoveredJobsInput {
  page: number;
  limit: number;
}

export async function getDiscoveredJobs({
  page,
  limit,
}: GetDiscoveredJobsInput) {
  const skip = (page - 1) * limit;

  const where = {
    status: "ACTIVE" as const,
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        source: {
          select: {
            provider: true,
            companyName: true,
          },
        },
      },
      orderBy: {
        sourceUpdatedAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.job.count({ where }),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    filters: {
      status: "ACTIVE",
      country: "ALL",
      category: "ALL",
      updatedWithinHours: null,
    },
  };
}