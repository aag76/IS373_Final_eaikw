const Airtable = require("airtable");

// Environment variable check on load
console.log("🔧 track.js Environment check:", {
  hasAirtableToken: !!process.env.AIRTABLE_API_TOKEN,
  hasAirtableBase: !!process.env.AIRTABLE_BASE_ID,
  nodeEnv: process.env.NODE_ENV,
  tokenLength: process.env.AIRTABLE_API_TOKEN?.length,
  baseIdLength: process.env.AIRTABLE_BASE_ID?.length,
});

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(
  process.env.AIRTABLE_BASE_ID
);
const tableName = "Submissions";

// In-memory submissions cache for testing
let submissions = [];

exports.handler = async (event, _context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Handle POST - Track submission by confirmation number
  if (event.httpMethod === "POST") {
    try {
      console.log("🔍 Tracking request:", {
        method: event.httpMethod,
        headers: event.headers,
        queryParams: event.queryStringParameters,
      });
      console.log("Raw body:", event.body);

      const data = JSON.parse(event.body);
      const confirmationNumber = data.confirmationNumber;
      console.log("Searching for confirmation number:", confirmationNumber);

      if (!confirmationNumber) {
        console.log("❌ Missing confirmation number");
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Confirmation number is required",
          }),
        };
      }

      // Find submission in Airtable
      console.log("📤 Querying Airtable table:", tableName);
      const records = await base(tableName)
        .select({
          filterByFormula: `{ConfirmationNumber} = '${confirmationNumber}'`,
          maxRecords: 1,
        })
        .all();

      console.log("Query results:", records.length > 0 ? "Found match" : "No match found");

      if (records.length === 0) {
        console.log("❌ Submission not found");
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Submission not found",
            message: "No submission found with this confirmation number",
          }),
        };
      }

      const record = records[0];

      // Return submission details
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          submission: {
            confirmationNumber: record.fields["Confirmation Number"],
            status: record.fields.Status || "pending",
            styleGuideName: record.fields["Style Guide Name"],
            submittedDate: record.fields["Submitted Date"],
            reviewDate: record.fields["Review Date"],
            reviewNotes: record.fields["Review Notes"],
          },
        }),
      };
    } catch (error) {
      console.error("Airtable track error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Failed to track submission",
          details: error.message,
        }),
      };
    }
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({
      success: false,
      error: "Method not allowed",
    }),
  };
};
exports.setSubmissions = (subs) => {
  submissions = subs;
};

exports.getSubmissions = () => {
  return submissions;
};
