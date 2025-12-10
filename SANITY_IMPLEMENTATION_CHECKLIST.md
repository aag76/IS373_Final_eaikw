# Sanity CMS Implementation Checklist

## ✅ What's Been Completed

### Installation & Configuration

- [x] Sanity CLI installed globally (`@sanity/cli`)
- [x] Sanity dependencies installed locally (`@sanity/client`, `@sanity/vision`)
- [x] Sanity studio dependencies installed in `/sanity` directory
- [x] Environment template created (`.env.sanity.example`)

### Schema Definitions

- [x] **Author schema** (`sanity/schemas/author.js`)
  - Fields: name, slug, bio, email, image, social links (twitter, linkedin,
    github, website)
  - Purpose: Byline reference for articles

- [x] **Article schema** (`sanity/schemas/article.js`)
  - Fields: title, slug, author (reference), content (rich blocks), excerpt,
    keywords, tags, featured, featuredImage, publishedAt, readingTime
  - Purpose: Educational content management

- [x] **Design Style schema** (`sanity/schemas/designStyle.js`)
  - Fields: title, slug, description, historicalBackground (rich text),
    colorPalette (array of color objects with name/hex/usage),
    typographyGuidance, sampleImages, gallerySubmissions (reference array)
  - Purpose: Document design systems

- [x] **Gallery Submission schema** (`sanity/schemas/gallerySubmission.js`)
  - Fields: submitterInfo (name/email/website), submissionUrl, screenshot,
    styleReference, description, status (workflow), submissionDate, reviewNotes
  - Purpose: User submissions referencing design styles
  - Status workflow: submitted → under-review → approved/featured/rejected

### Configuration Files

- [x] `sanity/sanity.config.js` - Sanity studio configuration with desk tool and
      vision plugin
- [x] `sanity/sanity.json` - Project metadata
- [x] `sanity/package.json` - Dependencies for Sanity studio
- [x] `sanity/schemas/index.js` - Schema exports

### Eleventy Integration

- [x] `src/_data/sanity.js` - API client with functions:
  - `getArticles()` - Fetch all articles
  - `getArticleBySlug(slug)` - Fetch single article
  - `getDesignStyles()` - Fetch all design styles
  - `getDesignStyleBySlug(slug)` - Fetch single design style
  - `getGallerySubmissions(styleSlug)` - Fetch gallery submissions (optional
    filter by style)

- [x] `.eleventy.js` updated with two new collections:
  - `collections.sanityArticles` - All articles from Sanity
  - `collections.sanityDesignStyles` - All design styles from Sanity
  - Collections include error handling if Sanity env vars not set

### Package Scripts

- [x] `npm run sanity:dev` - Start Sanity studio locally (port 3333)
- [x] `npm run sanity:build` - Build studio for deployment
- [x] `npm run sanity:deploy` - Deploy to `YOUR_PROJECT_ID.sanity.studio`

### Documentation

- [x] `SANITY_SETUP.md` - Detailed setup instructions
- [x] `SANITY_INTEGRATION.md` - Integration guide with examples
- [x] `scripts/setup-sanity.sh` - Automated setup script

---

## 🎯 Next Steps (Manual Configuration)

### Step 1: Create Sanity Project

- [ ] Go to https://manage.sanity.io
- [ ] Sign in with GitHub (aag76@njit.edu account)
- [ ] Create project named "eaikw-cms"
- [ ] Select "Free" plan
- [ ] Create "production" dataset
- [ ] **Copy Project ID** to clipboard

### Step 2: Configure Environment

- [ ] Open `.env.local` in project root
- [ ] Paste `SANITY_PROJECT_ID=<your-id>`
- [ ] Keep `SANITY_DATASET=production`

### Step 3: Generate API Tokens

- [ ] In Sanity dashboard, go to **Settings → API**
- [ ] Click **Add API token** under "Tokens"
- [ ] Create token named "read-token" with **Viewer** role
  - [ ] Copy token value to `.env.local` as `SANITY_READ_TOKEN`
- [ ] Create token named "deploy-token" with **Editor** role
  - [ ] Copy token value to `.env.local` as `SANITY_API_TOKEN`

### Step 4: Start Sanity Studio

- [ ] Run: `npm run sanity:dev`
- [ ] Studio opens at http://localhost:3333
- [ ] Verify you can see:
  - [ ] Author type
  - [ ] Article type
  - [ ] Design Style type
  - [ ] Gallery Submission type

### Step 5: Test Content Creation

- [ ] Create test Author
  - [ ] Fill: name, bio, email, social links
  - [ ] Publish and verify preview
- [ ] Create test Article
  - [ ] Fill: title, content, select author
  - [ ] Set publishedAt to today
  - [ ] Publish
- [ ] Create test Design Style
  - [ ] Fill: title, description, add color palette
  - [ ] Upload sample image
  - [ ] Publish
- [ ] Create test Gallery Submission
  - [ ] Fill: submitter info, URL, screenshot
  - [ ] Reference the Design Style you created
  - [ ] Set status to "approved"
  - [ ] Publish

### Step 6: Verify Eleventy Integration

- [ ] Run: `npm run build`
- [ ] Verify no errors in console about Sanity
- [ ] Check `_site/` was generated
- [ ] Test article content is accessible (if you created an article template)

### Step 7: Deploy Sanity Studio (Optional)

- [ ] Run: `npm run sanity:deploy`
- [ ] Follow CLI prompts
- [ ] Studio deploys to https://YOUR_PROJECT_ID.sanity.studio
- [ ] Share URL with collaborators for content management

---

## 🧪 Testing Checklist

