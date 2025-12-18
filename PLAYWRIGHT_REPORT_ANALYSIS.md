# Playwright Test Failures - Root Cause Analysis

**Date:** December 17, 2025  
**Test Run:** After port fixes (commit 160e85c)  
**Source:** Playwright HTML report analysis

---

## 🔍 Primary Issue: Netlify Functions Not Available in Tests

### **Root Cause**

Tests are running against **Eleventy static server** (`localhost:8765`) which doesn't serve Netlify Functions. The serverless functions live at `/.netlify/functions/*` endpoints that only exist when running `netlify dev`.

### **Impact**

- Event registration tests failing: Form expects JSON response, receives HTML 404/error page
- API endpoint tests fail with connection refused
- Integration tests can't reach serverless functions

### **Error Pattern**

```
❌ Error: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This occurs because:

1. Form submits to `/.netlify/functions/register-event`
2. Eleventy server returns HTML 404 page (starts with `<!DOCTYPE`)
3. JavaScript tries to parse HTML as JSON → syntax error

---

## 📋 Detailed Failure Analysis

### **1. Event Registration Tests (2 failures)**

**Files:** `tests/workflow.spec.ts` - "Event Registration Workflow"

**Issue:** Form posts to `.netlify/functions/register-event` which doesn't exist on static server

**Evidence from report:**
```yaml
- generic [ref=e24]: "❌ Error: Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"
```

**Form code:**
```javascript
const response = await fetch("/.netlify/functions/register-event", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});
const data = await response.json(); // ← Tries to parse HTML as JSON
```

### **2. Cookie Consent Banner Still Blocking Clicks**

**Files:** `tests/visual/interactions.spec.ts`, `tests/workflow.spec.ts`

**Issue:** Created `tests/fixtures.ts` but tests aren't importing from it

**Evidence:**

- Mobile menu test: 5-second timeout clicking button (cookie banner intercepts)
- Filter button test: 5.5-second timeout (cookie banner intercepts)

**Current test imports:**
```javascript
import { test, expect } from "@playwright/test"; // ❌ Not using fixtures
```

**Should be:**
```javascript
import { test, expect } from "./fixtures"; // ✅ Uses cookie auto-dismiss
```

### **3. Gallery Data-TestIds Missing**

**Tests:**

- "should display approved submissions in gallery"
- "should filter submissions by status"

**Issue:** Tests look for `[data-testid="gallery-grid"]` which doesn't exist in HTML

**Page structure from report:**
```yaml
- main:
  - generic: # ← Missing data-testid="gallery-grid"
    - paragraph: "03 — STYLE GALLERY"
    - heading "Style Gallery"
    - article: # ← Missing data-testid="submission-card"
```

---

## 🛠️ Solutions

### **Solution 1: Use Netlify Dev Server for Tests**

#### Option A: Update WebServer Config (Recommended)

```typescript
// playwright.config.ts
webServer: {
  command: 'netlify dev',
  url: 'http://localhost:8888', // Netlify dev default port
  timeout: 60 * 1000,
  reuseExistingServer: !process.env.CI,
}
```

#### Option B: Mock Netlify Functions for Tests

```typescript
// tests/setup.ts
beforeEach(async ({ page }) => {
  await page.route('**/.netlify/functions/**', route => {
    // Return mock responses
    route.fulfill({ 
      status: 200,
      body: JSON.stringify({ success: true, registrationNumber: 'TEST-12345' })
    });
  });
});
```

---

### **Solution 2: Apply Cookie Consent Fix Globally**

Update ALL test files to use fixtures:

```bash
# Files to update:
tests/e2e/live-submission.test.js
tests/functional.spec.ts
tests/homepage.spec.ts
tests/integration/submission-workflow.test.js
tests/visual/components.spec.ts
tests/visual/interactions.spec.ts
tests/visual/pages.spec.ts
tests/visual/responsive.spec.ts
tests/workflow.spec.ts
```

Change:
```javascript
- import { test, expect } from "@playwright/test";
+ import { test, expect } from "./fixtures";
```

For nested test files, adjust path:
```javascript
// For tests/visual/*.spec.ts
import { test, expect } from "../fixtures";

// For tests/integration/*.test.js
import { test, expect } from "../fixtures";
```

---

### **Solution 3: Add Missing Data-TestIds**

#### Gallery Grid (src/blog/index.njk or relevant template)

```html
<!-- Find the gallery container -->
<div data-testid="gallery-grid" class="gallery-grid">
  <!-- Cards -->
  <article data-testid="submission-card">
    ...
  </article>
</div>
```

#### Featured Projects (src/index.njk)

```html
<section data-component="featured-projects">
  <!-- Projects content -->
</section>
```

---

## 📊 Expected Impact of Fixes

### Before Fixes

- ✅ 17 passed
- ❌ 24 failed
- ⏭️ 7 skipped

### After Netlify Dev + Cookie Fix + Data-TestIds

- ✅ ~45-48 passed
- ❌ ~5 failed (only integration tests requiring env vars)
- ⏭️ 7 skipped

### After Adding Environment Variables (CI only)

- ✅ ~50 passed (near 100%)
- ❌ 0-2 failed
- ⏭️ 7 skipped

---

## 🎯 Implementation Priority

### **Priority 1: Quick Wins (10 minutes)**

1. Update all test imports to use `fixtures.ts` for cookie consent
2. Add missing `data-testid` attributes to templates

**Expected gain:** +10-15 passing tests

### **Priority 2: Netlify Dev Setup (15 minutes)**

1. Update `playwright.config.ts` to use `netlify dev`
2. Update test URLs from `8765` to `8888`
3. Verify functions work in tests

**Expected gain:** +8-10 passing tests (all event registration and API tests)

### **Priority 3: Optional (CI only)**

1. Add environment variables to GitHub secrets
2. Integration tests will pass in CI

**Expected gain:** +5 passing tests (integration only)

---

## 📝 Quick Command Reference

```bash
# Run tests with Netlify dev server (after config update)
netlify dev & sleep 5 && npm test

# Update visual baselines
npm test -- --update-snapshots

# Run only fast tests (skip integration)
npm run test:fast

# Run specific test file
npm test -- tests/workflow.spec.ts

# Debug failing test
npm test -- tests/workflow.spec.ts --debug
```

---

## 🔗 Related Files

**Test Configuration:**

- `playwright.config.ts` - WebServer config
- `tests/fixtures.ts` - Cookie consent auto-dismiss

**Templates Needing Data-TestIds:**

- `src/blog/index.njk` - Gallery grid
- `src/index.njk` - Featured projects section
- `src/_includes/components/*.njk` - Component templates

**Netlify Functions:**

- `netlify/functions/register-event.js`
- `netlify/functions/submissions.js`
- `netlify.toml` - Functions configuration

---

## ✅ Already Fixed (Commit 160e85c)

- ✅ Port mismatch (8080 → 8765)
- ✅ Navigation selector strict mode
- ✅ Heading hierarchy test page
- ✅ Workflow regex syntax error

These fixes are working correctly per the test run.
