interface JobFilterInput {
  title: string;
  description: string;
  location?: string | null;
  updatedAt?: Date | null;
}

const CS_IT_KEYWORDS = [
  "software engineer",
  "software developer",
  "frontend",
  "backend",
  "full stack",
  "full-stack",
  "web developer",
  "data engineer",
  "data scientist",
  "machine learning",
  "artificial intelligence",
  "devops",
  "cloud engineer",
  "site reliability",
  "cybersecurity",
  "security engineer",
  "qa engineer",
  "test engineer",
  "database",
  "systems engineer",
  "it support",
  "network engineer",
];

export function isCsItJob(job: JobFilterInput): boolean {
  const text = `${job.title} ${job.description}`.toLowerCase();

  return CS_IT_KEYWORDS.some((keyword) =>
    text.includes(keyword)
  );
}

export function isRecentlyUpdated(
  updatedAt: Date | null | undefined,
  hours = 168
): boolean {
  if (!updatedAt) return false;

  const age = Date.now() - updatedAt.getTime();

  return age >= 0 && age <= hours * 60 * 60 * 1000;
}

export function isIndiaLocatedJob(
  location: string | null | undefined
): boolean {
  if (!location) return false;

  return /\bindia\b|\bbengaluru\b|\bbangalore\b|\bmumbai\b|\bdelhi\b|\bhyderabad\b|\bpune\b|\bchennai\b|\bnoida\b|\bgurugram\b|\bgurgaon\b|\bkolkata\b/i.test(
    location
  );
}