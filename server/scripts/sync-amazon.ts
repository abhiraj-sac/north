
import { prisma } from "../src/lib/prisma.js";
import { syncJobSource } from "../src/services/job-source-sync.service.js";

async function main() {
  const source = await prisma.jobSource.findFirst({
    where: {
      provider: "AMAZON",
      sourceKey: "amazon-global",
      isActive: true,
    },
  });

  if (!source) {
    throw new Error("Amazon source not found");
  }

  const result = await syncJobSource(source.id);

  console.log("\nAmazon sync completed successfully:");
  console.log(result);
}

main()
  .catch((error) => {
    console.error("Amazon sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
