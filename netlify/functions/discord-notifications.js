/**
 * Discord Integration Module
 * Sends notifications to Discord channels for submissions and approvals
 */

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
// const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN; // Reserved for future use

/**
 * Send submission notification to Discord
 */
export async function notifySubmission(submission) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log("Discord webhook not configured, skipping notification");
    return true;
  }

  try {
    const embed = {
      title: "📝 New Gallery Submission",
      color: 3447003, // Blue
      fields: [
        {
          name: "Submitter",
          value: submission.submitterName,
          inline: true,
        },
        {
          name: "Email",
          value: `[${submission.submitterEmail}](mailto:${submission.submitterEmail})`,
          inline: true,
        },
        {
          name: "Project URL",
          value: `[View Project](${submission.url})`,
          inline: false,
        },
        {
          name: "Description",
          value:
            submission.description.substring(0, 200) +
            (submission.description.length > 200 ? "..." : ""),
          inline: false,
        },
        {
          name: "Status",
          value: "Awaiting Review",
          inline: true,
        },
        {
          name: "Submitted",
          value: new Date(submission.submittedAt).toLocaleString(),
          inline: true,
        },
      ],
      footer: {
        text: "Design Gallery | Submission Management System",
        icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
      },
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "@here New submission received!",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord notification failed: ${response.statusText}`);
    }

    console.log("Discord notification sent successfully");
    return true;
  } catch (error) {
    console.error("Discord notification error:", error);
    return false;
  }
}

/**
 * Send approval notification to Discord
 */
export async function notifyApproval(submission) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log("Discord webhook not configured, skipping notification");
    return true;
  }

  try {
    const embed = {
      title: "✅ Submission Approved",
      color: 3066993, // Green
      fields: [
        {
          name: "Submitter",
          value: submission.submitterName,
          inline: true,
        },
        {
          name: "Email",
          value: `[${submission.submitterEmail}](mailto:${submission.submitterEmail})`,
          inline: true,
        },
        {
          name: "Project URL",
          value: `[View Project](${submission.url})`,
          inline: false,
        },
        {
          name: "Now Live In Gallery",
          value: "This submission is now visible in the public gallery",
          inline: false,
        },
        {
          name: "Approved",
          value: new Date(submission.reviewedAt).toLocaleString(),
          inline: true,
        },
      ],
      footer: {
        text: "Design Gallery | Submission Management System",
        icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
      },
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "@here Submission approved and published!",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord notification failed: ${response.statusText}`);
    }

    console.log("Discord approval notification sent successfully");
    return true;
  } catch (error) {
    console.error("Discord notification error:", error);
    return false;
  }
}

/**
 * Send rejection notification to Discord
 */
export async function notifyRejection(submission, reason = "Does not meet guidelines") {
  if (!DISCORD_WEBHOOK_URL) {
    console.log("Discord webhook not configured, skipping notification");
    return true;
  }

  try {
    const embed = {
      title: "❌ Submission Rejected",
      color: 15158332, // Red
      fields: [
        {
          name: "Submitter",
          value: submission.submitterName,
          inline: true,
        },
        {
          name: "Email",
          value: `[${submission.submitterEmail}](mailto:${submission.submitterEmail})`,
          inline: true,
        },
        {
          name: "Reason",
          value: reason,
          inline: false,
        },
        {
          name: "Project URL",
          value: `[View Project](${submission.url})`,
          inline: false,
        },
        {
          name: "Rejected",
          value: new Date(submission.reviewedAt).toLocaleString(),
          inline: true,
        },
      ],
      footer: {
        text: "Design Gallery | Submission Management System",
        icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
      },
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "Submission rejected",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord notification failed: ${response.statusText}`);
    }

    console.log("Discord rejection notification sent successfully");
    return true;
  } catch (error) {
    console.error("Discord notification error:", error);
    return false;
  }
}

export default {
  notifySubmission,
  notifyApproval,
  notifyRejection,
};
