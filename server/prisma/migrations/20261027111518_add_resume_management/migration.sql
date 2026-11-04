-- CreateEnum
CREATE TYPE "ResumeUploadStatus" AS ENUM ('PENDING_UPLOAD', 'UPLOADED', 'DELETING');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "s3ObjectKey" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "checksumSha256" TEXT,
    "uploadStatus" "ResumeUploadStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "uploadExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeExtraction" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "status" "ExtractionStatus" NOT NULL DEFAULT 'QUEUED',
    "parserVersion" TEXT NOT NULL,
    "result" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resume_s3ObjectKey_key" ON "Resume"("s3ObjectKey");

-- CreateIndex
CREATE INDEX "Resume_userId_uploadStatus_idx" ON "Resume"("userId", "uploadStatus");

-- CreateIndex
CREATE INDEX "Resume_uploadExpiresAt_idx" ON "Resume"("uploadExpiresAt");

-- CreateIndex
CREATE INDEX "ResumeExtraction_resumeId_createdAt_idx" ON "ResumeExtraction"("resumeId", "createdAt");

-- CreateIndex
CREATE INDEX "ResumeExtraction_resumeId_status_idx" ON "ResumeExtraction"("resumeId", "status");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExtraction" ADD CONSTRAINT "ResumeExtraction_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
