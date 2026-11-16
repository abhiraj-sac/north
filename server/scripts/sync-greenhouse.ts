
import { prisma } from "../src/lib/prisma.js";
import { syncJobSource } from "../src/services/job-source-sync.service.js";

async function main() {
  const source = await prisma.jobSource.findFirst({
    where: {
      provider: "GREENHOUSE",
      sourceKey: "razorpaysoftwareprivatelimited",
      isActive: true,
    },
  });

  if (!source) {
    throw new Error("Razorpay Greenhouse source not found");
  }

  const result = await syncJobSource(source.id);

  console.log("\nSync completed successfully:");
  console.log(result);
}

main()
  .catch((error) => {
    console.error("Job source sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
