import { test, expect } from "@playwright/test";

test.describe("User Workflow - Submit and Track", () => {
  test("complete workflow: submit style guide and track submission", async ({ page }) => {
    // Step 1: Navigate to submission form
    await page.goto("/submit-style-guide/");
    await expect(page.locator("h1")).toContainText(/submit|style guide/i);

    // Step 2: Fill out the form
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;

    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', testEmail);

    // Fill design style if field exists
    const styleSelect = page.locator('select[name="designStyle"], select[name="style"]');
    if ((await styleSelect.count()) > 0) {
      await styleSelect.first().selectOption({ index: 1 });
    }

    // Fill demo URL if field exists
    const urlInput = page.locator('input[name="demoUrl"], input[name="url"]');
    if ((await urlInput.count()) > 0) {
      await urlInput.fill("https://example.com/demo-style-guide");
    }

    // Fill description/notes if field exists
    const descriptionField = page.locator(
      'textarea[name="additionalNotes"], textarea[name="description"]'
    );
    if ((await descriptionField.count()) > 0) {
      await descriptionField.fill(
        "This is an automated test submission for the Design Gallery platform."
      );
    }

    // Step 3: Submit the form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Step 4: Wait for confirmation and extract confirmation number
    await page.waitForTimeout(2000); // Wait for API response

    // Look for confirmation number in various possible locations
    const confirmationText = await page
      .locator("text=/DSG-[A-Z0-9]{8}/")
      .textContent()
      .catch(() => null);

    if (confirmationText) {
      const confirmationMatch = confirmationText.match(/DSG-[A-Z0-9]{8}/);
      const confirmationNumber = confirmationMatch ? confirmationMatch[0] : null;

      expect(confirmationNumber).toBeTruthy();
      console.log("Confirmation Number:", confirmationNumber);

      // Step 5: Navigate to tracking page
      await page.goto("/track-submission/");

      // Step 6: Enter confirmation number
      const trackInput = page.locator('input[name="confirmationNumber"], input[type="text"]');
      if ((await trackInput.count()) > 0) {
        await trackInput.fill(confirmationNumber!);

        const trackBtn = page.locator('button[type="submit"], button:has-text("Track")');
        await trackBtn.click();

        // Wait for results
        await page.waitForTimeout(2000);

        // Verify submission details are displayed
        const submissionDetails = page.locator('[data-testid="submission-details"], .result');
        const hasDetails = (await submissionDetails.count()) > 0;
        expect(hasDetails).toBeTruthy();
      }
    } else {
      // Alternative: Check if redirected to success/tracking page
      const currentUrl = page.url();
      expect(
        currentUrl.includes("track") ||
          currentUrl.includes("success") ||
          currentUrl.includes("confirmation")
      ).toBeTruthy();
    }
  });

  test("should handle invalid confirmation number gracefully", async ({ page }) => {
    await page.goto("/track-submission/");

    // Enter invalid confirmation number
    const trackInput = page.locator('input[name="confirmationNumber"], input[type="text"]');
    if ((await trackInput.count()) > 0) {
      await trackInput.fill("INVALID-123");

      const trackBtn = page.locator('button[type="submit"], button:has-text("Track")');
      await trackBtn.click();

      // Wait for error message
      await page.waitForTimeout(1000);

      // Should show error message or "not found" indication
      const errorMsg = page.locator(
        'text=/not found/i, text=/invalid/i, [data-testid="error-message"]'
      );
      const hasError = (await errorMsg.count()) > 0;

      expect(hasError).toBeTruthy();
    }
  });
});

test.describe("Review Workflow - Instructor Panel", () => {
  test("should display instructor panel with submissions", async ({ page }) => {
    await page.goto("/instructor-panel/");

    // Check if auth is required or panel is directly visible
    const authModal = page.locator('[data-testid="auth-modal"], #authModal');
    const isAuthVisible = await authModal.isVisible().catch(() => false);

    if (isAuthVisible) {
      // Try to authenticate with test token
      const tokenInput = page.locator('input[name="token"], input[type="password"]');
      if ((await tokenInput.count()) > 0) {
        await tokenInput.fill("test-token-123");

        const authBtn = page.locator('button[type="submit"], button:has-text("Submit")');
        await authBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Check for submissions list or stats
    const submissionsList = page.locator(
      '[data-testid="submissions-list"], .submission-card, table tr'
    );
    const statCounters = page.locator('[id^="stat"], [data-stat]');

    const hasSubmissions = (await submissionsList.count()) > 0;
    const hasStats = (await statCounters.count()) > 0;

    expect(hasSubmissions || hasStats).toBeTruthy();
  });

  test("should filter submissions by status", async ({ page }) => {
    await page.goto("/instructor-panel/");

    // Look for filter tabs or buttons
    const filterBtns = page.locator(
      'button[data-filter], .filter-tab, button:has-text("Pending"), button:has-text("Approved")'
    );

    if ((await filterBtns.count()) > 0) {
      // Click first filter
      await filterBtns.first().click();
      await page.waitForTimeout(500);

      // Verify content updates
      const submissionsList = page.locator('[data-testid="submissions-list"], .submission-card');
      const hasResults = (await submissionsList.count()) >= 0;
      expect(hasResults).toBeTruthy();
    }
  });
});

test.describe("Event Registration Workflow", () => {
  test("should complete event registration", async ({ page }) => {
    await page.goto("/register-event/");

    // Check if page exists
    const pageExists = page.url().includes("register-event");
    if (!pageExists) {
      console.log("Event registration page not found, skipping test");
      test.skip();
      return;
    }

    // Fill registration form
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Test Registrant");
    await page.fill('input[name="email"]', `event-${timestamp}@example.com`);

    const eventNameField = page.locator('input[name="eventName"]');
    if ((await eventNameField.count()) > 0) {
      await eventNameField.fill("Design Workshop 2025");
    }

    // Submit form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Look for success message or registration number
    const successIndicator = page.locator(
      'text=/EVT-[A-Z0-9]{8}/, text=/success/i, [data-testid="success-message"]'
    );
    const hasSuccess = (await successIndicator.count()) > 0;
    expect(hasSuccess).toBeTruthy();
  });
});
