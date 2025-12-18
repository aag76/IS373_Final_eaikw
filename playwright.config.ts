import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only - reduce retries */
  retries: process.env.CI ? 1 : 0,

  /* Use multiple workers for faster execution */
  workers: process.env.CI ? 2 : 4,

  /* Timeout settings - reduce from default 30s */
  timeout: 10 * 1000, // 10 seconds per test
  expect: {
    timeout: 5 * 1000, // 5 seconds for assertions
  },

  /* Grep - skip slow integration tests by default unless explicitly running them */
  grep: process.env.RUN_SLOW_TESTS ? undefined : /^(?!.*@slow)/,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:8765",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Screenshot only on failure */
    screenshot: "only-on-failure",

    /* Speed up navigation */
    navigationTimeout: 10 * 1000, // 10 seconds for page loads
    actionTimeout: 5 * 1000, // 5 seconds for actions (click, fill, etc.)
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { 
        ...devices["Desktop Chrome"],
        // Speed up by disabling video
        video: "off",
      },
      // Only run integration tests on desktop
      testMatch: /.*\.(spec|test)\.(ts|js)/,
    },

    {
      name: "mobile",
      use: { 
        ...devices["Pixel 5"],
        video: "off",
      },
      // Run only specific mobile tests, not all tests
      testMatch: /tests\/(visual\/responsive|homepage)\.spec\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run build && npx @11ty/eleventy --serve --port=8765",
    url: "http://localhost:8765",
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000, // Reduce from 120s to 60s
    stdout: "ignore", // Suppress build output noise
    stderr: "pipe",
  },
});
