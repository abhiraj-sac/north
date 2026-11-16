-- AlterEnum
ALTER TYPE "JobProvider" ADD VALUE 'AMAZON';

-- AlterTable
ALTER TABLE "JobSource"
ADD COLUMN "config" JSONB,
ADD COLUMN "sourceKey" TEXT,
ALTER COLUMN "boardToken" DROP NOT NULL;

-- Preserve existing source identifiers
UPDATE "JobSource"
SET "sourceKey" = "boardToken"
WHERE "sourceKey" IS NULL;

-- Make sourceKey mandatory
ALTER TABLE "JobSource"
ALTER COLUMN "sourceKey" SET NOT NULL;

-- Replace old unique constraint
ALTER TABLE "JobSource"
DROP CONSTRAINT IF EXISTS "JobSource_provider_boardToken_key";

ALTER TABLE "JobSource"
ADD CONSTRAINT "JobSource_provider_sourceKey_key"
UNIQUE ("provider", "sourceKey");