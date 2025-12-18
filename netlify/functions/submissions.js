const crypto = require("crypto");
const Airtable = require("airtable");

// Check environment variables
if (!process.env.AIRTABLE_API_TOKEN) {
  console.error("Missing AIRTABLE_API_TOKEN environment variable");
}
if (!process.env.AIRTABLE_BASE_ID) {
  console.error("Missing AIRTABLE_BASE_ID environment variable");
}

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(
  process.env.AIRTABLE_BASE_ID
);
const tableName = "Submissions"; // Your table name in Airtable

// Discord webhook URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_SUBMISSIONS;

// Send Discord notification
async function sendDiscordNotification(submission) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log("Discord webhook not configured, skipping notification");
    return;
  }

  try {
    const embed = {
      title: "🎨 New Style Guide Submission!",
      color: 3447003, // Blue
      description: "A new design style has been submitted for review.",
      fields: [
        {
          name: "📝 Style Guide Name",
          value: submission.styleGuideName || "Untitled",
          inline: false,
        },
        {
          name: "🏷️ Category",
          value: submission.category || "Not specified",
          inline: true,
        },
        {
          name: "👤 Submitter",
          value: submission.name,
          inline: true,
        },
        {
          name: "📧 Email",
          value: submission.email,
          inline: true,
        },
        {
          name: "🔗 Style Guide URL",
          value: submission.styleGuideUrl || "Not provided",
          inline: false,
        },
        {
          name: "🎫 Confirmation Number",
          value: `\`${submission.confirmationNumber}\``,
          inline: true,
        },
        {
          name: "📅 Submitted",
          value: new Date().toLocaleString(),
          inline: true,
        },
      ],
      footer: {
        text: "Design Gallery - Submission System",
      },
      timestamp: new Date().toISOString(),
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "📬 **New submission received!**",
        embeds: [embed],
      }),
    });

    console.log("Discord notification sent successfully");
  } catch (error) {
    console.error("Discord notification failed:", error);
    // Don't fail the submission if Discord notification fails
  }
}

exports.handler = async (event, _context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
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

  // Handle POST - Submit new style guide
  if (event.httpMethod === "POST") {
    try {
      console.log("📝 Submission received");
      console.log("Raw body:", event.body);
      console.log("Environment check:", {
        hasAirtableToken: !!process.env.AIRTABLE_API_TOKEN,
        hasAirtableBase: !!process.env.AIRTABLE_BASE_ID,
        hasDiscordWebhook: !!process.env.DISCORD_WEBHOOK_SUBMISSIONS,
        tokenLength: process.env.AIRTABLE_API_TOKEN?.length,
        baseIdLength: process.env.AIRTABLE_BASE_ID?.length,
      });

      const data = JSON.parse(event.body);
      console.log("Parsed data fields:", Object.keys(data));
      console.log("Full data:", data);

      // Generate confirmation number
      const confirmationNumber = "DSG-" + crypto.randomBytes(4).toString("hex").toUpperCase();
      console.log("Generated confirmation:", confirmationNumber);

      // Map form fields to Airtable fields
      const name = data.submitterName || data.name;
      const email = data.submitterEmail || data.email;
      const styleGuideName = data.styleGuideName || "";
      const styleGuideUrl = data.styleGuideUrl || data.demoUrl || "";
      const category = data.category || "";
      const description = data.description || "";
      const technologies = data.technologies || data.toolsUsed || "";
      const liveExampleUrl = data.liveExampleUrl || "";
      const license = data.license || "";
      const additionalNotes = data.additionalNotes || "";

      console.log("Mapped fields:", {
        name,
        email,
        styleGuideName,
        styleGuideUrl,
        category,
        description: description.substring(0, 50) + "...",
        technologies,
        liveExampleUrl,
        license,
      });

      // Create record in Airtable
      console.log("📤 Attempting to create Airtable record...");
      console.log("Table name:", tableName);
      console.log("Base ID:", process.env.AIRTABLE_BASE_ID?.substring(0, 8) + "...");

      // Prepare fields matching form data structure
      const airtableFields = {
        "Confirmation Number": confirmationNumber,
        Status: "pending",
        Name: name,
        Email: email,
        "Style Guide Name": styleGuideName,
        "Style Guide URL": styleGuideUrl,
        Category: category,
        Description: description,
        Technologies: technologies,
        "Live Example URL": liveExampleUrl,
        License: license,
        "Additional Notes": additionalNotes,
        "Submitted Date": new Date().toISOString().split("T")[0],
      };

      console.log("Attempting to create with fields:", Object.keys(airtableFields));

      const airtableRecord = await base(tableName).create([
        {
          fields: airtableFields,
        },
      ]);

      console.log("✅ Airtable record created:", airtableRecord[0].id);

      // Send Discord notification (non-blocking)
      console.log("📨 Sending Discord notification...");
      const submissionData = {
        confirmationNumber,
        name: name,
        email: email,
        styleGuideName: styleGuideName,
        styleGuideUrl: styleGuideUrl,
        category: category,
      };
      sendDiscordNotification(submissionData).catch((err) => {
        console.error("Discord notification failed:", err.message);
      });

      console.log("✅ Submission completed successfully");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          confirmationNumber: confirmationNumber,
          message:
            "Your style guide submission has been received! Please save your confirmation number for tracking.",
        }),
      };
    } catch (error) {
      console.error("Airtable submission error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
      });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Failed to submit form. Please check that environment variables are configured.",
          details: error.message,
          hint:
            !process.env.AIRTABLE_API_TOKEN || !process.env.AIRTABLE_BASE_ID
              ? "Missing Airtable credentials"
              : "Check Netlify function logs for details",
        }),
      };
    }
  }

  // Handle GET - Retrieve submissions for review mode
  if (event.httpMethod === "GET") {
    try {
      const records = await base(tableName)
        .select({
          sort: [{ field: "Submitted Date", direction: "desc" }], // Updated field name
        })
        .all();

      const submissions = records.map((record) => ({
        id: record.id,
        confirmationNumber: record.fields["Confirmation Number"],
        status: record.fields.Status || "pending",
        name: record.fields.Name,
        email: record.fields.Email,
        styleGuideName: record.fields["Style Guide Name"],
        styleGuideUrl: record.fields["Style Guide URL"],
        category: record.fields.Category,
        description: record.fields.Description,
        technologies: record.fields.Technologies,
        liveExampleUrl: record.fields["Live Example URL"],
        license: record.fields.License,
        additionalNotes: record.fields["Additional Notes"],
        submittedDate: record.fields["Submitted Date"], // Updated field name
        reviewDate: record.fields["Review Date"],
        reviewNotes: record.fields["Review Notes"],
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          submissions: submissions,
          count: submissions.length,
        }),
      };
    } catch (error) {
      console.error("Airtable fetch error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Failed to retrieve submissions",
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
