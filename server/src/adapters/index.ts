
import type { JobProvider } from "../../generated/prisma/client.js";
import type { JobSourceAdapter } from "../types/job-ingestion.types.js";

import { greenhouseAdapter } from "./greenhouse.adapter.js";
import { amazonAdapter } from "./amazon.adapter.js";

const adapters: Partial<Record<JobProvider, JobSourceAdapter>> = {
  GREENHOUSE: greenhouseAdapter,
  AMAZON: amazonAdapter,
};

export function getJobSourceAdapter(
  provider: JobProvider
): JobSourceAdapter {
  const adapter = adapters[provider];

  if (!adapter) {
    throw new Error(`No adapter registered for provider: ${provider}`);
  }

  return adapter;
}
