
import { verifyUserResumes } from "./resume-verification.service.js";
import { prisma } from "../lib/prisma.js";

import { Agent, fetch as undiciFetch } from "undici";

export async function generateCandidateProfile(userId: string) {
  console.log("[AI] Starting Candidate Profile generation...");

  // 1. Verify uploaded resumes
  console.log("[AI] Verifying user resumes...");

  const verification = await verifyUserResumes(userId);

  if (!verification.passed) {
    throw new Error(
      `RESUME_VERIFICATION_FAILED:${verification.failureReasons.join(",")}`
    );
  }

  console.log(
    `[AI] ${verification.resumes.length} resumes verified successfully`
  );

  // 2. Combine extracted resume text
  const combinedRawText = verification.resumes
    .map(
      (resume, index) => `
===== RESUME ${index + 1} =====

${resume.rawText}
`
    )
    .join("\n\n");

  console.log(
    `[AI] Combined raw text length: ${combinedRawText.length} characters`
  );

  if (!combinedRawText.trim()) {
    throw new Error("RESUME_TEXT_EMPTY");
  }

  // 3. Get AI service URL
  const aiServiceUrl = process.env.AI_SERVICE_URL?.replace(/\/+$/, "");

  if (!aiServiceUrl) {
    throw new Error("AI_SERVICE_URL_NOT_CONFIGURED");
  }

  const endpoint = `${aiServiceUrl}/api/candidate-profile`;
  const startTime = Date.now();

  const dispatcher = new Agent({
    headersTimeout: 300000,
    bodyTimeout: 300000,
    connectTimeout: 30000,
  });

  try {
    // 4. Send request to FastAPI
    console.log("[AI] Sending request to FastAPI:", endpoint);

    const response = await undiciFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw_text: combinedRawText,
      }),
      dispatcher,
      signal: AbortSignal.timeout(600000),
    });

    console.log(
      `[AI] FastAPI responded in ${
        ((Date.now() - startTime) / 1000).toFixed(2)
      } seconds`
    );

    // 5. Handle unsuccessful response
    if (!response.ok) {
      const errorBody = await response.text();

      console.error(
        `[AI] FastAPI returned ${response.status}:`,
        errorBody
      );

      throw new Error(`AI_SERVICE_ERROR:${response.status}`);
    }

    // 6. Receive and validate Candidate Profile
    const candidateProfile: unknown = await response.json();

if (
  !candidateProfile ||
  typeof candidateProfile !== "object" ||
  Array.isArray(candidateProfile)
) {
  throw new Error("INVALID_CANDIDATE_PROFILE_RESPONSE");
}

const profileData = candidateProfile as never;

    console.log("[AI] Candidate profile received successfully");

    // 7. Save or update Candidate Profile in PostgreSQL
    const savedProfile = await prisma.candidateProfile.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        profile: profileData,
      },
      update: {
        profile: profileData,
      },
    });

    console.log("[AI] Candidate profile saved successfully");

    return savedProfile.profile;

  } catch (error) {
    console.error("[AI] Candidate Profile request failed:", error);

    if (error instanceof Error) {
      console.error("[AI] Error name:", error.name);
      console.error("[AI] Error message:", error.message);
      console.error("[AI] Error cause:", error.cause);
    }

    const cause = error instanceof Error ? error.cause : undefined;

    // Preserve errors returned by FastAPI
    if (
      error instanceof Error &&
      error.message.startsWith("AI_SERVICE_ERROR:")
    ) {
      throw error;
    }

    // Handle timeout errors
    const isTimeout =
      error instanceof Error &&
      (
        error.name === "TimeoutError" ||
        error.name === "AbortError"
      );

    const isUndiciTimeout =
      cause instanceof Error &&
      "code" in cause &&
      [
        "UND_ERR_HEADERS_TIMEOUT",
        "UND_ERR_BODY_TIMEOUT",
        "UND_ERR_CONNECT_TIMEOUT",
      ].includes(String(cause.code));

    if (isTimeout || isUndiciTimeout) {
      throw new Error("AI_SERVICE_TIMEOUT");
    }

    throw new Error("AI_SERVICE_CONNECTION_FAILED");

  } finally {
    await dispatcher.close();
  }
}
