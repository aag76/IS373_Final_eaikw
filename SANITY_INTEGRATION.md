# Sanity CMS Integration Guide

## Overview

Your portfolio now has a complete Sanity CMS integration with:

- ✅ 4 document types: Author, Article, DesignStyle, GallerySubmission
- ✅ Sanity Studio configured and ready to run
- ✅ Eleventy integration for fetching content during build
- ✅ Environment configuration template
- ✅ API client utilities for querying Sanity

## What's Been Set Up

### Schema Files Created

```
sanity/
├── schemas/
│   ├── index.js                    # Exports all schemas
│   ├── author.js                   # Author document type
│   ├── article.js                  # Article document type
│   ├── designStyle.js              # Design Style document type
│   └── gallerySubmission.js        # Gallery Submission document type
├── sanity.config.js                # Sanity Studio configuration
├── sanity.json                     # Sanity project config
└── package.json                    # Sanity dependencies
```

### Eleventy Integration

```
src/
├── _data/
│   └── sanity.js                   # API client & fetch functions
└── .eleventy.js (updated)          # Added Sanity collections
```

### Root Files

```
.env.sanity.example                 # Environment template
SANITY_SETUP.md                     # Detailed setup instructions
```

## Quick Start (5 Minutes)

### Step 1: Create Sanity Project (1 min)

1. Go to **https://manage.sanity.io**
2. Sign in with GitHub (using `aag76@njit.edu`)
3. Click **Create new project**
4. Name it: `eaikw-cms`
5. Choose **Free plan**
6. Create a **production** dataset
7. **Copy your Project ID** from the dashboard

### Step 2: Configure Environment (1 min)

```bash
cp .env.sanity.example .env.local
```

Edit `.env.local` and add your Project ID:

```env
SANITY_PROJECT_ID=your_project_id_here
SANITY_DATASET=production
SANITY_READ_TOKEN=
SANITY_API_TOKEN=
```

### Step 3: Generate API Tokens (2 min)

1. In Sanity dashboard, go to **Settings → API**
2. Under **Tokens**, click **Add API token**
3. Name it: `read-token`, click **Create**
4. Copy the token → paste in `.env.local` as `SANITY_READ_TOKEN`
5. Create another token named `deploy-token` with **Editor** permissions
6. Copy it → paste in `.env.local` as `SANITY_API_TOKEN`

### Step 4: Start Sanity Studio (1 min)

```bash
npm run sanity:dev
```

Your studio opens at **http://localhost:3333**

## Document Types Explained

### 1. Author

For bylines on articles.

**Fields:**

- `name` - Required, unique author name
- `slug` - Auto-generated from name
- `bio` - Author biography
- `email` - Contact email
- `image` - Avatar/headshot
- `twitter`, `linkedin`, `github`, `website` - Social links

**Example:** When you write a bio, create an Author document first.

### 2. Article

For educational content displayed on the site.

**Fields:**

- `title` - Required, e.g., "10 Tips for AI in Education"
- `slug` - Auto-generates from title
- `author` - Reference to Author (required)
- `content` - Rich text with images (blocks editor)
- `excerpt` - 160-200 chars for social media and listings
- `keywords` - 8-10 SEO keywords
- `tags` - Topics/categories
- `featured` - Pin to homepage
- `featuredImage` - Thumbnail for listings
- `publishedAt` - Publication date
- `readingTime` - Minutes to read

**Workflow:**

1. Create an Author
2. Create Article, select the Author
3. Write content in the blocks editor
4. Set publishedAt to control visibility
5. Publish
6. Run `npm run build` - article appears on site

### 3. Design Style

Documents design systems (Swiss, Brutalism, Nordic, etc.).

**Fields:**

