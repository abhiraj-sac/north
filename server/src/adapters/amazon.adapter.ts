
import type {
  JobSourceAdapter,
  NormalizedJob,
} from "../types/job-ingestion.types.js";

interface AmazonJob {
  id_icims?: string;
  title?: string;
  company_name?: string;
  location?: string;
  posted_date?: string;
  job_category?: string;
  job_schedule_type?: string;
  description?: string;
  basic_qualifications?: string;
  preferred_qualifications?: string;
  job_path?: string;
  url_next_step?: string;
}

interface AmazonResponse {
  error: string | null;
  hits: number;
  jobs: AmazonJob[];
}

const BASE_URL = "https://www.amazon.jobs/en/search.json";
const PAGE_SIZE = 25;
const MAX_JOBS = 100;

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

function parsePostedDate(value?: string): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const amazonAdapter: JobSourceAdapter = {
  provider: "AMAZON",

  async fetchJobs(source): Promise<NormalizedJob[]> {
    // throw new Error("TEST: Amazon API failure");
    const allJobs: AmazonJob[] = [];

    for (let offset = 0; offset < MAX_JOBS; offset += PAGE_SIZE) {
      const url = new URL(BASE_URL);

      url.searchParams.set("offset", String(offset));
      url.searchParams.set("result_limit", String(PAGE_SIZE));
      url.searchParams.set("sort", "recent");

      const config = source.config as
        | { baseQuery?: string }
        | null;

      url.searchParams.set("base_query", config?.baseQuery ?? "");

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Amazon API failed: HTTP ${response.status}`);
      }

      const data = (await response.json()) as AmazonResponse;

      if (data.error) {
        throw new Error(`Amazon API error: ${data.error}`);
      }

      const batch = data.jobs ?? [];

      if (batch.length === 0) break;

      allJobs.push(...batch);

      if (batch.length < PAGE_SIZE || allJobs.length >= data.hits) {
        break;
      }
      
    }

    return allJobs.slice(0, MAX_JOBS).flatMap((job) => {
      const externalId = job.id_icims?.trim();
      const title = job.title?.trim();

      if (!externalId || !title) return [];

      const descriptionHtml = [
        job.description,
        job.basic_qualifications
          ? `<h3>Basic Qualifications</h3>${job.basic_qualifications}`
          : "",
        job.preferred_qualifications
          ? `<h3>Preferred Qualifications</h3>${job.preferred_qualifications}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const descriptionText = cleanHtml(descriptionHtml);

      const applyUrl = job.url_next_step
        ? new URL(job.url_next_step, "https://www.amazon.jobs").toString()
        : job.job_path
          ? new URL(job.job_path, "https://www.amazon.jobs").toString()
          : "";

      if (!applyUrl) return [];

      return [{
        externalId,
        title,
        companyName: job.company_name || source.companyName,
        location: job.location ?? null,
        countryCode: source.countryCode,
        employmentType: job.job_schedule_type ?? null,
        category: job.job_category ?? null,
        descriptionHtml: descriptionHtml || null,
        descriptionText: descriptionText || null,
        applyUrl,
        sourcePostedAt: parsePostedDate(job.posted_date),
        sourceUpdatedAt: null,
        rawPayload: job,
      }];
    });
  },
};
