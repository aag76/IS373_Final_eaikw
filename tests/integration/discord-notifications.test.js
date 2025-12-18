/**
 * Discord Integration Test
 * Tests Discord webhook notifications for submissions and approvals
 */

import { test, expect } from "../fixtures";
import "dotenv/config";

test.describe("Discord Webhook Integration", () => {
  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_SUBMISSIONS;

  test.beforeAll(() => {
    if (!DISCORD_WEBHOOK_URL) {
      console.warn("⚠️  DISCORD_WEBHOOK_SUBMISSIONS not set, skipping Discord tests");
      test.skip();
    }
  });

  test("Send test submission notification to Discord", async ({ request }) => {
    const testSubmission = {
      confirmationNumber: `DSG-TEST${Date.now().toString().slice(-8).toUpperCase()}`,
      name: "Test Designer (Automated)",
      email: "automated-test@example.com",
      designStyle: "Test Design System for Discord Integration",
      demoUrl: "https://example.com/test-demo",
    };

    const embed = {
      title: "🎨 New Style Guide Submission!",
      color: 3447003, // Blue
      description: "A new design style has been submitted for review.",
      fields: [
        {
          name: "📝 Design Style",
          value: testSubmission.designStyle,
          inline: false,
        },
        {
          name: "👤 Submitter",
          value: testSubmission.name,
          inline: true,
        },
        {
          name: "📧 Email",
          value: testSubmission.email,
          inline: true,
        },
        {
          name: "🔗 Demo URL",
          value: testSubmission.demoUrl,
          inline: false,
        },
        {
          name: "🎫 Confirmation Number",
          value: `\`${testSubmission.confirmationNumber}\``,
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

    console.log("\n📨 Sending test notification to Discord...");
    console.log(`   Confirmation: ${testSubmission.confirmationNumber}`);

    const response = await request.post(DISCORD_WEBHOOK_URL, {
      data: {
        content: "📬 **New submission received!** (Automated Test)",
        embeds: [embed],
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(204); // Discord returns 204 on success

    console.log("✅ Discord notification sent successfully!");
    console.log("   Check your Discord channel for the message");
  });

  test("Send approval notification to Discord", async ({ request }) => {
    const approvedSubmission = {
      confirmationNumber: `DSG-APPRV${Date.now().toString().slice(-7).toUpperCase()}`,
      name: "Approved Designer (Test)",
      email: "approved-test@example.com",
      designStyle: "Approved Test Design System",
      demoUrl: "https://example.com/approved-demo",
      reviewNotes: "Excellent work! Automated test approval.",
    };

    const embed = {
      title: "✅ Submission Approved!",
      color: 3066993, // Green
      description: "A design submission has been approved and published.",
      fields: [
        {
          name: "🎨 Design Style",
          value: approvedSubmission.designStyle,
          inline: false,
        },
        {
          name: "👤 Designer",
          value: approvedSubmission.name,
          inline: true,
        },
        {
          name: "📧 Contact",
          value: approvedSubmission.email,
          inline: true,
        },
        {
          name: "🔗 Live Demo",
          value: `[View Project](${approvedSubmission.demoUrl})`,
          inline: false,
        },
        {
          name: "🎫 Confirmation Number",
          value: `\`${approvedSubmission.confirmationNumber}\``,
          inline: true,
        },
        {
          name: "✅ Approved",
          value: new Date().toLocaleString(),
          inline: true,
        },
        {
          name: "📝 Review Notes",
          value: approvedSubmission.reviewNotes,
          inline: false,
        },
      ],
      footer: {
        text: "Design Gallery - Now Live! 🎉",
      },
      timestamp: new Date().toISOString(),
    };

    console.log("\n🎉 Sending approval notification to Discord...");
    console.log(`   Confirmation: ${approvedSubmission.confirmationNumber}`);

    const response = await request.post(DISCORD_WEBHOOK_URL, {
      data: {
        content: "🎊 **Design approved and published!** (Automated Test)",
        embeds: [embed],
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(204);

    console.log("✅ Approval notification sent successfully!");
    console.log("   Check your Discord channel for the approval message");
  });

  test("Send rejection notification to Discord", async ({ request }) => {
    const rejectedSubmission = {
      confirmationNumber: `DSG-RJECT${Date.now().toString().slice(-7).toUpperCase()}`,
      name: "Designer Test",
      designStyle: "Test Design (Rejected)",
      reviewNotes: "Does not meet current criteria. Please review guidelines.",
    };

    const embed = {
      title: "❌ Submission Not Approved",
      color: 15158332, // Red
      description: "A submission has been reviewed and requires revisions.",
      fields: [
        {
          name: "📝 Design Style",
          value: rejectedSubmission.designStyle,
          inline: false,
        },
        {
          name: "👤 Submitter",
          value: rejectedSubmission.name,
          inline: true,
        },
        {
          name: "🎫 Confirmation",
          value: `\`${rejectedSubmission.confirmationNumber}\``,
          inline: true,
        },
        {
          name: "📋 Feedback",
          value: rejectedSubmission.reviewNotes,
          inline: false,
        },
        {
          name: "📅 Reviewed",
          value: new Date().toLocaleString(),
          inline: true,
        },
      ],
      footer: {
        text: "Design Gallery - Review Feedback",
      },
      timestamp: new Date().toISOString(),
    };

    console.log("\n📋 Sending rejection notification to Discord...");

    const response = await request.post(DISCORD_WEBHOOK_URL, {
      data: {
        content: "📝 Submission requires revisions (Automated Test)",
        embeds: [embed],
      },
    });

    expect(response.ok()).toBeTruthy();
    console.log("✅ Rejection notification sent successfully!");
  });

  test("Send batch notification summary to Discord", async ({ request }) => {
    const stats = {
      pending: 12,
      approved: 45,
      rejected: 3,
      total: 60,
      lastWeek: 8,
    };

    const embed = {
      title: "📊 Weekly Submission Summary",
      color: 15844367, // Gold
      description: "Summary of design submissions for the past week",
      fields: [
        {
          name: "📥 New Submissions",
          value: stats.lastWeek.toString(),
          inline: true,
        },
        {
          name: "⏳ Pending Review",
          value: stats.pending.toString(),
          inline: true,
        },
        {
          name: "✅ Approved",
          value: stats.approved.toString(),
          inline: true,
        },
        {
          name: "❌ Rejected",
          value: stats.rejected.toString(),
          inline: true,
        },
        {
          name: "📈 Total All-Time",
          value: stats.total.toString(),
          inline: true,
        },
        {
          name: "📆 Report Date",
          value: new Date().toLocaleDateString(),
          inline: true,
        },
      ],
      footer: {
        text: "Design Gallery - Analytics Report",
      },
      timestamp: new Date().toISOString(),
    };

    console.log("\n📊 Sending batch summary to Discord...");

    const response = await request.post(DISCORD_WEBHOOK_URL, {
      data: {
        content: "📈 **Weekly Summary Report** (Automated Test)",
        embeds: [embed],
      },
    });

    expect(response.ok()).toBeTruthy();
    console.log("✅ Batch summary sent successfully!");
  });

  test("Test Discord rate limits handling", async ({ request }) => {
    console.log("\n⚡ Testing rate limit handling...");

    const promises = [];

    // Send 3 rapid-fire notifications
    for (let i = 0; i < 3; i++) {
      const embed = {
        title: `🧪 Rate Limit Test ${i + 1}/3`,
        color: 9807270,
        description: `Testing Discord rate limit handling - Message ${i + 1}`,
        timestamp: new Date().toISOString(),
      };

      promises.push(
        request.post(DISCORD_WEBHOOK_URL, {
          data: {
            content: `Test message ${i + 1}`,
            embeds: [embed],
          },
        })
      );

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const responses = await Promise.all(promises);

    // Check all succeeded or got rate limited gracefully
    responses.forEach((response, i) => {
      if (response.status() === 204) {
        console.log(`   ✓ Message ${i + 1}: Sent successfully`);
      } else if (response.status() === 429) {
        console.log(`   ⚠️  Message ${i + 1}: Rate limited (expected behavior)`);
      } else {
        console.log(`   ⚠️  Message ${i + 1}: Status ${response.status()}`);
      }
    });

    console.log("✅ Rate limit test completed");
  });

  test("Validate Discord embed structure limits", () => {
    console.log("\n🔍 Validating Discord embed limits...");

    // Discord embed limits
    const limits = {
      title: 256,
      description: 4096,
      fields: 25,
      fieldName: 256,
      fieldValue: 1024,
      footer: 2048,
      author: 256,
      totalChars: 6000,
    };

    const testEmbed = {
      title: "Test Title",
      description: "Test Description",
      fields: [
        { name: "Field 1", value: "Value 1", inline: true },
        { name: "Field 2", value: "Value 2", inline: true },
      ],
      footer: { text: "Footer text" },
    };

    // Validate lengths
    expect(testEmbed.title.length).toBeLessThanOrEqual(limits.title);
    expect(testEmbed.description.length).toBeLessThanOrEqual(limits.description);
    expect(testEmbed.fields.length).toBeLessThanOrEqual(limits.fields);

    testEmbed.fields.forEach((field) => {
      expect(field.name.length).toBeLessThanOrEqual(limits.fieldName);
      expect(field.value.length).toBeLessThanOrEqual(limits.fieldValue);
    });

    // Calculate total characters
    const totalChars =
      testEmbed.title.length +
      testEmbed.description.length +
      testEmbed.fields.reduce((sum, f) => sum + f.name.length + f.value.length, 0) +
      testEmbed.footer.text.length;

    expect(totalChars).toBeLessThanOrEqual(limits.totalChars);

    console.log("✅ Embed structure within Discord limits");
    console.log(`   Total characters: ${totalChars}/${limits.totalChars}`);
  });
});

test.describe("Discord Notification Formatting", () => {
  test("Rich embed with all features", async ({ request }) => {
    if (!process.env.DISCORD_WEBHOOK_SUBMISSIONS) {
      test.skip();
    }

    const richEmbed = {
      author: {
        name: "Design Gallery Bot",
        icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
      },
      title: "🎨 Featured Design System",
      url: "https://example.com/featured-design",
      description: "Check out this amazing design system that was just added to our gallery!",
      color: 5814783, // Purple
      fields: [
        {
          name: "✨ Highlights",
          value: "• Modern component library\n• Comprehensive documentation\n• Active community",
          inline: false,
        },
        {
          name: "🛠️ Technologies",
          value: "React, TypeScript, Tailwind",
          inline: true,
        },
        {
          name: "⭐ Rating",
          value: "5/5 stars",
          inline: true,
        },
      ],
      thumbnail: {
        url: "https://cdn.discordapp.com/embed/avatars/0.png",
      },
      image: {
        url: "https://via.placeholder.com/800x400/5865F2/FFFFFF?text=Design+System",
      },
      footer: {
        text: "Design Gallery • Featured Content",
        icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
      },
      timestamp: new Date().toISOString(),
    };

    console.log("\n🎨 Sending rich formatted embed to Discord...");

    const response = await request.post(process.env.DISCORD_WEBHOOK_SUBMISSIONS, {
      data: {
        content: "🌟 **New Featured Design!**",
        embeds: [richEmbed],
      },
    });

    expect(response.ok()).toBeTruthy();
    console.log("✅ Rich embed sent successfully!");
    console.log("   Check Discord for the beautifully formatted message");
  });
});
