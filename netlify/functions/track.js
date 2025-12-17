const Airtable = require("airtable");

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
      const data = JSON.parse(event.body);
      const confirmationNumber = data.confirmationNumber;

      if (!confirmationNumber) {
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
      const records = await base(tableName)
        .select({
          filterByFormula: `{ConfirmationNumber} = '${confirmationNumber}'`,
          maxRecords: 1,
        })
        .all();

      if (records.length === 0) {
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
            confirmationNumber: record.fields.ConfirmationNumber,
            status: record.fields.Status || "pending",
            designStyle: record.fields.DesignStyle,
            submittedDate: record.fields.SubmittedDate,
            reviewDate: record.fields.ReviewDate,
            reviewNotes: record.fields.ReviewNotes,
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
