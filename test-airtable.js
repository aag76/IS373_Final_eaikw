// Test Airtable connection
import "dotenv/config";
import Airtable from "airtable";

async function testAirtableConnection() {
  console.log("Testing Airtable connection...\n");

  // Check environment variables
  console.log("✓ AIRTABLE_BASE_ID:", process.env.AIRTABLE_BASE_ID ? "✓ Set" : "✗ Missing");
  console.log("✓ AIRTABLE_API_TOKEN:", process.env.AIRTABLE_API_TOKEN ? "✓ Set" : "✗ Missing");
  console.log("");

  if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_API_TOKEN) {
    console.error("❌ Missing environment variables!");
    process.exit(1);
  }

  try {
    // Configure Airtable
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(
      process.env.AIRTABLE_BASE_ID
    );

    console.log("Attempting to connect to Airtable...");

    // Try to list tables (this will fail if credentials are wrong)
    const records = await base("Submissions")
      .select({
        maxRecords: 1,
      })
      .all();

    console.log("\n✅ SUCCESS! Connected to Airtable");
    console.log('✓ Found "Submissions" table');
    console.log(`✓ Current record count: ${records.length} (showing first record only)`);

    if (records.length > 0) {
      console.log("\nSample record fields:");
      console.log(JSON.stringify(records[0].fields, null, 2));
    } else {
      console.log("\nℹ️  Table is empty (no records yet)");
    }
  } catch (error) {
    console.error("\n❌ CONNECTION FAILED!");
    console.error("Error:", error.message);

    if (error.statusCode === 401) {
      console.error("\n→ Invalid API token. Check your AIRTABLE_API_TOKEN");
    } else if (error.statusCode === 404) {
      console.error("\n→ Base or table not found. Verify:");
      console.error("   1. AIRTABLE_BASE_ID is correct");
      console.error('   2. Table named "Submissions" exists in your base');
    } else {
      console.error("\n→ Unknown error. Check your Airtable configuration.");
    }

    process.exit(1);
  }
}

testAirtableConnection();
