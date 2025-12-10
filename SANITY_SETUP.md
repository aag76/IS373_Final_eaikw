# Sanity CMS Integration

This portfolio uses Sanity CMS for managing:

- **Articles** - Educational content with authors
- **Authors** - Writer profiles with bio and social links
- **Design Styles** - Design system documentation (Swiss International,
  Neo-Brutalism, etc.)
- **Gallery Submissions** - User-submitted design examples

## Setup Instructions

### 1. Create a Sanity Project

```bash
# Go to https://manage.sanity.io and create a new project
# Choose "Free" plan to get started
# Note your Project ID and Dataset name
```

### 2. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.sanity.example .env.local
```

Edit `.env.local` with your Sanity credentials:

```env
SANITY_PROJECT_ID=your_project_id_here
SANITY_DATASET=production
SANITY_READ_TOKEN=your_read_token_here
SANITY_API_TOKEN=your_api_token_here
```

**Getting your tokens:**

1. Go to https://manage.sanity.io/projects/YOUR_PROJECT_ID
2. Click **API** in the sidebar
3. Generate a **read-only token** for `SANITY_READ_TOKEN`
4. Generate a **deployment token** for `SANITY_API_TOKEN`

### 3. Install Sanity Studio Dependencies

```bash
cd sanity
npm install
cd ..
```

### 4. Run the Sanity Studio Locally

```bash
npm run sanity:dev
```

The studio will open at `http://localhost:3333`

### 5. Deploy Sanity Studio

```bash
npm run sanity:deploy
```

This deploys your studio to `https://YOUR_PROJECT_ID.sanity.studio`

## Schema Overview

### Author

```yaml
- name: string (required)
- slug: slug (auto-generated from name)
- bio: text
- email: string (email format)
- image: image with alt text
- twitter: URL
- linkedin: URL
- github: URL
- website: URL
```

**Usage:** Referenced by articles for byline and bio.

### Article

```yaml
- title: string (required)
- slug: slug (auto-generated from title, required)
- description: text
- excerpt: text (160-200 chars for social)
- author: reference to Author (required)
- publishedAt: datetime
- updatedAt: datetime
- content: array of blocks and images (required)
- keywords: array of strings (8-10 for SEO)
- tags: array of strings (topic/category)
- featured: boolean (for homepage highlighting)
- featuredImage: image with alt text
- readingTime: number (minutes)
```

**Usage:** Fetched by Eleventy during build via `src/_data/sanity.js`. Data
available as `{{ article }}` in templates.

### Design Style

```yaml
- title: string (required)
- slug: slug (auto-generated from title, required)
- description: text
- historicalBackground: rich text blocks
- colorPalette: array of objects
  - name: string
  - hexCode: string
  - usage: text
- typographyGuidance: rich text blocks
- sampleImages: array of images with alt + caption
- gallerySubmissions: array of references to GallerySubmission
- createdAt: datetime
```

**Usage:** Document all design systems (Swiss, Brutalism, Nordic, etc.).
Featured on `/about-site/` or dedicated design pages.

### Gallery Submission

```yaml
- submitterInfo: object (required)
  - name: string
  - email: string (email format)
  - website: URL (optional)
- submissionUrl: URL (required)
- screenshot: image with alt text (required)
- styleReference: reference to DesignStyle (required)
- description: text
- status: string (submitted | under-review | approved | featured | rejected)
- submissionDate: datetime
- reviewNotes: text (for admins)
```

**Workflow:** Users submit designs → Admins review → Status changes → Only
"approved" and "featured" appear on site.

## Using Sanity Data in Eleventy

### In Nunjucks Templates

```nunjucks
{# Articles #}
{% for article in sanity.articles %}
  <h2>{{ article.title }}</h2>
  <p>By {{ article.author.name }}</p>
  <p>{{ article.excerpt }}</p>
{% endfor %}

{# Design Styles #}
{% for style in sanity.designStyles %}
  <h3>{{ style.title }}</h3>
  <p>{{ style.description }}</p>
{% endfor %}
```

