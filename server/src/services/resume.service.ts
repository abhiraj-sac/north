import { prisma } from "../lib/prisma.ts";

export async function getUserResumes(userId: string) {
  return prisma.resume.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      originalFilename: true,
      mimeType: true,
      sizeBytes: true,
      uploadStatus: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
