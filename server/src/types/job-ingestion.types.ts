
import type { JobProvider } from "../../generated/prisma/client.js";

export interface NormalizedJob {
  externalId: string;
  title: string;
  companyName: string;
  location: string | null;
  countryCode: string | null;
  employmentType: string | null;
  category: string | null;
  descriptionHtml: string | null;
  descriptionText: string | null;
  applyUrl: string;
  sourcePostedAt: Date | null;
  sourceUpdatedAt: Date | null;
  rawPayload: unknown;
}

export interface JobSourceAdapter {
  provider: JobProvider;

  fetchJobs(source: {
    id: string;
    companyName: string;
    sourceKey: string;
    boardToken: string | null;
    boardUrl: string | null;
    countryCode: string;
    config: unknown;
  }): Promise<NormalizedJob[]>;
}
