
import { prisma } from "../lib/prisma.js";
import type { JobProvider, Prisma } from "../../generated/prisma/client.js";

interface CreateJobSourceInput {
  provider: JobProvider;
  companyName: string;
  sourceKey?: string;
  boardToken?: string;
  boardUrl?: string;
  config?: Prisma.InputJsonValue;
  countryCode?: string;
}

export async function createJobSource(input: CreateJobSourceInput) {
  // Temporary backward compatibility for existing Greenhouse scripts.
  const sourceKey = input.sourceKey ?? input.boardToken;

  if (!sourceKey) {
    throw new Error("A sourceKey is required to register a job source");
  }

  return prisma.jobSource.upsert({
    where: {
      provider_sourceKey: {
        provider: input.provider,
        sourceKey,
      },
    },
    update: {
      companyName: input.companyName,
      isActive: true,
      ...(input.boardToken !== undefined
        ? { boardToken: input.boardToken }
        : {}),
      ...(input.boardUrl !== undefined
        ? { boardUrl: input.boardUrl }
        : {}),
      ...(input.config !== undefined
        ? { config: input.config }
        : {}),
      ...(input.countryCode !== undefined
        ? { countryCode: input.countryCode }
        : {}),
    },
    create: {
      provider: input.provider,
      companyName: input.companyName,
      sourceKey,
      boardToken: input.boardToken ?? null,
      countryCode: input.countryCode ?? "IN",
      ...(input.boardUrl !== undefined
        ? { boardUrl: input.boardUrl }
        : {}),
      ...(input.config !== undefined
        ? { config: input.config }
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
