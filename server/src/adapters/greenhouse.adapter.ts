
import type {
  JobSourceAdapter,
  NormalizedJob,
} from "../types/job-ingestion.types.js";

interface GreenhouseJob {
  id: number;
  title: string;
  updated_at?: string;
  location?: {
    name?: string;
  };
  content?: string;
  absolute_url: string;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export const greenhouseAdapter: JobSourceAdapter = {
  provider: "GREENHOUSE",

  async fetchJobs(source): Promise<NormalizedJob[]> {
    const boardToken = source.boardToken ?? source.sourceKey;

    const url =
      `https://boards-api.greenhouse.io/v1/boards/` +
      `${encodeURIComponent(boardToken)}/jobs?content=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Greenhouse API failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as GreenhouseResponse;

    return (data.jobs ?? []).map((job) => {
      const descriptionHtml = job.content ?? "";
      const updatedAt = job.updated_at
        ? new Date(job.updated_at)
        : null;

      return {
        externalId: String(job.id),
        title: job.title,
        companyName: source.companyName,
        location: job.location?.name ?? null,
        countryCode: source.countryCode,
        employmentType: null,
        category: null,
        descriptionHtml,
        descriptionText: cleanHtml(descriptionHtml),
        applyUrl: job.absolute_url,
        sourcePostedAt: null,
        sourceUpdatedAt:
          updatedAt && !Number.isNaN(updatedAt.getTime())
            ? updatedAt
            : null,
        rawPayload: job,
      };
    });
  },
};
