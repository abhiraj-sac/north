
import { prisma } from "../src/lib/prisma.js";
import { createJobSource } from "../src/services/job-source.service.js";

async function main() {
  const source = await createJobSource({
    provider: "GREENHOUSE",
    companyName: "Razorpay",
    boardToken: "razorpaysoftwareprivatelimited",
    boardUrl:
      "https://boards.greenhouse.io/razorpaysoftwareprivatelimited",
  });

  console.log("Job source registered successfully:");
  console.log(source);
}

main()
  .catch((error) => {
    console.error("Source registration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
