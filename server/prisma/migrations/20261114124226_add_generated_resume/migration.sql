-- CreateEnum
CREATE TYPE "GeneratedResumeStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- DropIndex
DROP INDEX "JobSource_provider_boardToken_key";

-- CreateTable
CREATE TABLE "GeneratedResume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" "GeneratedResumeStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedResume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneratedResume_userId_updatedAt_idx" ON "GeneratedResume"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "GeneratedResume_jobId_idx" ON "GeneratedResume"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedResume_userId_jobId_key" ON "GeneratedResume"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "GeneratedResume" ADD CONSTRAINT "GeneratedResume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedResume" ADD CONSTRAINT "GeneratedResume_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
