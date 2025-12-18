/**
 * Cleanup Script for Test Data
 * Removes test submissions from Airtable
 */

import Airtable from "airtable";
import "dotenv/config";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(
  process.env.AIRTABLE_BASE_ID
);

async function cleanupTestData() {
  console.log("🧹 Cleaning up test data from Airtable...\n");

  try {
    // Find all test submissions
    const records = await base("Submissions")
      .select({
        filterByFormula:
          'OR({Name}="Test Designer", {Name}="Test User", FIND("Automated", {Name}) > 0, FIND("Test", {DesignStyle}) > 0)',
      })
      .all();

    if (records.length === 0) {
      console.log("✓ No test data found to clean up");
      return;
    }

    console.log(`Found ${records.length} test submission(s) to delete:`);

    for (const record of records) {
      console.log(`  - ${record.fields.ConfirmationNumber}: ${record.fields.DesignStyle}`);
    }

    // Delete in batches of 10 (Airtable limit)
    const batchSize = 10;
    let deleted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const ids = batch.map((r) => r.id);

      await base("Submissions").destroy(ids);
      deleted += ids.length;

      console.log(`  Deleted batch ${Math.floor(i / batchSize) + 1}: ${ids.length} records`);
    }

    console.log(`\n✅ Successfully deleted ${deleted} test submission(s)`);
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error.message);
    process.exit(1);
  }
}

cleanupTestData();
