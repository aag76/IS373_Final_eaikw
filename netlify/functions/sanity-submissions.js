import sanityClient from "@sanity/client";
import { syncSubmissionToAirtable } from "./airtable-crm.js";

const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2023-12-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT",
  "Content-Type": "application/json",
};

/**
 * Create a new gallery submission in Sanity
 */
export async function createSubmission(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log('📝 Sanity submission request:', {
      method: event.httpMethod,
      headers: event.headers,
      queryParams: event.queryStringParameters
    });
    console.log('Raw body:', event.body);

    const data = JSON.parse(event.body);
    console.log('Parsed data:', data);

    // Validate required fields
    const requiredFields = ["submitterName", "submitterEmail", "url", "description"];
    const missing = requiredFields.filter((field) => !data[field]);
    if (missing.length > 0) {
      console.log('❌ Validation failed. Missing fields:', missing);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }),
      };
    }
    console.log('✅ Validation passed');

    // Create submission document in Sanity
    console.log('📤 Creating Sanity document...');
    const submission = await client.create({
      _type: "gallerySubmission",
      submitterName: data.submitterName,
      submitterEmail: data.submitterEmail,
      url: data.url,
      description: data.description,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
    console.log('✅ Sanity document created:', submission._id);

    // Call Discord webhook if configured
    if (process.env.DISCORD_WEBHOOK_URL) {
      console.log('📨 Sending Discord notification...');
      await notifyDiscord(submission, "submitted");
    } else {
      console.log('ℹ️ Discord webhook not configured, skipping notification');
    }

    console.log('✅ Submission completed successfully');

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        submission: {
          id: submission._id,
          status: submission.status,
          submittedAt: submission.submittedAt,
        },
      }),
    };
  } catch (error) {
    console.error('❌ Submission error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    });
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: "Failed to create submission",
        details: error.message 
      }),
    };
  }
}

/**
 * Get all approved submissions
 */
export async function getApprovedSubmissions(_event) {
  try {
    const submissions = await client.fetch(
      '*[_type == "gallerySubmission" && status == "approved"] | order(submittedAt desc)'
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ submissions }),
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to fetch submissions" }),
    };
  }
}

/**
 * Get submissions for review (instructor panel)
 */
export async function getSubmissionsForReview(event) {
  // Verify authorization
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (authHeader !== `Bearer ${process.env.REVIEW_API_TOKEN}`) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  try {
    const submissions = await client.fetch(
      `*[_type == "gallerySubmission"] | order(submittedAt desc) {
        _id,
        submitterName,
        submitterEmail,
        url,
        description,
        status,
        submittedAt,
        reviewNotes,
        reviewedAt,
        "screenshot": screenshot.asset->url
      }`
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ submissions }),
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to fetch submissions" }),
    };
  }
}

/**
 * Update submission status (approve/reject)
 */
export async function updateSubmissionStatus(event) {
  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Verify authorization
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (authHeader !== `Bearer ${process.env.REVIEW_API_TOKEN}`) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { submissionId, status, reviewNotes } = data;

    if (!submissionId || !status) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing submissionId or status" }),
      };
    }

    // Fetch current document to detect no-op and ensure idempotency
    const current = await client.getDocument(submissionId);
    if (!current) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Submission not found" }),
      };
    }

    if (current.status === status && (reviewNotes || "") === (current.reviewNotes || "")) {
      // No change; idempotent-safe
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, message: "No changes" }),
      };
    }

    // Update submission in Sanity
    const updated = await client
      .patch(submissionId)
      .set({
        status,
        reviewNotes: reviewNotes || "",
        reviewedAt: new Date().toISOString(),
      })
      .commit();

    // Sync to Airtable (best-effort: log failures but do not fail the request)
    try {
      await syncSubmissionToAirtable(updated);
    } catch (err) {
      console.error("Airtable sync failed (non-fatal):", err);
    }

    // Send Discord notification for approvals (best-effort)
    if (status === "approved" && process.env.DISCORD_WEBHOOK_URL) {
      try {
        const submission = await client.getDocument(submissionId);
        await notifyDiscord(submission, "approved");
      } catch (err) {
        console.error("Discord notify failed (non-fatal):", err);
      }
    }

    // Trigger site rebuild via build hook if configured
    const buildHook =
      process.env.ELEVENTY_BUILD_HOOK ||
      process.env.NETLIFY_BUILD_HOOK ||
      process.env.BUILD_HOOK_URL;
    if (buildHook) {
      try {
        await fetch(buildHook, { method: "POST" });
        console.log("Triggered build hook");
      } catch (err) {
        console.error("Build hook trigger failed (non-fatal):", err);
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, submission: updated }),
    };
  } catch (error) {
    console.error("Update error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to update submission" }),
    };
  }
}

/**
 * Send Discord notification
 */
async function notifyDiscord(submission, event) {
  const maxAttempts = 3;
  const embed = {
    title: event === "submitted" ? "📝 New Gallery Submission" : "✅ Submission Approved",
    color: event === "submitted" ? 3447003 : 3066993,
    fields: [
      { name: "Submitter", value: submission.submitterName || "(unknown)", inline: true },
      { name: "Design", value: submission.designStyle?.title || "(none)", inline: true },
      { name: "Demo", value: submission.url || "(none)", inline: true },
      { name: "Status", value: submission.status || event },
    ],
    timestamp: new Date().toISOString(),
  };

  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      attempt++;
      const res = await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });
      if (res.ok) {
        return;
      }
      const body = await res.text();
      console.error(`Discord webhook responded ${res.status}: ${body}`);
      // rate limited? inspect headers
      const retryAfter = res.headers?.get?.("retry-after");
      if (retryAfter) {
        const wait = Number(retryAfter) * 1000 || 1000;
        await new Promise((r) => setTimeout(r, wait));
      } else {
        await new Promise((r) => setTimeout(r, 200 * attempt));
      }
    } catch (error) {
      console.error("Discord notification attempt failed:", error);
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  console.error("Discord notification failed after retries (non-fatal)");
}
