# Integration Test Documentation

This directory contains comprehensive integration tests for the Design Gallery
submission workflow.

## Test Suites

### 1. Integration Tests (`integration/submission-workflow.test.js`)

Complete workflow testing from form submission to database storage and review
mode display.

**What it tests:**

- ✅ Form submission through UI
- ✅ Data persistence in Airtable
- ✅ Submission appearing in review mode
- ✅ Approval workflow
- ✅ Status updates in database
- ✅ API endpoint validation

**Run:**

```bash
npm run test:integration
```

### 2. E2E Tests (`e2e/live-submission.test.js`)

Visual end-to-end testing with screenshots at each step.

**What it tests:**

- ✅ Complete user journey with visual validation
- ✅ Form rendering and validation
- ✅ Success message display
- ✅ Review mode navigation
- ✅ Submission search and discovery
- ✅ Approval interactions
- ✅ Mobile responsive experience

**Run:**

```bash
npm run test:e2e
```

**Screenshots saved to:** `tests/screenshots/`

### 3. Discord Integration Tests (`integration/discord-notifications.test.js`)

Discord webhook testing for all notification types.

**What it tests:**

- ✅ New submission notifications
- ✅ Approval notifications
- ✅ Rejection feedback messages
- ✅ Batch summary reports
- ✅ Rate limit handling
- ✅ Embed formatting and limits
- ✅ Rich media embeds

**Run:**

```bash
npm run test:discord
```

## Prerequisites

### Environment Variables

Create a `.env` file with:

```env
# Airtable
AIRTABLE_API_TOKEN=your_airtable_token
AIRTABLE_BASE_ID=your_base_id

# Discord
DISCORD_WEBHOOK_SUBMISSIONS=https://discord.com/api/webhooks/your_webhook_url

# Sanity (optional)
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_token
```

### Development Server

Tests require the dev server to be running. The test runner script handles this
automatically.

## Running Tests

### All Tests

```bash
npm run test:workflow
# or
./tests/run-tests.sh all
```

### Individual Test Suites

```bash
# Integration tests only
npm run test:integration
./tests/run-tests.sh integration

# E2E tests only
npm run test:e2e
./tests/run-tests.sh e2e

# Discord tests only
npm run test:discord
./tests/run-tests.sh discord
```

### Manual Testing

Start the dev server first:

```bash
npm run dev
```

In another terminal:

```bash
npx playwright test tests/integration/submission-workflow.test.js
npx playwright test tests/e2e/live-submission.test.js
npx playwright test tests/integration/discord-notifications.test.js
```

## Test Flow

### Complete Workflow Test

```
1. User fills out submission form
   └─→ Screenshot: Form with test data

2. Form submitted to API
   └─→ API endpoint: /.netlify/functions/submissions

3. Data saved to Airtable
   └─→ Verification: All fields stored correctly

4. Discord notification sent
   └─→ Webhook: Submission details posted

5. Submission appears in review mode
   └─→ Screenshot: Dashboard with new submission

6. Admin approves submission
   └─→ Screenshot: Approval action

7. Status updated in Airtable
   └─→ Verification: Status = "approved"

8. Discord approval notification sent
   └─→ Webhook: Approval details posted
```

## Expected Outcomes

### ✅ Success Indicators

- All Playwright tests pass (green checkmarks)
- Confirmation number generated (format: DSG-XXXXXXXX)
- Data appears in Airtable within 2 seconds
- Discord notifications visible in channel
- Submission visible in review dashboard
- Screenshots captured at each step
- No console errors in browser

### ❌ Common Issues

**"Environment variables not set"**

- Create `.env` file with required variables
- Run `source .env` in terminal

**"Cannot connect to server"**

- Ensure dev server is running: `npm run dev`
- Check port 8080 is not in use

**"Discord webhook failed"**

- Verify webhook URL is correct
- Check Discord channel permissions
- Webhook may be rate limited (wait 10 seconds)

**"Submission not found in review mode"**

- Wait for Airtable sync (try 2-3 seconds)
- Check review mode is enabled
- Verify API endpoint is working

## Test Data Cleanup

Tests automatically clean up after themselves:

- Test submissions are deleted from Airtable
- Screenshots are saved to `tests/screenshots/`
- Discord messages remain (for manual verification)

To manually delete test data:

```bash
# Delete test submissions from Airtable
node tests/cleanup-test-data.js
```

## Debugging Tests

### Run with UI

```bash
npx playwright test --ui
```

### Run in headed mode (see browser)

```bash
npx playwright test --headed
```

### Run specific test

```bash
npx playwright test -g "Submit form through UI"
```

### Enable debug mode

```bash
DEBUG=pw:api npx playwright test
```

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run tests
        env:
          AIRTABLE_API_TOKEN: ${{ secrets.AIRTABLE_API_TOKEN }}
          AIRTABLE_BASE_ID: ${{ secrets.AIRTABLE_BASE_ID }}
          DISCORD_WEBHOOK_SUBMISSIONS:
            ${{ secrets.DISCORD_WEBHOOK_SUBMISSIONS }}
        run: npm run test:workflow

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: tests/screenshots/
```

## Performance Benchmarks

Expected test durations:

- Integration tests: ~30-45 seconds
- E2E tests: ~60-90 seconds (includes screenshots)
- Discord tests: ~15-20 seconds
- **Total: ~2-3 minutes**

## Contributing

When adding new tests:

1. Follow existing test structure
2. Add cleanup in `afterAll` hooks
3. Use descriptive test names
4. Add screenshots for visual validation
5. Document expected behavior
6. Update this README

## Support

For issues or questions:

1. Check console output for errors
2. Verify environment variables
3. Review screenshots in `tests/screenshots/`
4. Check Discord channel for notifications
5. Verify Airtable data manually
