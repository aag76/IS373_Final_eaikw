# Sanity CMS Architecture Diagram

## Data Flow: Creating & Publishing Content

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CONTENT CREATORS (You)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
         ┌──────────────────────────────────────────────────────┐
         │  Sanity Studio (Web Interface)                        │
         │  https://YOUR_PROJECT_ID.sanity.studio              │
         │                                                       │
         │  Create/Edit:                                        │
         │  • Articles (with author, content, SEO)             │
         │  • Design Styles (colors, typography, samples)      │
         │  • Gallery Submissions (user-submitted designs)     │
         │  • Authors (bio, email, social)                     │
         └──────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Publish)
         ┌──────────────────────────────────────────────────────┐
         │  Sanity API (Cloud)                                  │
         │  https://api.sanity.io                              │
         │  • Stores content (documents)                       │
         │  • Handles authentication (API tokens)              │
         │  • Serves data via GROQ queries                     │
         └──────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Build Time)
         ┌──────────────────────────────────────────────────────┐
         │  Eleventy Build Process                              │
         │  npm run build                                       │
         │                                                       │
         │  1. src/_data/sanity.js fetches content              │
         │  2. Creates collections:                            │
         │     - collections.sanityArticles                    │
         │     - collections.sanityDesignStyles                │
         │  3. Passes data to templates                        │
         └──────────────────────────────────────────────────────┘
                                    │
                                    ▼
         ┌──────────────────────────────────────────────────────┐
         │  Nunjucks Templates                                  │
         │  src/                                                │
         │  • Render content from Sanity                       │
         │  • Create static pages                              │
         │  • Apply Swiss design system                        │
         └──────────────────────────────────────────────────────┘
                                    │
                                    ▼
         ┌──────────────────────────────────────────────────────┐
         │  Static HTML Site                                    │
         │  _site/ (checked into gh-pages)                     │
         │  • Pure HTML, no servers needed                     │
         │  • Hosted on GitHub Pages                          │
         │  • Fast & secure                                    │
         └──────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          WEBSITE VISITORS                                    │
│                  https://kaw393939.github.io/218_portfolio/                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Document Type Relationships

```
┌──────────────┐
│   AUTHOR     │
├──────────────┤
│ • name       │
│ • bio        │
│ • email      │
│ • image      │
│ • socials    │
└──────────────┘
       ▲
       │ referenced by
       │
┌──────────────────────────────┐
│      ARTICLE                 │
├──────────────────────────────┤
│ • title (required)           │
│ • author → AUTHOR (required) │
│ • content (rich blocks)      │
│ • excerpt (social)           │
│ • keywords (SEO)             │
│ • featured (boolean)         │
│ • publishedAt (datetime)     │
└──────────────────────────────┘


┌─────────────────────────┐
│   DESIGN STYLE          │
├─────────────────────────┤
│ • title                 │
│ • description           │
│ • colorPalette[] →      │
│   - name                │
│   - hexCode             │
│   - usage               │
│ • typographyGuidance    │
│ • sampleImages[]        │
│ • gallerySubmissions[]  │
└─────────────────────────┘
           ▲
           │
           │ references
           │
┌─────────────────────────────────┐
│   GALLERY SUBMISSION            │
├─────────────────────────────────┤
│ • submitterInfo                 │
│   - name, email, website        │
│ • submissionUrl                 │
│ • screenshot                    │
│ • styleReference → DESIGN_STYLE │
│ • description                   │
│ • status (workflow)             │
│   - submitted                   │
│   - under-review                │
│   - approved ✓ (shows on site)  │
│   - featured ✓ (highlighted)    │
│   - rejected ✗                  │
│ • reviewNotes                   │
└─────────────────────────────────┘
```

## File Organization

```
YOUR_PORTFOLIO/
│
├── 📁 sanity/                          ← Sanity Studio Code
│   ├── sanity.config.js                ← Config (project ID, plugins)
│   ├── sanity.json                     ← Metadata
│   ├── package.json                    ← Dependencies
│   │
│   └── 📁 schemas/                     ← Document Definitions
│       ├── author.js                   ← Author fields & structure
│       ├── article.js                  ← Article fields & structure
│       ├── designStyle.js              ← Design Style fields
│       ├── gallerySubmission.js        ← Gallery Submission fields
│       └── index.js                    ← Export all schemas
│
├── 📁 src/
│   ├── 📁 _data/
│   │   └── sanity.js                   ← ⭐ Eleventy API Client
│   │       • Fetches from Sanity API
│   │       • Available during build
│   │       • Provides: getArticles(), getDesignStyles(), etc.
│   │
│   └── 📁 (templates use collections)
│       └── Collections populated:
│           • collections.sanityArticles
│           • collections.sanityDesignStyles
│
├── .env.local                          ← Your secrets (NOT in git!)
│   └── SANITY_PROJECT_ID
│   └── SANITY_READ_TOKEN
│   └── SANITY_API_TOKEN
│
├── .env.sanity.example                 ← Template (in git)
├── .eleventy.js                        ← Updated with Sanity collections
│
└── 📁 docs/
    ├── SANITY_SETUP.md                 ← Setup guide
    ├── SANITY_INTEGRATION.md           ← Usage examples
    ├── SANITY_IMPLEMENTATION_CHECKLIST.md
    └── SANITY_SETUP_SUMMARY.txt        ← This file
```

