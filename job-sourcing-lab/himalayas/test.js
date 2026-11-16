
const BASE_URL = "https://himalayas.app/jobs/api/search";

const KEYWORDS = [
  "software", "developer", "engineer",
  "frontend", "backend", "full stack",
  "javascript", "typescript", "react",
  "node.js", "python", "java",
  "data scientist", "data engineer",
  "machine learning", "artificial intelligence",
  "cybersecurity", "devops", "cloud",
  "qa engineer", "automation tester",
  "database", "security engineer"
];

async function testRecentJobs() {
  const cutoff = Math.floor(Date.now() / 1000) - 86400;
  const allJobs = [];

  for (let page = 1; page <= 10; page++) {
    const response = await fetch(
      `${BASE_URL}?country=IN&sort=recent&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`Page ${page}: HTTP ${response.status}`);
    }

    const data = await response.json();
    allJobs.push(...data.jobs);

    console.log(`Page ${page}: ${data.jobs.length} jobs`);

    // Stop when the oldest job is outside the cutoff.
    const oldest = Math.min(
      ...data.jobs.map(job => job.pubDate)
    );

    if (oldest < cutoff) break;
  }

  const recentJobs = allJobs.filter(job => {
    const indiaEligible =
      job.locationRestrictions.length === 0 ||
      job.locationRestrictions.includes("India");

    const isRecent = job.pubDate >= cutoff;

    const text =
      `${job.title} ${job.excerpt} ${job.categories.join(" ")}`
        .toLowerCase();

    const isCSIT = KEYWORDS.some(keyword =>
      text.includes(keyword)
    );

    return indiaEligible && isRecent && isCSIT;
  });

  const uniqueJobs = [
    ...new Map(recentJobs.map(job => [job.guid, job])).values()
  ];

  console.log("\nPages scanned:", allJobs.length);
  console.log("Unique recent CS/IT jobs:", uniqueJobs.length);

  uniqueJobs.forEach(job => {
    console.log({
      title: job.title,
      company: job.companyName,
      updatedAt: new Date(job.pubDate * 1000).toISOString(),
      locations: job.locationRestrictions,
      apply: job.applicationLink
    });
  });
}

testRecentJobs().catch(console.error);
