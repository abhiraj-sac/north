import { prisma } from "./prisma.js";

async function main() {
  await prisma.$connect();

  const result = await prisma.$queryRaw`SELECT 1`;

  console.log("Database connection successful:", result);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });