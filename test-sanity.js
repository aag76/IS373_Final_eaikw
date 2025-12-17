// Test Sanity CMS connection
import "dotenv/config";
import { createClient } from "@sanity/client";

async function testSanityConnection() {
  console.log("Testing Sanity CMS connection...\n");

  // Check environment variables
  console.log("✓ SANITY_PROJECT_ID:", process.env.SANITY_PROJECT_ID || "✗ Missing");
  console.log("✓ SANITY_DATASET:", process.env.SANITY_DATASET || "✗ Missing");
  console.log("✓ SANITY_API_TOKEN:", process.env.SANITY_API_TOKEN ? "✓ Set" : "✗ Missing");
  console.log("");

  if (
    !process.env.SANITY_PROJECT_ID ||
    !process.env.SANITY_DATASET ||
    !process.env.SANITY_API_TOKEN
  ) {
    console.error("❌ Missing environment variables!");
    process.exit(1);
  }

  try {
    // Configure Sanity client
    const client = createClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET,
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
      apiVersion: "2025-01-01",
    });

    console.log("Attempting to connect to Sanity...");
    console.log(`Project: ${process.env.SANITY_PROJECT_ID}`);
    console.log(`Dataset: ${process.env.SANITY_DATASET}\n`);

    // Test query to fetch all document types
    const query = '*[_type != "system"] {_type, _id} [0...5]';
    const documents = await client.fetch(query);

    console.log("✅ SUCCESS! Connected to Sanity CMS\n");

    if (documents.length > 0) {
      console.log(`✓ Found ${documents.length} document(s) (showing first 5)`);
      console.log("\nDocument types in your dataset:");

      const types = [...new Set(documents.map((doc) => doc._type))];
      types.forEach((type) => {
        const count = documents.filter((doc) => doc._type === type).length;
        console.log(`  • ${type} (${count})`);
      });

      console.log("\nSample documents:");
      documents.forEach((doc, i) => {
        console.log(`  ${i + 1}. ${doc._type} - ${doc._id}`);
      });
    } else {
      console.log("ℹ️  Dataset is empty (no documents yet)");
      console.log("You can start adding content through Sanity Studio");
    }

    // Get project info
    console.log("\n📊 Project Info:");
    const datasets = await client.request({
      uri: `/projects/${process.env.SANITY_PROJECT_ID}/datasets`,
    });
    console.log(`✓ Available datasets: ${datasets.map((d) => d.name).join(", ")}`);
  } catch (error) {
    console.error("\n❌ CONNECTION FAILED!");
    console.error("Error:", error.message);

    if (error.statusCode === 401) {
      console.error("\n→ Invalid API token. Check your SANITY_API_TOKEN");
    } else if (error.statusCode === 404) {
      console.error("\n→ Project or dataset not found. Verify:");
      console.error("   1. SANITY_PROJECT_ID is correct");
      console.error("   2. SANITY_DATASET exists in your project");
    } else {
      console.error("\n→ Error details:", error);
    }

    process.exit(1);
  }
}

testSanityConnection();
