import { PDFParse } from "pdf-parse";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { prisma } from "../lib/prisma.ts";
import { s3, S3_BUCKET } from "../lib/s3.ts";
const PARSER_VERSION = "pdf-parse@2.4.5";


export async function extractResumeText(
  userId: string,
  resumeId: string
) {
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
      uploadStatus: "UPLOADED",
    },
  });

  if (!resume) {
    throw new Error("RESUME_NOT_FOUND_OR_NOT_UPLOADED");
  }

  const extraction = await prisma.resumeExtraction.create({
    data: {
      resumeId: resume.id,
      parserVersion: PARSER_VERSION,
      status: "PROCESSING",
      startedAt: new Date(),
    },
  });

  // 3. Download PDF from S3
  const s3Response = await s3.send(
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: resume.s3ObjectKey,
    })
  );

  if (!s3Response.Body) {
    throw new Error("S3_OBJECT_BODY_EMPTY");
  }

  const pdfBytes = await s3Response.Body.transformToByteArray();

  const pdfBuffer = Buffer.from(pdfBytes);

  // 4. Initialize PDF parser
const parser = new PDFParse({
  data: new Uint8Array(pdfBuffer),
});

try {
  // 5. Extract raw text from PDF
//   const result = await parser.getText();

  const result = await parser.getText();

await prisma.resumeExtraction.update({
  where: {
    id: extraction.id,
  },
  data: {
    status: "COMPLETED",
    result: {
      rawText: result.text,
      pageCount: result.total,
    },
    completedAt: new Date(),
  },
});

console.log("PDF text extraction completed!");
} catch (error) {
  await prisma.resumeExtraction.update({
    where: {
      id: extraction.id,
    },
    data: {
      status: "FAILED",
      errorMessage:
        error instanceof Error ? error.message : "Unknown extraction error",
    },
  });

  throw error;
} finally {
  await parser.destroy();
}
}