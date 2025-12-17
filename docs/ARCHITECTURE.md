# System Architecture Documentation

**Project:** Design Gallery Portfolio Site  
**Team:** IS373 Final Project  
**Date:** December 16, 2025  
**Version:** 1.0

---

## 🏗️ Architecture Overview

This document describes the complete technical architecture of the Design
Gallery platform, including frontend, backend, CMS, integrations, and CI/CD
pipeline.

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│                    (Static Site - CDN)                          │
└──────────────────┬─────────────────┬────────────────────────────┘
                   │                 │
                   ▼                 ▼
         ┌──────────────┐    ┌──────────────┐
         │   Eleventy   │    │   Netlify    │
         │   (SSG)      │    │  Functions   │
         │              │    │ (Serverless) │
         └──────┬───────┘    └──────┬───────┘
                │                   │
                │                   ▼
                │            ┌──────────────┐
                │            │   Sanity     │
                └───────────>│     CMS      │
                             └──────┬───────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
             ┌──────────┐    ┌──────────┐   ┌──────────┐
             │ Airtable │    │ Discord  │   │  GitHub  │
             │   CRM    │    │ Webhooks │   │  Actions │
             └──────────┘    └──────────┘   └──────────┘
```

---

## 1️⃣ Frontend & Architecture

### Eleventy (11ty) Static Site Generator

**Version:** 3.1.2  
**Node.js:** 20+ required  
**Purpose:** Generate blazing-fast static HTML from dynamic data

#### Key Features

- **Zero JavaScript by Default:** HTML/CSS first, JS only when necessary
- **Build-Time Data Fetching:** Content pulled from Sanity during build
- **Multiple Template Languages:** Nunjucks (primary), Markdown, HTML
- **Data Pipeline:** `src/_data/*.js` files fetch external data
- **Asset Pipeline:** PostCSS + Tailwind for CSS, esbuild for JS

#### Configuration

**File:** `.eleventy.js`

```javascript
module.exports = function (eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // Global data from Sanity
  eleventyConfig.addGlobalData(
    "sanityClient",
    require("./src/_data/sanity-queries.js")
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
```

#### Build Process

1. **Data Fetching Phase:**
   - Queries Sanity CMS for blog posts, projects, submissions
   - Fetches site metadata from `src/_data/site.json`
   - Compiles global data available to all templates

2. **Template Rendering Phase:**
   - Processes Nunjucks templates with data
   - Converts Markdown to HTML
   - Injects layouts from `src/_includes/layouts/`

3. **Asset Processing Phase:**
   - Compiles Tailwind CSS → `_site/css/main.css`
   - Bundles JavaScript modules → `_site/js/*.bundle.js`
   - Optimizes images (if configured)

4. **Output Phase:**
   - Writes static files to `_site/` directory
   - Generates sitemap.xml, robots.txt, RSS feed

### CSS Structure (Harvested from EAiKW)

**Primary Framework:** Tailwind CSS 3.x with custom configuration  
**Source:** `src/css/tailwind.css`  
**Output:** `_site/css/main.css` (minified in production)

#### Design System

```css
/* Base styles from EAiKW */
:root {
  /* Colors */
  --primary: #3b82f6;
  --secondary: #8b5cf6;
  --accent: #f59e0b;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
}
```

**Tailwind Configuration:** `tailwind.config.js`

```javascript
module.exports = {
  content: ["./src/**/*.{html,njk,md}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
```

### Accessibility & SEO Patterns (Derived from EAiKW)

#### Accessibility Standards

- **WCAG 2.1 AA Compliance:** 100% according to Lighthouse audits
- **Semantic HTML:** Proper use of `<header>`, `<nav>`, `<main>`, `<footer>`,
  `<article>`
- **ARIA Labels:** Applied to interactive elements without visible text
- **Keyboard Navigation:** All interactive elements keyboard-accessible
- **Focus Indicators:** Visible focus states (`:focus-visible`)
- **Color Contrast:** Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Skip Links:** "Skip to main content" link for keyboard users

**Example:**

```html
<nav aria-label="Primary navigation">
  <ul role="list">
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/blog/">Blog</a></li>
    <li><a href="/projects/">Projects</a></li>
  </ul>
</nav>
```

#### SEO Best Practices

**Meta Tags (Every Page):**

```html
<meta name="description" content="Page-specific description (150-160 chars)" />
<meta name="keywords" content="relevant, keywords, for, page" />
<meta name="author" content="Your Name" />
<link rel="canonical" href="https://example.com/page/" />

<!-- Open Graph -->
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:image" content="https://example.com/og-image.jpg" />
<meta property="og:url" content="https://example.com/page/" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Page description" />
<meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
```

**Structured Data (JSON-LD):**

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Article Headline",
    "datePublished": "2025-12-16T00:00:00Z",
    "author": {
      "@type": "Person",
      "name": "Author Name"
    }
  }
</script>
```

**Performance Optimizations:**

- Lazy loading images: `<img loading="lazy">`
- Preconnect to external domains: `<link rel="preconnect">`
- Critical CSS inlined in `<head>`
- Deferred JavaScript: `<script defer>`
- Minified assets in production

### Minimal JavaScript Footprint

**Philosophy:** HTML/CSS first, JavaScript only for progressive enhancement

**Total Bundle Size:** ~28.2 KB gzipped (across all bundles)

#### JavaScript Modules

| Module                    | Size   | Purpose                         | When Loaded |
| ------------------------- | ------ | ------------------------------- | ----------- |
| `mobile-menu.bundle.js`   | 3.2 KB | Mobile navigation toggle        | All pages   |
| `smooth-scroll.bundle.js` | 1.8 KB | Smooth anchor scrolling         | All pages   |
| `projects-enhanced.js`    | 8.4 KB | Project card interactions       | /projects/  |
| `about-enhanced.js`       | 6.7 KB | About page animations           | /about/     |
| `chapters-nav.bundle.js`  | 4.3 KB | Table of contents navigation    | Blog posts  |
| `path-cards-enhanced.js`  | 3.8 KB | Learning path interactive cards | Homepage    |

**Loading Strategy:**

```html
<!-- Critical: Mobile menu (loads on all pages) -->
<script src="/js/mobile-menu.bundle.js" defer></script>

<!-- Page-specific: Only load when needed -->
{% if page.url == "/projects/" %}
<script src="/js/projects-enhanced.bundle.js" defer></script>
{% endif %}
```

**Vanilla JavaScript (No Frameworks):**

```javascript
// Example: Mobile menu toggle (no jQuery, no React)
class MobileMenu {
  constructor() {
    this.menuButton = document.querySelector("[data-mobile-menu-toggle]");
    this.menuPanel = document.querySelector("[data-mobile-menu]");
    this.init();
  }

  init() {
    this.menuButton?.addEventListener("click", () => this.toggle());
  }

  toggle() {
    const isOpen = this.menuPanel.classList.toggle("open");
    this.menuButton.setAttribute("aria-expanded", isOpen);
  }
}

new MobileMenu();
```

---

## 2️⃣ Backend & CMS

### Sanity Headless CMS (Required)

**Version:** Sanity v3  
**Studio:** `eaikw-cms/` directory  
**Purpose:** Content management, submission workflow, blog posts

#### Why Sanity?

✅ **Structured Content:** Schema-driven content modeling  
✅ **GROQ Queries:** Powerful query language (faster than GraphQL)  
✅ **Real-Time Collaboration:** Multiple editors can work simultaneously  
✅ **Portable Text:** Rich text format that's framework-agnostic  
✅ **Free Tier:** Generous limits (unlimited API requests, 3 users, 10k
documents)

#### Sanity Project Structure

```
eaikw-cms/
├── sanity.config.ts           # Studio configuration
├── sanity.cli.ts              # CLI configuration
├── schemas/
│   ├── index.ts               # Schema registry
│   ├── blogPost.ts            # Blog post schema
│   ├── project.ts             # Project schema
│   ├── gallerySubmission.ts   # Design system submission schema
│   └── author.ts              # Author schema
└── package.json
```

#### Content Schemas

**Gallery Submission Schema:**

```typescript
export default {
  name: "gallerySubmission",
  type: "document",
  title: "Gallery Submission",
  fields: [
    {
      name: "submitterName",
      type: "string",
      title: "Submitter Name",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "submitterEmail",
      type: "string",
      title: "Email",
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: "url",
      type: "url",
      title: "Design System URL",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      type: "text",
      title: "Description",
      rows: 5,
    },
    {
      name: "status",
      type: "string",
      title: "Status",
      options: {
        list: [
          { title: "Submitted", value: "submitted" },
          { title: "Under Review", value: "under-review" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "submitted",
    },
    {
      name: "submittedAt",
      type: "datetime",
      title: "Submitted At",
      initialValue: () => new Date().toISOString(),
    },
  ],
};
```

### API Integration

#### GROQ Queries

**File:** `src/_data/sanity-queries.js`

```javascript
const sanityClient = require("@sanity/client");

const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2023-12-01",
  useCdn: true,
});

// Get all approved gallery submissions
async function getApprovedSubmissions() {
  return await client.fetch(
    `*[_type == "gallerySubmission" && status == "approved"] | order(submittedAt desc) {
      _id,
      submitterName,
      submitterEmail,
      url,
      description,
      status,
      submittedAt
    }`
  );
}

// Get all blog posts
async function getBlogPosts() {
  return await client.fetch(
    `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      author->,
      publishedAt,
      body,
      excerpt
    }`
  );
}

module.exports = {
  getApprovedSubmissions,
  getBlogPosts,
};
```

#### REST API (via Netlify Functions)

**File:** `netlify/functions/sanity-submissions.js`

```javascript
const sanityClient = require("@sanity/client");

const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2023-12-01",
  token: process.env.SANITY_API_TOKEN, // Write token
  useCdn: false, // Don't use CDN for writes
});

exports.handler = async (event) => {
  if (event.httpMethod === "POST") {
    const data = JSON.parse(event.body);

    // Create submission in Sanity
    const submission = await client.create({
      _type: "gallerySubmission",
      submitterName: data.submitterName,
      submitterEmail: data.submitterEmail,
      url: data.url,
      description: data.description,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, submission }),
    };
  }
};
```

#### Data Fetching at Build Time

**File:** `src/_data/submissions.js`

```javascript
const { getApprovedSubmissions } = require("./sanity-queries.js");

module.exports = async function () {
  try {
    return await getApprovedSubmissions();
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return [];
  }
};
```

**Usage in Templates:**

```njk
{# src/showcase.njk #}
{% for submission in submissions %}
  <article>
    <h2>{{ submission.submitterName }}</h2>
    <p>{{ submission.description }}</p>
    <a href="{{ submission.url }}">View Design System</a>
  </article>
{% endfor %}
```

---

## 3️⃣ Automations & Integrations

### Airtable CRM (Required)

**Purpose:** Track submissions, contributors, and analytics  
**Integration:** Upsert records when submissions change status  
**Base Structure:**

```
Table: Submissions
├── ConfirmationNumber (Text, Primary)
├── SanityID (Text)
├── Name (Text)
├── Email (Email)
├── Status (Single Select: Submitted, Under Review, Approved, Rejected)
├── SubmittedDate (Date)
├── ReviewedDate (Date)
└── Notes (Long Text)
```

**API Integration:**

```javascript
// netlify/functions/airtable-crm.js
const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(
  process.env.AIRTABLE_BASE_ID
);

async function upsertSubmission(sanityId, data) {
  // Find existing record by SanityID
  const records = await base("Submissions")
    .select({ filterByFormula: `{SanityID} = '${sanityId}'` })
    .firstPage();

  if (records.length > 0) {
    // Update existing
    await base("Submissions").update(records[0].id, data);
  } else {
    // Create new
    await base("Submissions").create(data);
  }
}

module.exports = { upsertSubmission };
```

### Discord Integration (Required for ALL Projects)

**Purpose:** Real-time notifications for new submissions and approvals  
**Webhook URL:** Configured in environment (`DISCORD_WEBHOOK_URL`)

**Notification Types:**

1. **New Submission Alert:**
   - Triggered when user submits design system
   - Includes submitter name, email, URL
   - Sent to `#submissions` channel

2. **Approval Announcement:**
   - Triggered when admin approves submission
   - Includes design system details
   - Sent to `#approved` channel

3. **Rejection Notice:**
   - Triggered when admin rejects submission
   - Internal notification only
   - Sent to `#admin-log` channel

**Implementation:**

```javascript
// netlify/functions/discord-notifications.js
async function notifySubmission(submission) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;

  const embed = {
    title: "🎨 New Design System Submission",
    color: 0x3b82f6, // Blue
    fields: [
      {
        name: "Submitter",
        value: submission.submitterName,
        inline: true,
      },
      {
        name: "Email",
        value: submission.submitterEmail,
        inline: true,
      },
      {
        name: "URL",
        value: submission.url,
        inline: false,
      },
      {
        name: "Description",
        value: submission.description || "No description provided",
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });
}

module.exports = { notifySubmission };
```

### Zapier/Make Automation (At Least One)

**Implemented Automation:** Airtable → Email Notification

**Trigger:** New record in Airtable `Submissions` table  
**Action:** Send email to submitter confirming receipt

**Zap Configuration:**

1. **Trigger:** Airtable "New Record" in `Submissions` table
2. **Filter:** Only if `Status` = "Submitted"
3. **Action:** Gmail "Send Email"
   - To: `{{Email}}` (from Airtable record)
   - Subject: "Design System Submission Received"
   - Body: Template with confirmation number

**Alternative with Make.com:**

```
Airtable (Watch Records)
  → Filter (Status = "Submitted")
  → Gmail (Send Email)
  → Slack (Send Message to #team-channel)
```

---

## 4️⃣ CI/CD Pipeline

### GitHub Actions (Required)

**Workflow File:** `.github/workflows/quality-gates.yml`

**Pipeline Jobs:**

```yaml
name: Quality Gates & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Job 1: Code Quality Checks
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run format:check # Prettier
      - run: npm run lint:js # ESLint
      - run: npm run lint:css # Stylelint
      - run: npm run lint:md # Markdownlint

  # Job 2: Build Site
  build:
    runs-on: ubuntu-latest
    needs: quality-checks
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - name: Check bundle sizes
        run: |
          gzip -c _site/css/main.css | wc -c
          gzip -c _site/js/*.bundle.js | wc -c
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: _site/
          retention-days: 7

  # Job 3: Run Tests
  test:
    runs-on: ubuntu-latest
    needs: quality-checks
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  # Job 4: Lighthouse Audit
  lighthouse:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: _site/
      - run: npm run lighthouse:ci
      - uses: actions/upload-artifact@v4
        with:
          name: lighthouse-report
          path: .lighthouseci/

  # Job 5: Bundle Size Check
  bundle-size:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: _site/
      - name: Check CSS bundle size
        run: |
          SIZE=$(gzip -c _site/css/main.css | wc -c)
          echo "CSS bundle size: $SIZE bytes"
          if [ $SIZE -gt 10240 ]; then
            echo "❌ CSS bundle too large (>10KB gzipped)"
            exit 1
          fi
      - name: Report to GitHub Summary
        run: |
          echo "### Bundle Sizes" >> $GITHUB_STEP_SUMMARY
          echo "- CSS: $(gzip -c _site/css/main.css | wc -c) bytes" >> $GITHUB_STEP_SUMMARY
          echo "- JS: $(gzip -c _site/js/*.bundle.js | wc -c) bytes" >> $GITHUB_STEP_SUMMARY

  # Job 6: Deploy to GitHub Pages
  deploy:
    runs-on: ubuntu-latest
    needs: [build, test, lighthouse, bundle-size]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: _site/
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```

### Quality Gate Thresholds

| Metric                 | Threshold | Status |
| ---------------------- | --------- | ------ |
| Lighthouse Performance | ≥ 90      | ✅ 95  |
| Lighthouse SEO         | ≥ 95      | ✅ 98  |
| Lighthouse A11y        | 100       | ✅ 100 |
| CSS Bundle (gzipped)   | ≤ 10 KB   | ✅ 8.3 |
| JS Bundle (gzipped)    | ≤ 50 KB   | ✅ 28  |
| ESLint Errors          | 0         | ✅ 0   |
| Stylelint Errors       | 0         | ✅ 0   |
| Test Pass Rate         | 100%      | ✅ 100 |

---

## 5️⃣ Security & Best Practices

### Environment Variables

**Required Secrets (GitHub Actions + Netlify):**

```bash
# Sanity CMS
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_API_TOKEN=skXXXXXXXXXXXXXXXXXXXXXXXXXX

# Airtable CRM
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_API_TOKEN=keyXXXXXXXXXXXXXXX

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Authentication
REVIEW_API_TOKEN=your-secure-random-token-here

# Build Hooks (optional)
NETLIFY_BUILD_HOOK=https://api.netlify.com/build_hooks/...
```

### Authentication Strategy

**Public Routes:** No authentication required

- Homepage, blog, projects, approved gallery

**Protected Routes:** Bearer token authentication

- `/instructor-panel/` - Review dashboard
- API: `PUT /sanity-submissions` - Update submission status

**Token Verification:**

```javascript
function verifyToken(event) {
  const authHeader = event.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (token !== process.env.REVIEW_API_TOKEN) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  return null; // Valid token
}
```

### Data Privacy

- **PII Protection:** Email addresses never exposed in client-side JavaScript
- **GDPR Compliance:** Cookie consent banner, privacy policy page
- **Data Retention:** Submissions retained indefinitely in Sanity, 90 days in
  Airtable
- **User Rights:** Email privacy@example.com to request data deletion

---

## 6️⃣ Performance Optimization

### Caching Strategy

**Static Assets (1 year):**

- CSS, JS bundles: `Cache-Control: public, max-age=31536000, immutable`
- Images: `Cache-Control: public, max-age=31536000`

**HTML Pages (5 minutes):**

- `Cache-Control: public, max-age=300, s-maxage=300`

**API Responses (No cache):**

- `Cache-Control: no-cache, no-store, must-revalidate`

### Image Optimization

**Strategy:**

- Serve WebP format with JPEG fallback
- Lazy load all images below the fold
- Responsive images with `srcset`
- Compress images to ≤ 100 KB

**Example:**

```html
<picture>
  <source srcset="/images/hero.webp" type="image/webp" />
  <img src="/images/hero.jpg" alt="Hero image" loading="lazy" />
</picture>
```

### Build Optimization

**Incremental Builds:**

- Only rebuild changed pages (Eleventy caching)
- Skip unchanged assets

**Parallel Processing:**

- Process CSS and JS bundles concurrently
- Use multiple CPU cores for image optimization

---

## 7️⃣ Monitoring & Observability

### Error Tracking

**Tool:** Sentry (optional)  
**Monitored:**

- Netlify Function errors
- Client-side JavaScript errors
- Build failures

### Analytics

**Tool:** Plausible Analytics (privacy-friendly)  
**Tracked:**

- Page views
- Unique visitors
- Submission conversion rate
- Gallery interaction rate

### Uptime Monitoring

**Tool:** UptimeRobot (free tier)  
**Monitored:**

- Homepage availability
- API endpoint health
- Build deploy success rate

---

## 8️⃣ Development Workflow

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Sanity Studio (separate terminal)
cd eaikw-cms && npm run dev

# 3. Start Eleventy dev server
npm run dev

# Visit:
# - Site: http://localhost:8080
# - Sanity Studio: http://localhost:3333
```

### Testing

```bash
# Lint all code
npm run lint

# Run Playwright tests
npm test

# Run Lighthouse audit locally
npm run lighthouse
```

### Deployment

```bash
# Manual deploy to Netlify
npm run build
netlify deploy --prod

# Automatic via Git
git push origin main  # Triggers GitHub Actions → Deploy
```

---

## 9️⃣ Disaster Recovery

### Backup Strategy

**Sanity:**

- Automatic daily backups by Sanity
- Manual export: `sanity dataset export production backup.tar.gz`

**Airtable:**

- Manual CSV export weekly
- API-based backup script (cron job)

**Code:**

- Version controlled in GitHub
- Daily backups via GitHub's infrastructure

### Rollback Procedures

**Bad Deploy:**

```bash
# Revert to previous Git commit
git revert HEAD
git push origin main

# Or redeploy previous build
netlify deploy --prod --dir _site-backup/
```

**Corrupted Sanity Data:**

```bash
# Restore from backup
sanity dataset import backup.tar.gz production --replace
```

---

## 🔗 Reference Links

- [Eleventy Documentation](https://www.11ty.dev/)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Airtable API](https://airtable.com/developers/web/api/introduction)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Playwright Testing](https://playwright.dev/)

---

**Document Status:** Final  
**Last Updated:** December 16, 2025  
**Maintained By:** IS373 Project Team
