const crypto = require("crypto");
const Airtable = require("airtable");

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(
  process.env.AIRTABLE_BASE_ID
);
const tableName = "EventRegistrations"; // Your table name in Airtable

// Discord webhook URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_EVENTS;

// Send Discord notification
async function sendDiscordNotification(registration) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log("Discord webhook not configured, skipping notification");
    return;
  }

  try {
    const embed = {
      title: "📅 New Event Registration!",
      color: 15844367, // Gold/Yellow
      description: "Someone just registered for an event.",
      fields: [
        {
          name: "🎯 Event Name",
          value: registration.eventName || "Untitled Event",
          inline: false,
        },
        {
          name: "👤 Registrant",
          value: registration.name,
          inline: true,
        },
        {
          name: "📧 Email",
          value: registration.email,
          inline: true,
        },
        {
          name: "📱 Contact",
          value: registration.phone || "Not provided",
          inline: true,
        },
        {
          name: "🎫 Registration Number",
          value: `\`${registration.registrationNumber}\``,
          inline: true,
        },
        {
          name: "📅 Registered",
          value: new Date().toLocaleString(),
          inline: true,
        },
      ],
      footer: {
        text: "Design Gallery - Event Registration System",
      },
      timestamp: new Date().toISOString(),
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "🎉 **New event registration!**",
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

  // Handle POST - Register for event
  if (event.httpMethod === "POST") {
    try {
      const data = JSON.parse(event.body);

      // Generate registration number
      const registrationNumber = "EVT-" + crypto.randomBytes(4).toString("hex").toUpperCase();

      // Create record in Airtable
      await base(tableName).create([
        {
          fields: {
            RegistrationNumber: registrationNumber,
            Status: "confirmed",
            Name: data.name,
            Email: data.email,
            Phone: data.phone || "",
            EventName: data.eventName,
            EventDate: data.eventDate || "",
            AdditionalNotes: data.notes || "",
            RegisteredDate: new Date().toISOString(),
          },
        },
      ]);

      // Send Discord notification (non-blocking)
      const registrationData = {
        registrationNumber,
        name: data.name,
        email: data.email,
        phone: data.phone,
        eventName: data.eventName,
      };
      sendDiscordNotification(registrationData).catch(console.error);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          registrationNumber: registrationNumber,
          message:
            "Your event registration has been confirmed! Please save your registration number.",
        }),
      };
    } catch (error) {
      console.error("Airtable registration error:", error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Invalid registration data",
          details: error.message,
        }),
      };
    }
  }

  // Handle GET - Retrieve registrations
  if (event.httpMethod === "GET") {
    try {
      const records = await base(tableName)
        .select({
          sort: [{ field: "RegisteredDate", direction: "desc" }],
        })
        .all();

      const registrations = records.map((record) => ({
        id: record.id,
        registrationNumber: record.fields.RegistrationNumber,
        status: record.fields.Status || "confirmed",
        name: record.fields.Name,
        email: record.fields.Email,
        phone: record.fields.Phone,
        eventName: record.fields.EventName,
        eventDate: record.fields.EventDate,
        notes: record.fields.AdditionalNotes,
        registeredDate: record.fields.RegisteredDate,
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          registrations: registrations,
          count: registrations.length,
        }),
      };
    } catch (error) {
      console.error("Airtable fetch error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Failed to retrieve registrations",
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
