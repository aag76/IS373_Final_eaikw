/**
 * Netlify Function: Sanity to Airtable Sync
 * Receives webhooks from Sanity and syncs to Airtable
 */

// Environment variable check on load
console.log("🔧 sanity-to-airtable.js Environment check:", {
  hasAirtableToken: !!process.env.AIRTABLE_API_TOKEN,
  hasAirtableBase: !!process.env.AIRTABLE_BASE_ID,
  nodeEnv: process.env.NODE_ENV,
  tokenLength: process.env.AIRTABLE_API_TOKEN?.length,
  baseIdLength: process.env.AIRTABLE_BASE_ID?.length,
});

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN;
const AIRTABLE_TABLE_NAME = "Submissions";

exports.handler = async (event) => {
  console.log("🔄 Sanity to Airtable sync triggered:", {
    method: event.httpMethod,
    headers: event.headers,
    queryParams: event.queryStringParameters,
  });

  // Only accept POST requests
  if (event.httpMethod !== "POST") {
    console.log("❌ Method not allowed:", event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log("Raw body:", event.body);
    const body = JSON.parse(event.body);
    console.log("Parsed webhook data:", body);

    // Sanity sends the document in the payload
    const document = body.document || body;
    console.log("Document type:", document._type, "ID:", document._id);

    // Only process gallerySubmission documents
    if (document._type !== "gallerySubmission") {
      console.log("ℹ️ Skipping non-gallery submission type:", document._type);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Skipped non-gallery submission" }),
      };
    }

    // Only process published documents
    if (!document._id || document._id.startsWith("drafts.")) {
      console.log("ℹ️ Skipping draft document:", document._id);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Skipped draft" }),
      };
    }

    console.log("✅ Document validation passed, proceeding with sync");

    // Format data for Airtable
    const airtablePayload = {
      records: [
        {
          fields: {
            "Submitter Name": document.submitterName || "",
            Email: document.submitterEmail || "",
            URL: document.url || "",
            Description: document.description || "",
            Status: document.status || "submitted",
            "Sanity ID": document._id,
            "Submitted At": document._createdAt || new Date().toISOString(),
          },
        },
      ],
    };

    // Send to Airtable
    console.log("📤 Sending to Airtable table:", AIRTABLE_TABLE_NAME);
    console.log("Payload:", JSON.stringify(airtablePayload, null, 2));

    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(airtablePayload),
      }
    );

    const airtableData = await airtableResponse.json();
    console.log("Airtable response status:", airtableResponse.status);
    console.log("Airtable response data:", airtableData);

    if (!airtableResponse.ok) {
      console.error("❌ Airtable error:", airtableData);
      return {
        statusCode: airtableResponse.status,
        body: JSON.stringify({
          error: "Failed to sync to Airtable",
          details: airtableData,
        }),
      };
    }

    console.log("✅ Successfully synced to Airtable:", airtableData.records[0].id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Synced to Airtable",
        airtableRecord: airtableData.records[0],
      }),
    };
  } catch (error) {
    console.error("❌ Sync error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};