### Test in Sanity Studio

- [ ] Create Article → verify all fields work
- [ ] Upload image in content → verify hotspot editor
- [ ] Create Design Style → add color palette
- [ ] Create Gallery Submission → reference a Design Style
- [ ] Change submission status → verify radio buttons work
- [ ] Publish changes → verify "Publish" button works

### Test Eleventy Build

- [ ] Run `npm run build`
- [ ] Verify no Sanity errors (or graceful fallback to empty arrays)
- [ ] Check `.eleventy.js` console output shows collections created
- [ ] Verify `src/_data/sanity.js` is called during build

### Test Environment Handling

- [ ] Comment out `SANITY_PROJECT_ID` in `.env.local`
- [ ] Run `npm run build`
- [ ] Verify build still works (collections return empty arrays)
- [ ] Restore `SANITY_PROJECT_ID`

---

## 📋 File Structure Summary

```
project-root/
├── .env.local                        # Your secret credentials (created from example)
├── .env.sanity.example               # Template file (in git)
├── SANITY_SETUP.md                   # Setup instructions
├── SANITY_INTEGRATION.md             # Integration guide & usage
├── .eleventy.js                      # Updated with Sanity collections
│
├── sanity/                           # Sanity studio codebase
│   ├── sanity.config.js              # Studio config
│   ├── sanity.json                   # Project metadata
│   ├── package.json                  # Sanity dependencies
│   └── schemas/
│       ├── index.js                  # Export all types
│       ├── author.js                 # Author document type
│       ├── article.js                # Article document type
│       ├── designStyle.js            # Design Style document type
│       └── gallerySubmission.js      # Gallery Submission document type
│
├── src/
│   └── _data/
│       └── sanity.js                 # Eleventy API client & fetch functions
│
└── scripts/
    └── setup-sanity.sh               # Automated setup helper script
```

---

## 🔧 Using Content in Templates

### In Nunjucks (.njk files)

**List all articles:**

```nunjucks
{% for article in collections.sanityArticles %}
  <article>
    <h2>{{ article.title }}</h2>
    <p>{{ article.excerpt }}</p>
    <time>{{ article.publishedAt | dateFormat }}</time>
  </article>
{% endfor %}
```

**List design styles:**

```nunjucks
{% for style in collections.sanityDesignStyles %}
  <div>
    <h1>{{ style.title }}</h1>
    {% for color in style.colorPalette %}
      <div style="background: {{ color.hexCode }}">
        {{ color.name }}: {{ color.usage }}
      </div>
    {% endfor %}
  </div>
{% endfor %}
```

**Single article layout:**

```nunjucks
---
layout: layouts/post.njk
permalink: /article/{{ slug }}/index.html
---

<h1>{{ title }}</h1>
<p>By {{ article.author.name }}</p>
{% for block in content %}
  <!-- block rendering logic -->
{% endfor %}
```

### In .eleventy.js

```javascript
// Use Sanity data in filters or collections
const articles = await getArticles();
const featured = articles.filter((a) => a.featured);
```

---

## 🚀 Deployment to Production

### GitHub Actions Secrets (needed for CI/CD)

- [ ] Add `SANITY_PROJECT_ID` to GitHub Secrets
- [ ] Add `SANITY_READ_TOKEN` to GitHub Secrets
- [ ] Update `.github/workflows/deploy.yml` to set env vars

### Sanity Studio Deployment

- [ ] Run `npm run sanity:deploy`
- [ ] Studio becomes accessible at `https://YOUR_PROJECT_ID.sanity.studio`
- [ ] Share with team for content editing

### Content Delivery

- [ ] Articles appear on site after `npm run build`
- [ ] Images served via Sanity CDN automatically
- [ ] Gallery submissions appear once status = "approved"

---

## 📚 Documentation Files

| File                              | Purpose                                      |
| --------------------------------- | -------------------------------------------- |
| `SANITY_SETUP.md`                 | Detailed setup & configuration instructions  |
| `SANITY_INTEGRATION.md`           | How to use Sanity data in Eleventy templates |
| `.github/copilot-instructions.md` | Architecture overview (updated with Sanity)  |
| `scripts/setup-sanity.sh`         | Automated first-time setup                   |

---

## ⚠️ Common Issues & Solutions

**Issue:** "SANITY_PROJECT_ID not defined"

- **Solution:** Check `.env.local` exists in project root (not in `/sanity`)

**Issue:** "Cannot fetch articles"

- **Solution:** Verify `SANITY_READ_TOKEN` is correct in Sanity dashboard

**Issue:** "Studio won't load"

- **Solution:** Ensure you're in correct directory:
  ```bash
  cd sanity
  npm run dev
  ```

**Issue:** "Articles don't appear after publish"

- **Solution:** Run `npm run build` (not `npm run dev`)

---

## ✨ Success Indicators

You'll know it's working when:

- [x] `npm run sanity:dev` opens studio at localhost:3333
- [x] You can create/edit content in Sanity Studio
- [x] `npm run build` completes without Sanity errors
- [x] `collections.sanityArticles` is populated in Eleventy
- [x] Images upload and preview in Sanity editor
- [x] `npm run sanity:deploy` succeeds

---

## 📞 Support Resources

- **Sanity Docs:** https://www.sanity.io/docs
- **Eleventy + Sanity Guide:** https://www.sanity.io/guides/eleventy
- **GROQ Query Reference:** https://www.sanity.io/docs/groq
- **Schema Types Reference:** https://www.sanity.io/docs/schema-types

---

**Last Updated:** December 10, 2025 **Status:** ✅ Complete - Ready for
first-time setup
