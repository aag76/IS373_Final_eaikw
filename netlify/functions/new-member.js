const crypto = require("crypto");
const Airtable = require("airtable");

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(
  process.env.AIRTABLE_BASE_ID
);
const tableName = "Members"; // Your table name in Airtable

// Discord webhook URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_INTRODUCTIONS;

// Send Discord notification
async function sendDiscordNotification(member) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log("Discord webhook not configured, skipping notification");
    return;
  }

  try {
    const embed = {
      title: "👋 New Member Joined!",
      color: 5763719, // Purple
      description: "Welcome a new member to the Design Gallery community!",
      fields: [
        {
          name: "👤 Name",
          value: member.name,
          inline: true,
        },
        {
          name: "📧 Email",
          value: member.email,
          inline: true,
        },
        {
          name: "🎨 Interests",
          value: member.interests || "Not specified",
          inline: false,
        },
        {
          name: "💼 Role/Title",
          value: member.role || "Not specified",
          inline: true,
        },
        {
          name: "🌐 Website",
          value: member.website || "Not provided",
          inline: true,
        },
        {
          name: "🎫 Member ID",
          value: `\`${member.memberId}\``,
          inline: true,
        },
        {
          name: "📅 Joined",
          value: new Date().toLocaleString(),
          inline: true,
        },
      ],
      footer: {
        text: "Design Gallery - Community",
      },
      timestamp: new Date().toISOString(),
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "🎊 **Welcome our newest member!** Say hi! 👋",
        embeds: [embed],
      }),
    });

    console.log("Discord notification sent successfully");
  } catch (error) {
    console.error("Discord notification failed:", error);
    // Don't fail the registration if Discord notification fails
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

  // Handle POST - Register new member
  if (event.httpMethod === "POST") {
    try {
      const data = JSON.parse(event.body);

      // Generate member ID
      const memberId = "MBR-" + crypto.randomBytes(4).toString("hex").toUpperCase();

      // Create record in Airtable
      await base(tableName).create([
        {
          fields: {
            MemberId: memberId,
            Status: "active",
            Name: data.name,
            Email: data.email,
            Role: data.role || "",
            Interests: data.interests || "",
            Website: data.website || "",
            Bio: data.bio || "",
            JoinedDate: new Date().toISOString(),
          },
        },
      ]);

      // Send Discord notification (non-blocking)
      const memberData = {
        memberId,
        name: data.name,
        email: data.email,
        role: data.role,
        interests: data.interests,
        website: data.website,
      };
      sendDiscordNotification(memberData).catch(console.error);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          memberId: memberId,
          message: "Welcome to the Design Gallery community! Your member ID has been created.",
        }),
      };
    } catch (error) {
      console.error("Airtable member registration error:", error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Invalid member data",
          details: error.message,
        }),
      };
    }
  }

  // Handle GET - Retrieve members
  if (event.httpMethod === "GET") {
    try {
      const records = await base(tableName)
        .select({
          sort: [{ field: "JoinedDate", direction: "desc" }],
        })
        .all();

      const members = records.map((record) => ({
        id: record.id,
        memberId: record.fields.MemberId,
        status: record.fields.Status || "active",
        name: record.fields.Name,
        email: record.fields.Email,
        role: record.fields.Role,
        interests: record.fields.Interests,
        website: record.fields.Website,
        bio: record.fields.Bio,
        joinedDate: record.fields.JoinedDate,
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          members: members,
          count: members.length,
        }),
      };
    } catch (error) {
      console.error("Airtable fetch error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Failed to retrieve members",
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
