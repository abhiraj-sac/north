import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "../lib/prisma.js";
import { s3, S3_BUCKET } from "../lib/s3.js";

export async function cleanupDeletingResumes() {
  const resumes = await prisma.resume.findMany({
    where: {
      uploadStatus: "DELETING",
    },
    orderBy: {
      updatedAt: "asc",
    },
    take: 25,
    select: {
      id: true,
      userId: true,
      s3ObjectKey: true,
    },
  });

  for (const resume of resumes) {
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: S3_BUCKET,
          Key: resume.s3ObjectKey,
        })
      );

      await prisma.resume.deleteMany({
        where: {
          id: resume.id,
          userId: resume.userId,
          uploadStatus: "DELETING",
        },
      });

      console.log(`Cleaned up resume: ${resume.id}`);
    } catch (error) {
      console.error(
        `Resume cleanup failed: ${resume.id}`,
        error
      );
    }
  }
}