
import { api } from "./api";

export interface ResumeStudioJob {
  id: string;
  title: string;
  companyName: string;
  location: string | null;
  employmentType: string | null;
  workMode: string | null;
  descriptionText: string;
  applyUrl: string | null;
  source: {
    provider: string;
    companyName: string | null;
  } | null;
}

export interface ResumeStudioContext {
  message: string;
  job: ResumeStudioJob;
  candidateProfile: Record<string, unknown> | null;
  customizations: unknown;
}

export interface GeneratedResume {
  id: string;
  userId: string;
  jobId: string;
  content: Record<string, unknown>;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

const basePath = (jobId: string) =>
  `/api/resume-studio/${encodeURIComponent(jobId)}`;

export async function getResumeStudioContext(
  jobId: string,
  signal?: AbortSignal
): Promise<ResumeStudioContext> {
  const response = await api.get<ResumeStudioContext>(
    `${basePath(jobId)}/context`,
    { signal }
  );

  return response.data;
}

export async function getGeneratedResume(
  jobId: string,
  signal?: AbortSignal
): Promise<GeneratedResume | null> {
  try {
    const response = await api.get<{ resume: GeneratedResume }>(
      `${basePath(jobId)}/resume`,
      { signal }
    );

    return response.data.resume ?? null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function generateResume(
  jobId: string
): Promise<GeneratedResume> {
  const response = await api.post<{ resume: GeneratedResume }>(
    `${basePath(jobId)}/generate`
  );

  return response.data.resume;
}

export async function saveGeneratedResume(
  jobId: string,
  content: Record<string, unknown>
): Promise<GeneratedResume> {
  const response = await api.put<{ resume: GeneratedResume }>(
    `${basePath(jobId)}/resume`,
    { content }
  );

  return response.data.resume;
}

export async function downloadResumePdf(
  jobId: string
): Promise<Blob> {
  const response = await api.get(
    `${basePath(jobId)}/resume/pdf`,
    { responseType: "blob" }
  );

  return response.data;
}
