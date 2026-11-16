
import { prisma } from "../lib/prisma.js";

export async function getResumeStudioContext(
  userId: string,
  jobId: string
) {
  const [job, candidateProfile] = await Promise.all([
    prisma.job.findFirst({
      where: {
        id: jobId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        companyName: true,
        location: true,
        employmentType: true,
        workMode: true,
        descriptionText: true,
        applyUrl: true,
        source: {
          select: {
            provider: true,
            companyName: true,
          },
        },
      },
    }),

    prisma.candidateProfile.findUnique({
      where: {
        userId,
      },
      select: {
        profile: true,
        customizations: true,
      },
    }),
  ]);

  if (!job) {
    throw new Error("JOB_NOT_FOUND");
  }

  if (!candidateProfile) {
    throw new Error("CANDIDATE_PROFILE_NOT_FOUND");
  }

  return {
    job,
    candidateProfile: candidateProfile.profile,
    customizations: candidateProfile.customizations,
  };
}
