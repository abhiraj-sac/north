
const url =
  "https://boards-api.greenhouse.io/v1/boards/razorpaysoftwareprivatelimited/jobs?content=true";

async function testGreenhouse() {
  try {
    console.log("Fetching jobs from Greenhouse API...\n");

    const response = await fetch(url);

    console.log("HTTP Status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Greenhouse API failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const jobs = data.jobs || [];

    console.log("Total jobs returned:", jobs.length);

    if (jobs.length === 0) {
      console.log("No jobs found.");
      return;
    }

    // Print first 2 jobs with complete descriptions
    for (const [index, job] of jobs.slice(0, 2).entries()) {
      console.log("\n========================================");
      console.log(`JOB ${index + 1}`);
      console.log("========================================");

      console.log("\nTitle:", job.title);
      console.log("Company:", "Razorpay");
      console.log("Location:", job.location?.name || "Not specified");
      console.log("Updated At:", job.updated_at || "Not available");

      console.log("\nFULL JOB DESCRIPTION:\n");

      if (job.content) {
        console.log(job.content);
      } else {
        console.log("Description not available.");
      }

      console.log("\nAPPLICATION URL:");
      console.log(job.absolute_url || "Not available");

      console.log("\nJOB ID:", job.id);
    }

    console.log("\n========================================");
    console.log("Greenhouse API test completed.");
  } catch (error) {
    console.error("\nError:", error.message);
  }
}

testGreenhouse();