- `title` - e.g., "Swiss International Style"
- `slug` - Auto-generated
- `description` - 1-2 sentence summary
- `historicalBackground` - Rich text history
- `colorPalette` - Array of:
  - Color name (e.g., "Swiss Red")
  - Hex code (#EF476F)
  - Usage description
- `typographyGuidance` - Rich text typography rules
- `sampleImages` - Screenshots/examples
- `gallerySubmissions` - Links to gallery entries using this style

**Workflow:**

1. Create Design Style
2. Add color palette entries
3. Upload sample images
4. Users can submit designs referencing this style
5. As submissions are approved, they appear linked here

### 4. Gallery Submission

Users submit design examples referencing a style.

**Fields:**

- `submitterInfo` - Object:
  - `name` - Submitter name
  - `email` - Contact email
  - `website` - Portfolio URL
- `submissionUrl` - Link to the submitted site
- `screenshot` - Visual proof (required)
- `styleReference` - Which Design Style this uses (required)
- `description` - Why they chose this style
- `status` - Workflow state:
  - **submitted** - Initial state
  - **under-review** - Admin reviewing
  - **approved** - Ready to show
  - **featured** - Highlighted prominently
  - **rejected** - Won't be shown

**Workflow:**

1. User fills out submission form on site (web form → Sanity)
2. Admin reviews in Sanity Studio
3. Changes status to "approved" or "featured"
4. Submission appears on Design Style page & gallery

## Using Content in Templates

### Listing All Articles

```nunjucks
{% for article in collections.sanityArticles %}
  <article>
    <h2>{{ article.title }}</h2>
    <p>By {{ article.author.name }}</p>
    <p>{{ article.excerpt }}</p>
    <time>{{ article.publishedAt | dateFormat }}</time>
  </article>
{% endfor %}
```

### Listing Design Styles

```nunjucks
{% for style in collections.sanityDesignStyles %}
  <div>
    <h3>{{ style.title }}</h3>
    <p>{{ style.description }}</p>
    {% for color in style.colorPalette %}
      <div style="background: {{ color.hexCode }}">
        {{ color.name }}
      </div>
    {% endfor %}
  </div>
{% endfor %}
```

### Single Article Page

Create `src/article.njk`:

```nunjucks
---
layout: layouts/post.njk
permalink: /article/{{ slug }}/index.html
---

<h1>{{ title }}</h1>
<p>By <a href="/author/{{ author.slug }}">{{ author.name }}</a></p>
<time>{{ publishedAt | dateFormat }}</time>

{{ content | safe }}
```

## Build Process

When you run `npm run build`:

1. **Eleventy starts** → calls `src/_data/sanity.js`
2. **Sanity API queries** → fetches articles, design styles, submissions
3. **Collections created** → `collections.sanityArticles`,
   `collections.sanityDesignStyles`
4. **Pages generate** → Nunjucks templates render with Sanity data
5. **Static HTML output** → in `_site/`

**Important:** Requires valid `SANITY_PROJECT_ID` and `SANITY_READ_TOKEN` in
environment.

## Creating Content

### Add an Article

1. **Open Studio:**

   ```bash
   npm run sanity:dev
   ```

2. **Click "Article" → "Create"**

3. **Fill in:**
   - Title: "My First Article"
   - Author: Select from dropdown (create if needed)
   - Content: Write using blocks editor
   - Excerpt: "Brief teaser for social media"
   - Keywords: `["ai", "education", "learning"]`
   - FeaturedImage: Upload (optional)

4. **Publish** when ready

5. **Regenerate site:**

   ```bash
   npm run build
   ```

6. **Article appears** in collections automatically

### Approve a Gallery Submission

1. Open Sanity Studio
2. Go to **Gallery Submission**
3. Click a submission with status "submitted"
4. Change **Status** to "approved" or "featured"
5. Click **Publish**
6. Run `npm run build` to update site

### Create a Design Style

1. Go to **Design Style** → **Create**
2. Fill in title, description, historical background
3. Add **Color Palette** entries:
   - Click **Add** multiple times
   - For each: name, hex code, usage
4. Upload **Sample Images**
5. **Publish**
6. Gallery submissions can now reference this style

## Deployment

### Deploy Sanity Studio (Hosted)

```bash
npm run sanity:deploy
```

Your studio deploys to:

```
https://YOUR_PROJECT_ID.sanity.studio
```

Anyone you invite can edit content there.

### Deploy with GitHub Actions

1. Add to GitHub Secrets:
   - `SANITY_PROJECT_ID`
   - `SANITY_READ_TOKEN`

2. Update `.github/workflows/deploy.yml`:

```yaml
env:
  SANITY_PROJECT_ID: ${{ secrets.SANITY_PROJECT_ID }}
  SANITY_DATASET: production
  SANITY_READ_TOKEN: ${{ secrets.SANITY_READ_TOKEN }}
```

3. On each push to `main`, the build automatically fetches latest content

## Troubleshooting

**"SANITY_PROJECT_ID is not defined"**

- Check `.env.local` exists (not in `/sanity`)
- Verify you ran `cp .env.sanity.example .env.local`

**"Cannot fetch from Sanity API"**

- Verify `SANITY_READ_TOKEN` is set correctly
- Check token hasn't expired in Sanity dashboard
- Confirm dataset name matches (usually "production")

**"Studio not loading"**

```bash
cd sanity
npm install
npm run dev
```

**"Articles don't appear after publishing"**

1. Confirm article has valid author reference
2. Run `npm run build` (not `npm run dev`)
3. Check `_site/` was regenerated
4. Clear browser cache

**"Images not showing"**

- In article, upload via Sanity's image uploader
- Don't paste external URLs (Sanity won't have access)
- Sanity hosts images on CDN automatically

## Next Steps

1. **Create 2-3 test articles** to verify workflow
2. **Deploy Sanity Studio** (`npm run sanity:deploy`)
3. **Create Design Style pages** for your design systems
4. **Set up gallery submission form** (connects to Sanity via API)
5. **Configure webhooks** for auto-builds on publish

## File Reference

| File                      | Purpose                         |
| ------------------------- | ------------------------------- |
| `sanity/sanity.config.js` | Studio config & plugins         |
| `sanity/schemas/*.js`     | Document type definitions       |
| `src/_data/sanity.js`     | Eleventy API client             |
| `.env.local`              | Your local secrets (not in git) |
| `.env.sanity.example`     | Template for environment vars   |
| `SANITY_SETUP.md`         | Detailed setup docs             |

## Learn More

- **Sanity Docs:** https://www.sanity.io/docs
- **Eleventy Integration:** https://www.sanity.io/guides/eleventy
- **Schema Reference:** https://www.sanity.io/docs/schema-types
- **GROQ Queries:** https://www.sanity.io/docs/groq