### In .eleventy.js Collections

```javascript
// Fetch articles from Sanity and expose as collection
eleventyConfig.addCollection("sanityArticles", async function () {
  const { getArticles } = await import("./src/_data/sanity.js");
  return await getArticles();
});
```

### Fetching Specific Content

```javascript
// In src/_data/sanity.js
import { getArticleBySlug, getDesignStyleBySlug } from "./sanity.js";

const article = await getArticleBySlug("my-article-slug");
const style = await getDesignStyleBySlug("swiss-international");
```

## Build Process Integration

When you run `npm run build`:

1. **Eleventy build start** → `src/_data/sanity.js` executes
2. **Sanity API calls** → Fetches all articles, design styles, gallery
   submissions
3. **Collections created** → Data available in templates
4. **HTML generated** → Static site with Sanity content

**Note:** The build requires:

- `SANITY_PROJECT_ID` and `SANITY_DATASET` in environment
- `SANITY_READ_TOKEN` for API access (read-only is sufficient)

## Common Tasks

### Add a New Article

1. Go to Sanity Studio (`npm run sanity:dev` or
   https://YOUR_PROJECT_ID.sanity.studio)
2. Click **Article** → **Create**
3. Fill in:
   - Title (auto-slugs)
   - Author (select from dropdown)
   - Content (rich text editor)
   - Excerpt (for social media)
   - Keywords (for SEO)
   - Featured Image (optional)
4. **Publish** when ready
5. Run `npm run build` to regenerate site

### Review a Gallery Submission

1. In Sanity Studio, go to **Gallery Submission**
2. Click the submission to review
3. Change **Status** from "submitted" → "under-review" → "approved"
4. Add optional **Review Notes**
5. **Publish**
6. Regenerate site (`npm run build`)

### Create a New Design Style

1. In Sanity Studio, create a new **Design Style**
2. Fill in:
   - Title (e.g., "Swiss International")
   - Color Palette (add each color with hex code and usage)
   - Typography Guidance (rich text)
   - Sample Images (upload screenshots)
3. **Publish**
4. Submissions can now reference this style

### Link Gallery Submissions to Design Style

1. Open a **Design Style** in Sanity
2. In the **Gallery Submissions** field, click **Add**
3. Select from the list of "approved" or "featured" submissions
4. **Publish**

## Environment Variables Quick Reference

| Variable            | Purpose              | Example        |
| ------------------- | -------------------- | -------------- |
| `SANITY_PROJECT_ID` | Your project ID      | `abc123def456` |
| `SANITY_DATASET`    | Dataset to query     | `production`   |
| `SANITY_READ_TOKEN` | API token for reads  | `sk_...`       |
| `SANITY_API_TOKEN`  | API token for writes | `sk_...`       |

## Troubleshooting

**"Error: SANITY_PROJECT_ID is not defined"**

- Check that `.env.local` exists in project root (not in `/sanity`)
- Verify variables are set correctly in `.env.local`

**"Cannot query Sanity API"**

- Verify your `SANITY_READ_TOKEN` is valid (check Sanity dashboard)
- Confirm `SANITY_PROJECT_ID` and `SANITY_DATASET` match your project

**"Studio not loading at localhost:3333"**

- Run `cd sanity && npm install` to ensure dependencies are installed
- Check that no other service is using port 3333

**Articles not showing on site after publish**

- Run `npm run build` to fetch latest data
- Check browser cache (hard refresh with Ctrl+Shift+R)
- Verify article has a valid author reference

## Next Steps

1. **Set up webhooks** (optional): Have Sanity trigger rebuilds on publish
   - Configure GitHub Actions to rebuild on webhook
   - Add Sanity API token to GitHub Secrets

2. **Add more fields** as needed to schemas (all are in `/sanity/schemas/`)

3. **Create custom UI** in Sanity for complex workflows (desk structure,
   plugins)

4. **Implement Sanity image optimization** with `@sanity/image-url` for
   responsive images

For more info: https://www.sanity.io/docs
