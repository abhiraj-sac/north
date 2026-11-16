
import { prisma } from "../lib/prisma.js";
import { getResumeStudioContext } from "./resume-studio.service.js";
import { Agent, fetch as undiciFetch } from "undici";

export async function generateResumeStudio(
  userId: string,
  jobId: string
) {
  const context = await getResumeStudioContext(userId, jobId);

  if (!context.candidateProfile) {
    throw new Error("CANDIDATE_PROFILE_NOT_FOUND");
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL?.replace(/\/+$/, "");

  if (!aiServiceUrl) {
    throw new Error("AI_SERVICE_URL_NOT_CONFIGURED");
  }

  const endpoint = `${aiServiceUrl}/api/resume-studio/generate`;
  const startTime = Date.now();

  const dispatcher = new Agent({
    headersTimeout: 300000,
    bodyTimeout: 300000,
    connectTimeout: 30000,
  });

  let response: Response;

  try {
    console.log("[Resume Studio] Calling:", endpoint);

    response = await undiciFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        job: context.job,
        candidate_profile: context.candidateProfile,
      }),
      dispatcher,
      signal: AbortSignal.timeout(600000),
    }) as unknown as Response;

    console.log(
      `[Resume Studio] AI responded in ${
        ((Date.now() - startTime) / 1000).toFixed(2)
      } seconds`
    );

    if (!response.ok) {
      const errorBody = await response.text();

      console.error(
        "[Resume Studio] AI error:",
        response.status,
        errorBody
      );

      throw new Error(`AI_SERVICE_ERROR:${response.status}`);
    }

    const generatedResume = await response.json();

    const savedResume = await prisma.generatedResume.upsert({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
      create: {
        userId,
        jobId,
        content: JSON.parse(JSON.stringify(generatedResume)),
        status: "DRAFT",
        version: 1,
      },
      update: {
        content: JSON.parse(JSON.stringify(generatedResume)),
        status: "DRAFT",
        version: {
          increment: 1,
        },
      },
    });

    return savedResume;

  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("AI_SERVICE_ERROR:")
    ) {
      throw error;
    }

    console.error("[Resume Studio] Connection error:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error cause:", error.cause);
    }

    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      throw new Error("AI_SERVICE_TIMEOUT");
    }

    throw new Error("AI_SERVICE_CONNECTION_FAILED");

  } finally {
    await dispatcher.close();
  }
}

export async function getGeneratedResume(
  userId: string,
  jobId: string
) {
  return prisma.generatedResume.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });
}

export async function updateGeneratedResume(
  userId: string,
  jobId: string,
  content: unknown
) {
  if (
    !content ||
    typeof content !== "object" ||
    Array.isArray(content)
  ) {
    throw new Error("INVALID_RESUME_CONTENT");
  }

  const result = await prisma.generatedResume.updateMany({
    where: {
      userId,
      jobId,
    },
    data: {
      content: JSON.parse(JSON.stringify(content)),
    },
  });

  if (result.count === 0) {
    throw new Error("GENERATED_RESUME_NOT_FOUND");
  }

  return getGeneratedResume(userId, jobId);
}
