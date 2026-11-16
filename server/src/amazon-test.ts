
const AMAZON_URL =
  "https://www.amazon.jobs/en/search.json?offset=0&result_limit=5&sort=recent&base_query=";

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

async function testAmazonJobs() {
  try {
    console.log("Fetching jobs from Amazon...");

    const response = await fetch(AMAZON_URL);

    if (!response.ok) {
      throw new Error(`Amazon returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as AmazonResponse;

    console.log(`\nTotal matching jobs reported: ${data.hits}`);
    console.log(`Jobs received in this batch: ${data.jobs.length}\n`);

    for (const [index, job] of data.jobs.entries()) {
      console.log(`========== JOB ${index + 1} ==========`);

      console.log("Title:", job.title ?? "Not available");
      console.log("Company:", job.company_name ?? "Not available");
      console.log("Location:", job.location ?? "Not available");
      console.log("Posted:", job.posted_date ?? "Not available");
      console.log("Category:", job.job_category ?? "Not available");
      console.log("Job type:", job.job_schedule_type ?? "Not available");
      console.log("External ID:", job.id_icims ?? "Not available");

      console.log(
        "Job URL:",
        job.job_path
          ? `https://www.amazon.jobs${job.job_path}`
          : "Not available"
      );
      console.log(
  "Basic qualifications:",
  job.basic_qualifications ? "Available" : "Missing"
);

console.log(
  "Preferred qualifications:",
  job.preferred_qualifications ? "Available" : "Missing"
);

console.log(
  "Salary information:",
  job.preferred_qualifications?.match(
    /(?:USD|CAD|INR|EUR|GBP)[\s\S]{0,150}/i
  )?.[0] ?? "Not found"
);  

      console.log("Apply URL:", job.url_next_step ?? "Not available");
      console.log("Description available:", Boolean(job.description));
      console.log("====================================\n");
    }
    
  } catch (error) {
    console.error("Amazon job fetching failed:", error);
    process.exitCode = 1;
  }
}


testAmazonJobs();