## Build Flow: Step by Step

### Step 1: You Publish Content

```
You → Sanity Studio → Click "Publish"
      ↓
      Sanity API stores document
```

### Step 2: Trigger Build

```
npm run build (or GitHub Actions on push)
```

### Step 3: Eleventy Starts

```
Eleventy initialization
  ↓
.eleventy.js loads
  ↓
Collections register:
  - eleventyConfig.addCollection("sanityArticles", ...)
  - eleventyConfig.addCollection("sanityDesignStyles", ...)
```

### Step 4: Sanity API Called

```
src/_data/sanity.js executes
  ↓
Creates Sanity client with API token
  ↓
Runs GROQ queries:
  - *[_type == "article"] | order(publishedAt desc)
  - *[_type == "designStyle"] | order(createdAt desc)
  ↓
Data returned from Sanity Cloud
```

### Step 5: Collections Populated

```
collections.sanityArticles = [
  {
    title: "My Article",
    author: { name: "Keith", ... },
    content: [...],
    ...
  },
  ...
]

collections.sanityDesignStyles = [
  {
    title: "Swiss International",
    colorPalette: [...],
    ...
  },
  ...
]
```

### Step 6: Templates Render

```
Nunjucks templates access collections:

{% for article in collections.sanityArticles %}
  <h2>{{ article.title }}</h2>
  <p>By {{ article.author.name }}</p>
{% endfor %}

↓
Generates static HTML pages
```

### Step 7: Site Deployed

```
_site/ directory contains:
  - index.html
  - article/
  - design-styles/
  - CSS, JS, images
  ↓
Deployed to GitHub Pages
  ↓
Live at https://kaw393939.github.io/218_portfolio/
```

## What Happens When You Publish

### Before (No Content Management)

```
Markdown file → Manual commit → Build → Deploy
(Slow, requires code changes)
```

### After (With Sanity CMS)

```
Sanity Studio UI
    ↓
Click "Publish"
    ↓
✅ Content immediately in database
    ↓
Next build fetches fresh data
    ↓
Site automatically updates
(Fast, no code changes needed)
```

## Environment & Secrets

```
┌─────────────────────────────────────┐
│  .env.local (Your Local Machine)    │
├─────────────────────────────────────┤
│ SANITY_PROJECT_ID=abc123...        │ ← Required
│ SANITY_DATASET=production           │ ← Usually "production"
│ SANITY_READ_TOKEN=sk_...            │ ← For fetching content
│ SANITY_API_TOKEN=sk_...             │ ← For CI/CD deployments
└─────────────────────────────────────┘
        ↓ (on npm run build)
┌─────────────────────────────────────┐
│  src/_data/sanity.js                │
├─────────────────────────────────────┤
│ Uses environment variables to:      │
│ • Connect to Sanity API            │
│ • Authenticate requests            │
│ • Fetch content                    │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  Eleventy Build                     │
├─────────────────────────────────────┤
│ • Generates static HTML            │
│ • No API calls to server           │
│ • Fast, secure, scalable           │
└─────────────────────────────────────┘
```

## Quick Reference: What Happens When...

### You Create an Article

```
Sanity Studio → Article form
  ↓
Set author, title, content, keywords
  ↓
Click "Publish"
  ↓
Stored in Sanity (no site rebuild yet)
  ↓
When you run `npm run build`:
  → Article appears in collections.sanityArticles
  → Templates render it
  → HTML generated
  → Site rebuilt with new article
```

### You Change Article Status

```
Gallery Submission status: "submitted" → "approved"
  ↓
Click "Publish"
  ↓
Next time `npm run build` runs:
  → Query filters by status = "approved"
  → Submission appears on Design Style page
```

### You Add Color to Design Style

```
Design Style → colorPalette → Add Entry
  ↓
Enter: name, hexCode, usage
  ↓
Click "Publish"
  ↓
Next build automatically includes it
  ↓
Templates render color palette
```

## API Query Examples (GROQ)

The queries used by `src/_data/sanity.js`:

```javascript
// Get all articles
*[_type == "article"] | order(publishedAt desc) {
  title, slug, content, author->, ...
}

// Get all design styles with linked submissions
*[_type == "designStyle"] | order(createdAt desc) {
  title, colorPalette[], gallerySubmissions[]-> { ... }
}

// Get approved gallery submissions only
*[_type == "gallerySubmission" && status == "approved"] {
  submitterInfo, screenshot, styleReference->, ...
}

// Get single article by slug
*[_type == "article" && slug.current == "my-article"][0] {
  ...
}
```

These are abstracted in `src/_data/sanity.js` so you don't have to write GROQ.

## Summary

✅ **Sanity** = Headless CMS (database in the cloud) ✅ **Studio** = Web
interface for creating/editing content ✅ **API** = Fetches content during build
✅ **Eleventy** = Static site generator ✅ **Collections** = Make Sanity data
available in templates ✅ **Static Site** = Pure HTML deployed to GitHub Pages

**Result:** Content management without complexity. Updates are just a publish
button away.
