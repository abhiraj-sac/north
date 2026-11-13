
import { prisma } from "../lib/prisma.js";
import type { JobProvider } from "../../generated/prisma/client.js";

interface CreateJobSourceInput {
  provider: JobProvider;
  companyName: string;
  boardToken: string;
  boardUrl?: string;
}

export async function createJobSource(input: CreateJobSourceInput) {

return prisma.jobSource.upsert({
  where: {
    provider_boardToken: {
      provider: input.provider,
      boardToken: input.boardToken,
    },
  },
  update: {
    companyName: input.companyName,
    isActive: true,
    ...(input.boardUrl !== undefined
      ? { boardUrl: input.boardUrl }
      : {}),
  },
  create: {
    provider: input.provider,
    companyName: input.companyName,
    boardToken: input.boardToken,
    countryCode: "IN",
    ...(input.boardUrl !== undefined
      ? { boardUrl: input.boardUrl }
      : {}),
  },
});

}

export async function getActiveJobSources(provider?: JobProvider) {
  return prisma.jobSource.findMany({
    where: {
      isActive: true,
      ...(provider ? { provider } : {}),
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function deactivateJobSource(id: string) {
  return prisma.jobSource.update({
    where: { id },
    data: { isActive: false },
  });
}
