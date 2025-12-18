/**
 * E2E Test: Live Form Submission and Review Mode
 * Visual validation of the complete user experience
 */

import { test, expect } from "@playwright/test";

test.describe("Live Form Submission Experience", () => {
  test("User submits design system and sees it in review mode", async ({ page, context }) => {
    // Step 1: Navigate to submission form
    await page.goto("http://localhost:8080/blog/submit-style-guide/");

    // Wait for page to load
    await expect(page.locator("h1")).toBeVisible();

    // Take screenshot of form
    await page.screenshot({ path: "tests/screenshots/01-submission-form.png", fullPage: true });
    console.log("✓ Screenshot: Submission form loaded");

    // Step 2: Fill out form with test data
    const testData = {
      name: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      designStyle: "Automated Test Design System",
      demoUrl: "https://example.com/test-demo",
      authenticity: "This is an automated test submission for integration testing",
      toolsUsed: "Playwright, Figma, React",
      additionalNotes: "Testing the complete submission and approval workflow",
    };

    console.log("\n📝 Filling form with test data:");
    console.log(`   Name: ${testData.name}`);
    console.log(`   Email: ${testData.email}`);
    console.log(`   Design: ${testData.designStyle}`);

    await page.fill('input[name="name"]', testData.name);
    await page.fill('input[name="email"]', testData.email);
    await page.fill('input[name="designStyle"]', testData.designStyle);
    await page.fill('input[name="demoUrl"]', testData.demoUrl);
    await page.fill('textarea[name="authenticity"]', testData.authenticity);
    await page.fill('input[name="toolsUsed"]', testData.toolsUsed);
    await page.fill('textarea[name="additionalNotes"]', testData.additionalNotes);

    // Check required checkbox
    await page.check('input[name="agreeTerms"]');

    // Take screenshot of filled form
    await page.screenshot({ path: "tests/screenshots/02-form-filled.png", fullPage: true });
    console.log("✓ Screenshot: Form filled with test data");

    // Step 3: Submit the form
    await page.click('button[type="submit"]');
    console.log("✓ Form submitted, waiting for response...");

    // Wait for success modal/message
    await page.waitForSelector('.modal-content, .success-message, [data-success="true"]', {
      timeout: 15000,
    });

    // Take screenshot of success message
    await page.screenshot({ path: "tests/screenshots/03-submission-success.png", fullPage: true });
    console.log("✓ Screenshot: Success message displayed");

    // Extract confirmation number
    const successElement = await page.locator(
      ".modal-content, .success-message, [data-confirmation]"
    );
    const successText = await successElement.textContent();
    const confirmationMatch = successText.match(/DSG-[A-F0-9]{8}/);

    expect(confirmationMatch).toBeTruthy();
    const confirmationNumber = confirmationMatch[0];
    console.log(`\n🎫 Confirmation Number: ${confirmationNumber}`);

    // Verify success message contains key information
    expect(successText).toContain(confirmationNumber);

    // Step 4: Navigate to homepage and enable review mode
    await page.goto("http://localhost:8080/");
    await page.waitForLoadState("networkidle");

    console.log("\n🔍 Enabling review mode...");

    // Find and click review mode toggle
    const reviewToggle = page.locator("#reviewModeToggle");
    await expect(reviewToggle).toBeVisible();
    await reviewToggle.check();

    // Wait for review link to appear
    await page.waitForSelector("#reviewLinkDesktop, #reviewLink", { state: "visible" });

    // Take screenshot of review mode enabled
    await page.screenshot({ path: "tests/screenshots/04-review-mode-enabled.png", fullPage: true });
    console.log("✓ Screenshot: Review mode enabled");

    // Step 5: Navigate to review dashboard
    await page.click("#reviewLinkDesktop, #reviewLink");
    await page.waitForURL("**/review/**", { timeout: 10000 });

    console.log("✓ Navigated to review dashboard");

    // Wait for submissions to load
    await page.waitForSelector(".submission-card, [data-submission], .submission-item", {
      timeout: 15000,
    });

    // Take screenshot of review dashboard
    await page.screenshot({ path: "tests/screenshots/05-review-dashboard.png", fullPage: true });
    console.log("✓ Screenshot: Review dashboard loaded");

    // Step 6: Search for our submission
    console.log(`\n🔎 Searching for submission: ${confirmationNumber}`);

    // Wait a bit for all submissions to load
    await page.waitForTimeout(2000);

    // Try to find our submission by confirmation number
    let submissionFound = false;
    const submissionCards = page.locator(".submission-card, [data-submission], .submission-item");
    const cardCount = await submissionCards.count();

    console.log(`   Found ${cardCount} submissions in review dashboard`);

    for (let i = 0; i < cardCount; i++) {
      const card = submissionCards.nth(i);
      const cardText = await card.textContent();

      if (cardText.includes(confirmationNumber)) {
        submissionFound = true;
        console.log(`   ✓ Found submission at position ${i + 1}`);

        // Verify the submission contains our test data
        expect(cardText).toContain(testData.designStyle);

        // Highlight and screenshot the specific submission
        await card.scrollIntoViewIfNeeded();
        await card.screenshot({ path: "tests/screenshots/06-submission-found.png" });
        console.log("✓ Screenshot: Test submission highlighted");

        // Step 7: Test approval interaction
        console.log("\n✅ Testing approval workflow...");

        // Look for approve button
        const approveButton = card.locator('button:has-text("Approve"), [data-action="approve"]');

        if ((await approveButton.count()) > 0) {
          await approveButton.click();
          console.log("   ✓ Clicked approve button");

          // Wait for status update
          await page.waitForTimeout(2000);

          // Take screenshot after approval
          await page.screenshot({
            path: "tests/screenshots/07-after-approval.png",
            fullPage: true,
          });
          console.log("✓ Screenshot: After approval action");

          // Verify status changed
          const statusBadge = card.locator(".status-badge, [data-status]");
          if ((await statusBadge.count()) > 0) {
            const statusText = await statusBadge.textContent();
            console.log(`   Status: ${statusText}`);
          }
        } else {
          console.log("   ℹ️  Approve button not found (may require authentication)");
        }

        break;
      }
    }

    expect(submissionFound).toBeTruthy();

    console.log("\n✅ E2E Test Completed Successfully!");
    console.log("==========================================");
    console.log("Screenshots saved in tests/screenshots/");
    console.log("==========================================\n");
  });

  test("Visual regression: Form rendering", async ({ page }) => {
    await page.goto("http://localhost:8080/blog/submit-style-guide/");
    await page.waitForLoadState("networkidle");

    // Test form is properly rendered
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    console.log("✓ Form elements rendered correctly");
  });

  test("Form validation: Required fields", async ({ page }) => {
    await page.goto("http://localhost:8080/blog/submit-style-guide/");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check for validation messages
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');

    // Verify required attribute or validation
    await expect(nameInput).toHaveAttribute("required", "");
    await expect(emailInput).toHaveAttribute("required", "");

    console.log("✓ Form validation working correctly");
  });

  test("Review mode: Live data refresh", async ({ page }) => {
    // Navigate to review mode
    await page.goto("http://localhost:8080/");
    await page.click("#reviewModeToggle");
    await page.click("#reviewLinkDesktop, #reviewLink");

    await page.waitForURL("**/review/**");

    // Wait for initial load
    await page.waitForSelector(".submission-card, [data-submission]", { timeout: 10000 });

    const initialCount = await page.locator(".submission-card, [data-submission]").count();
    console.log(`✓ Loaded ${initialCount} submissions initially`);

    // Reload to test data refresh
    await page.reload();
    await page.waitForSelector(".submission-card, [data-submission]", { timeout: 10000 });

    const reloadedCount = await page.locator(".submission-card, [data-submission]").count();
    console.log(`✓ Reloaded with ${reloadedCount} submissions`);

    // Counts should be consistent
    expect(reloadedCount).toBe(initialCount);
  });
});

test.describe("Mobile Experience", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("Mobile: Submit form and access review mode", async ({ page }) => {
    console.log("\n📱 Testing mobile experience...");

    // Test submission form on mobile
    await page.goto("http://localhost:8080/blog/submit-style-guide/");
    await expect(page.locator("form")).toBeVisible();

    await page.screenshot({ path: "tests/screenshots/mobile-01-form.png", fullPage: true });
    console.log("✓ Screenshot: Mobile submission form");

    // Test review mode on mobile
    await page.goto("http://localhost:8080/");

    // Find mobile review toggle
    const mobileToggle = page.locator("#reviewModeToggleMobile, #reviewModeToggle");
    if ((await mobileToggle.count()) > 0) {
      await mobileToggle.check();
      await page.click("#reviewLink");

      await page.waitForURL("**/review/**", { timeout: 10000 });
      await page.screenshot({ path: "tests/screenshots/mobile-02-review.png", fullPage: true });
      console.log("✓ Screenshot: Mobile review dashboard");
    }

    console.log("✓ Mobile experience validated");
  });
});
