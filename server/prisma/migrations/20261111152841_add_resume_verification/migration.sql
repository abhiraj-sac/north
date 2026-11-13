-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'NEEDS_REVIEW');

-- CreateTable
CREATE TABLE "ResumeVerification" (
    "id" TEXT NOT NULL,
    "extractionId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "checks" JSONB,
    "failureReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeVerification_extractionId_key" ON "ResumeVerification"("extractionId");

-- AddForeignKey
ALTER TABLE "ResumeVerification" ADD CONSTRAINT "ResumeVerification_extractionId_fkey" FOREIGN KEY ("extractionId") REFERENCES "ResumeExtraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
