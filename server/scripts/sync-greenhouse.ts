
import { prisma } from "../src/lib/prisma.js";
import { syncGreenhouseJobs } from "../src/services/greenhouse-ingestion.service.js";

async function main() {
  const source = await prisma.jobSource.findUnique({
    where: {
      provider_boardToken: {
        provider: "GREENHOUSE",
        boardToken: "razorpaysoftwareprivatelimited",
      },
    },
  });

  if (!source) {
    throw new Error("Razorpay JobSource not found");
  }

  console.log("Starting Greenhouse sync...");
  console.log("Company:", source.companyName);

  const result = await syncGreenhouseJobs(source.id);

  console.log("\nSync completed successfully:");
  console.log(result);
}

main()
  .catch((error) => {
    console.error("Greenhouse sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
