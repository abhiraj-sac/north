
const url =
  "https://api.lever.co/v0/postings/leverdemo?mode=json";

async function testLever() {
  try {
    console.log("Fetching jobs from Lever API...\n");

    const response = await fetch(url);

    console.log("HTTP Status:", response.status);

    if (!response.ok) {
      throw new Error(`Lever API failed: ${response.status}`);
    }

    const jobs = await response.json();

    console.log("Total jobs returned:", jobs.length);

    if (jobs.length === 0) {
      console.log("No jobs found.");
      return;
    }

    for (const [index, job] of jobs.slice(0, 2).entries()) {
      console.log("\n==================================");
      console.log(`JOB ${index + 1}`);
      console.log("==================================");

      console.log("Title:", job.text);
      console.log("Location:", job.categories?.location || "Not specified");
      console.log("Team:", job.categories?.team || "Not specified");
      console.log("Workplace:", job.workplaceType || "Not specified");

      console.log("\nFULL JOB DESCRIPTION:\n");

      console.log(
        job.descriptionPlain ||
        job.description ||
        "Description not available."
      );

      console.log("\nAPPLICATION URL:");
      console.log(job.hostedUrl || job.applyUrl || "Not available");

      console.log("\nJOB ID:", job.id);
    }

    console.log("\nLever API test completed.");
  } catch (error) {
    console.error("\nError:", error.message);
  }
}

testLever();
