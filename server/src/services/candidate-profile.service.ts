import { verifyUserResumes } from "./resume-verification.service.js";
import { prisma } from "../lib/prisma.js";

export async function generateCandidateProfile(userId: string) {
  try {
    // 1. Fetch and verify all user resumes
    console.log("[AI] Verifying user resumes...");

    const verification = await verifyUserResumes(userId);

    if (!verification.passed) {
      throw new Error(
        `RESUME_VERIFICATION_FAILED:${verification.failureReasons.join(",")}`,
      );
    }

    console.log(
      `[AI] ${verification.resumes.length} resumes verified successfully`,
    );

    // 2. Combine all extracted raw text
    const combinedRawText = verification.resumes
      .map(
        (resume, index) => `
===== RESUME ${index + 1} =====

${resume.rawText}
`,
      )
      .join("\n\n");

    console.log(
      `[AI] Combined raw text length: ${combinedRawText.length} characters`,
    );

    // 3. Get Python AI service URL
    const aiServiceUrl = process.env.AI_SERVICE_URL;

    if (!aiServiceUrl) {
      throw new Error("AI_SERVICE_URL is not configured");
    }

    // 4. Send request to FastAPI
    console.log("[AI] Sending request to FastAPI...");

    const startTime = Date.now();

    let response: Response;

    try {
      response = await fetch(`${aiServiceUrl}/api/candidate-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw_text: combinedRawText,
        }),
        signal: AbortSignal.timeout(600000),
      });
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      console.error(`[AI] FastAPI request failed after ${elapsed}s`);

      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error("AI_SERVICE_TIMEOUT");
      }

      console.error("[AI] Connection error:", error);

      throw new Error("AI_SERVICE_CONNECTION_FAILED");
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`[AI] FastAPI responded in ${elapsed}s`);

    // 5. Handle unsuccessful FastAPI response
    if (!response.ok) {
      const errorBody = await response.text();

      console.error(`[AI] FastAPI returned ${response.status}:`, errorBody);

      throw new Error(`AI_SERVICE_ERROR:${response.status}`);
    }

    // 6. Receive structured Candidate Profile
    // 6. Receive structured Candidate Profile
    const candidateProfile = await response.json();

    console.log("[AI] Candidate profile received successfully");

    // 7. Save or update Candidate Profile in PostgreSQL
    const savedProfile = await prisma.candidateProfile.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        profile: candidateProfile,
      },
      update: {
        profile: candidateProfile,
      },
    });

    console.log("[AI] Candidate profile saved successfully");

    return savedProfile.profile;
  } catch (error) {
    console.error("[AI] Original fetch error:", error);

    if (error instanceof Error) {
      console.error("[AI] Error name:", error.name);
      console.error("[AI] Error message:", error.message);
      console.error("[AI] Error cause:", error.cause);
    }

    throw error;
  }
}
