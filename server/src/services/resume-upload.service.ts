import { randomUUID } from "node:crypto";
import { resumeExtractionQueue } from "../queues/resume.queue.js";
import {
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET } from "../lib/s3.js";
import { prisma } from "../lib/prisma.js";

const MAX_RESUMES = 3;

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function createResumeUpload(
  userId: string,
  originalFilename: string,
  mimeType: string,
  sizeBytes: number
){
    // validate file type 
    if(!ALLOWED_MIME_TYPES.includes(mimeType)){
        throw new Error("Invalid file type. Only PDF and DOCX files are allowed.");
    }   
    // 2 validate file size
    if(sizeBytes > MAX_FILE_SIZE){
        throw new Error("File size exceeds the maximum limit of 15 MB.");
    }
  // 3. Check existing resume count
  const resumeCount = await prisma.resume.count({
  where: {
    userId,
    OR: [
      {
        uploadStatus: "UPLOADED",
      },
      {
        uploadStatus: "PENDING_UPLOAD",
        uploadExpiresAt: {
          gt: new Date(),
        },
      },
    ],
  },
});

if (resumeCount >= MAX_RESUMES) {
  throw new Error(
    "Maximum number of resumes reached. Please delete an existing resume before uploading a new one."
  );
}
//   4 generate uniqie id for the new resume
    const resumeId = randomUUID();
    const extension = mimeType === "application/pdf" ? "pdf" : "docx";
    const s3ObjectKey = `resumes/${userId}/${resumeId}.${extension}`;

  const resume = await prisma.resume.create({
    data: {
      id: resumeId,
      userId,
      originalFilename,
      mimeType,
      sizeBytes,
      s3ObjectKey,
      uploadStatus: "PENDING_UPLOAD",
      uploadExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });
//   6 genenrate temproary signed URL for the client to upload the resume directly to S3
    const putObjectCommand = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3ObjectKey,
        ContentType: mimeType,
    });
    const uploadUrl = await getSignedUrl(s3, putObjectCommand, { expiresIn: 300 });
    return {
    resumeId: resume.id,
    uploadUrl,
    s3ObjectKey,
    expiresIn: 300,
  };
}

export async function completeResumeUpload(
  userId: string,
  resumeId: string){
    // 1 : find the resume belonging to this user 
    const resume  = await prisma.resume.findUnique({
        where:{
            id:resumeId,  
            userId:userId,
             uploadStatus: "PENDING_UPLOAD",
        }
    });

    if( !resume){
        throw new Error("Resume not found or not in a valid state for completion.");
    }
    // 2 : verify that file exist in s3 
  const headObject = await s3.send(
    new HeadObjectCommand({
      Bucket: S3_BUCKET,
      Key: resume.s3ObjectKey,
    })
  );
  // verify uploaded file 
  if(headObject.ContentType !== resume.mimeType){
    throw new Error("Uploaded file does not match the expected size or type.");  
  }
  // 4. Update database status
  const updated = await prisma.resume.updateMany({
    where: {
      id: resumeId,
      userId,
      uploadStatus: "PENDING_UPLOAD",
    },
    data: {
      uploadStatus: "UPLOADED",
      uploadExpiresAt: null,
    },
  });

  if (updated.count === 0) {
    throw new Error("UPLOAD_ALREADY_COMPLETED");
  }
  await resumeExtractionQueue.add(
  "extract-resume",
  {
    userId,
    resumeId,
  },
  {
    jobId: resumeId,
  }
);

  return {
    resumeId: resume.id,
    uploadStatus: "UPLOADED",
  };
}

export async function getResumeDownloadUrl(
  userId: string,
  resumeId: string
) {
  // Find only an uploaded resume belonging to this user
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
      uploadStatus: "UPLOADED",
    },
  });

  if (!resume) {
    throw new Error("RESUME_NOT_FOUND");
  }

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: resume.s3ObjectKey,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(resume.originalFilename)}"`,
  });

  const downloadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300,
  });

  return {
    downloadUrl,
    expiresIn: 300,
  };
}
export async function deleteResume(
  userId: string,
  resumeId: string
) {
  // 1. Find resume belonging to this user
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
      uploadStatus: {
        in: ["UPLOADED", "DELETING"],
      },
    },
  });

  if (!resume) {
    throw new Error("RESUME_NOT_FOUND");
  }

  // 2. Atomically transition UPLOADED -> DELETING
  const transition = await prisma.resume.updateMany({
    where: {
      id: resumeId,
      userId,
      uploadStatus: "UPLOADED",
    },
    data: {
      uploadStatus: "DELETING",
    },
  });

  // 3. If another request already started deletion,
  // verify that the resume is still in DELETING state
  if (transition.count === 0) {
    const deletingResume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
        uploadStatus: "DELETING",
      },
    });

    if (!deletingResume) {
      throw new Error("RESUME_NOT_FOUND");
    }
  }

  // 4. Delete S3 object
  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: resume.s3ObjectKey,
    })
  );

  // 5. Delete DB record only after S3 succeeds
  await prisma.resume.deleteMany({
    where: {
      id: resumeId,
      userId,
      uploadStatus: "DELETING",
    },
  });

  return {
    resumeId,
    message: "Resume deleted successfully",
  };
}

// Receives the file from the API client and stores it in S3 (no browser-to-S3 CORS needed).
export async function uploadResumeFile(
  userId: string,
  resumeId: string,
  body: Buffer
) {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId, uploadStatus: "PENDING_UPLOAD" },
  });

  if (!resume) {
    throw new Error("RESUME_NOT_FOUND");
  }

  if (resume.uploadExpiresAt && resume.uploadExpiresAt < new Date()) {
    throw new Error("UPLOAD_EXPIRED");
  }

  if (body.length === 0 || body.length > MAX_FILE_SIZE) {
    throw new Error("INVALID_FILE_SIZE");
  }

  const mimeType =
    resume.mimeType ??
    (resume.s3ObjectKey.endsWith(".pdf")
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

  // PDF files start with "%PDF"; DOCX files are ZIP archives starting with "PK".
  const signature = body.subarray(0, 4).toString("latin1");
  const looksValid =
    mimeType === "application/pdf"
      ? signature === "%PDF"
      : signature.startsWith("PK");

  if (!looksValid) {
    throw new Error("INVALID_FILE_CONTENT");
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: resume.s3ObjectKey,
      ContentType: mimeType,
      Body: body,
    })
  );

  return { resumeId: resume.id };
}
