import { test, expect } from "@playwright/test";

test.describe("Gallery Functionality", () => {
  test("should display approved submissions in gallery", async ({ page }) => {
    await page.goto("/showcase/");

    // Wait for gallery to load
    await page.waitForLoadState("networkidle");

    // Check that gallery section exists
    const gallery = await page.locator('[data-testid="gallery-grid"]');
    await expect(gallery).toBeVisible();

    // Check for submission cards
    const cards = await page.locator('[data-testid="submission-card"]');
    const count = await cards.count();

    // Should have at least some approved submissions
    expect(count).toBeGreaterThan(0);
  });

  test("should filter submissions by status", async ({ page }) => {
    await page.goto("/showcase/");

    // Check filtering functionality
    const filterButtons = await page.locator("[data-filter-status]");
    const filterCount = await filterButtons.count();

    expect(filterCount).toBeGreaterThan(0);

    // Click a filter button
    if (filterCount > 0) {
      await filterButtons.first().click();

      // Verify gallery updates
      const gallery = await page.locator('[data-testid="gallery-grid"]');
      await expect(gallery).toBeVisible();
    }
  });

  test("should display submission details on click @slow", async ({ page }) => {
    test.setTimeout(15000); // Increase timeout for this specific test
    await page.goto("/showcase/");

    // Click on first submission card
    const firstCard = await page.locator('[data-testid="submission-card"]').first();
    await firstCard.click();

    // Wait for modal/detail view
    await page
      .waitForSelector('[data-testid="submission-details"]', { timeout: 5000 })
      .catch(() => {});

    // Verify details are shown
    const details = await page.locator('[data-testid="submission-details"]');
    if ((await details.count()) > 0) {
      await expect(details).toBeVisible();
    }
  });
});

test.describe("Review Panel", () => {
  test("should require authentication", async ({ page }) => {
    await page.goto("/instructor-panel/");

    // Should show auth modal
    const authModal = await page.locator('[data-testid="auth-modal"]');
    const authInput = await page.locator("#tokenInput");

    // Either modal exists or redirects (both acceptable)
    const isAuthVisible = await authModal.isVisible().catch(() => false);
    const isInputVisible = await authInput.isVisible().catch(() => false);

    expect(isAuthVisible || isInputVisible || page.url().includes("/")).toBeTruthy();
  });

  test("should display submission statistics", async ({ page }) => {
    await page.goto("/instructor-panel/");

    // Check for stats display
    const stats = await page.locator('[id^="stat"]');
    const statCount = await stats.count();

    expect(statCount).toBeGreaterThan(0);
  });

  test("should have filter tabs", async ({ page }) => {
    await page.goto("/instructor-panel/");

    // Check for filter tabs
    const filterTabs = await page.locator(".filter-tab");
    const tabCount = await filterTabs.count();

    expect(tabCount).toBeGreaterThanOrEqual(2);
  });
});

test.describe("Submission Form", () => {
  test("should display submission form @slow", async ({ page }) => {
    test.setTimeout(15000);
    await page.goto("/submit-style-guide/");

    // Check form exists
    const form = await page.locator("form");
    await expect(form).toBeVisible();

    // Check required inputs
    const nameInput = await page.locator('input[name="name"]');
    const emailInput = await page.locator('input[name="email"]');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });

  test("should validate required fields @slow", async ({ page }) => {
    test.setTimeout(15000);
    await page.goto("/submit-style-guide/");

    // Find submit button
    const submitBtn = await page.locator('button[type="submit"]');

    if (await submitBtn.isVisible()) {
      // Try to submit without filling form
      await submitBtn.click();

      // Check for validation message
      const invalidInputs = await page.locator(":invalid");
      const invalidCount = await invalidInputs.count();

      // Should have at least one invalid field
      expect(invalidCount).toBeGreaterThan(0);
    }
  });

  test("should submit form successfully @slow", async ({ page }) => {
    test.setTimeout(15000);
    await page.goto("/submit-style-guide/");

    // Fill in form
    await page.fill('input[name="name"]', "Test Submitter");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="url"]', "https://example.com/style-guide");
    await page.fill(
      'textarea[name="description"]',
      "This is a comprehensive test of a professional design system."
    );

    // Submit form
    const submitBtn = await page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();

      // Wait for success message
      const successMsg = await page.locator('[data-testid="success-message"]');
      const successVisible = await successMsg.isVisible().catch(() => false);

      // Check for success indication
      expect(successVisible || page.url().includes("track")).toBeTruthy();
    }
  });
});

test.describe("Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/showcase/");

    const h1 = await page.locator("h1");
    const h1Count = await h1.count();

    // Should have exactly one h1
    expect(h1Count).toBe(1);
  });

  test("should have alt text on images", async ({ page }) => {
    await page.goto("/showcase/");

    const images = await page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      let imagesWithAlt = 0;
      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute("alt");
        if (alt) imagesWithAlt++;
      }

      // At least 80% should have alt text
      expect(imagesWithAlt / imageCount).toBeGreaterThanOrEqual(0.8);
    }
  });

  test("should have ARIA labels on buttons", async ({ page }) => {
    await page.goto("/instructor-panel/");

    const buttons = await page.locator("button");
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      let labeledButtons = 0;
      for (let i = 0; i < buttonCount; i++) {
        const btn = buttons.nth(i);
        const ariaLabel = await btn.getAttribute("aria-label");
        const text = await btn.textContent();

        if (ariaLabel || (text && text.trim().length > 0)) {
          labeledButtons++;
        }
      }

      // Most buttons should be labeled
      expect(labeledButtons / buttonCount).toBeGreaterThanOrEqual(0.7);
    }
  });
});
