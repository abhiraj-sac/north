-- CreateEnum
CREATE TYPE "JobProvider" AS ENUM ('GREENHOUSE', 'HIMALAYAS', 'LEVER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "JobWorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "JobSyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');

-- CreateTable
CREATE TABLE "JobSource" (
    "id" TEXT NOT NULL,
    "provider" "JobProvider" NOT NULL,
    "companyName" TEXT NOT NULL,
    "boardToken" TEXT NOT NULL,
    "boardUrl" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'IN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "location" TEXT,
    "countryCode" TEXT,
    "workMode" "JobWorkMode" NOT NULL DEFAULT 'UNKNOWN',
    "employmentType" TEXT,
    "category" TEXT,
    "descriptionHtml" TEXT,
    "descriptionText" TEXT,
    "applyUrl" TEXT NOT NULL,
    "sourcePostedAt" TIMESTAMP(3),
    "sourceUpdatedAt" TIMESTAMP(3),
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSyncLog" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" "JobSyncStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "fetchedCount" INTEGER NOT NULL DEFAULT 0,
    "createdCount" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "closedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "JobSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobSource_isActive_provider_idx" ON "JobSource"("isActive", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "JobSource_provider_boardToken_key" ON "JobSource"("provider", "boardToken");

-- CreateIndex
CREATE INDEX "Job_status_sourceUpdatedAt_idx" ON "Job"("status", "sourceUpdatedAt");

-- CreateIndex
CREATE INDEX "Job_countryCode_status_idx" ON "Job"("countryCode", "status");

-- CreateIndex
CREATE INDEX "Job_category_status_idx" ON "Job"("category", "status");

-- CreateIndex
CREATE INDEX "Job_firstSeenAt_idx" ON "Job"("firstSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "Job_sourceId_externalId_key" ON "Job"("sourceId", "externalId");

-- CreateIndex
CREATE INDEX "JobSyncLog_sourceId_startedAt_idx" ON "JobSyncLog"("sourceId", "startedAt");

-- CreateIndex
CREATE INDEX "JobSyncLog_status_startedAt_idx" ON "JobSyncLog"("status", "startedAt");

-- CreateIndex
CREATE INDEX "SavedJob_userId_createdAt_idx" ON "SavedJob"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_jobId_key" ON "SavedJob"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "JobSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSyncLog" ADD CONSTRAINT "JobSyncLog_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "JobSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
