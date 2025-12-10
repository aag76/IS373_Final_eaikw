# Sanity CMS First-Time Walkthrough

A step-by-step guide to get Sanity running in 10 minutes.

## Prerequisites

- Node.js and npm installed
- GitHub account (aag76@njit.edu)
- Web browser

## Step 1: Create Your Sanity Project (2 minutes)

### 1a. Go to Sanity Dashboard

Open: **https://manage.sanity.io**

You should see:

```
✓ You are logged in as aag76@njit.edu using GitHub
```

### 1b. Create New Project

Click: **Create new project**

Fill in:

- **Project name:** `eaikw-cms`
- **Organization:** Keep default
- **Plan:** Select "Free" plan
- **Dataset:** `production`

**Click "Create"**

### 1c. Copy Your Project ID

After creation, you'll see your dashboard. Look for:

```
Project ID: abc123def456...
```

**Copy this value** - you'll need it in 30 seconds.

---

## Step 2: Configure Your Environment (1 minute)

### 2a. Create .env.local

In your project root (NOT in `/sanity`):

```bash
cp .env.sanity.example .env.local
```

### 2b. Edit .env.local

Open `.env.local` and find this line:

```env
SANITY_PROJECT_ID=YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with the ID you copied. Example:

```env
SANITY_PROJECT_ID=abc123def456
```

Keep the other fields as-is for now:

```env
SANITY_DATASET=production
SANITY_READ_TOKEN=
SANITY_API_TOKEN=
```

**Save the file.**

---

## Step 3: Generate API Tokens (3 minutes)

### 3a. Go to API Settings

In Sanity dashboard:

1. Click your **Project name** (top left)
2. Go to **Settings**
3. Click **API**

You should see:

```
Project ID: abc123def456
Dataset(s): production
```

### 3b. Create Read-Only Token

Under **Tokens**, click **Add API token**

Fill in:

- **Label:** `read-token`
- **Permissions:** Select "Viewer" (read-only)

**Click "Create"**

A token appears:

```
sk_production_abc123...
```

**Copy it.**

### 3c. Add Token to .env.local

Edit `.env.local`:

```env
SANITY_READ_TOKEN=sk_production_abc123...
```

### 3d. Create Deploy Token (Optional for now)

Repeat 3b, but:

- **Label:** `deploy-token`
- **Permissions:** Select "Editor"
- **Copy and add to .env.local** as `SANITY_API_TOKEN`

---

## Step 4: Start Sanity Studio (1 minute)

### 4a. Run Development Server

```bash
npm run sanity:dev
```

You should see:

```
Listening on http://localhost:3333
CTRL + C to stop
```

### 4b. Open Studio in Browser

Visit: **http://localhost:3333**

You should see the Sanity Studio interface with:

- Left sidebar showing document types:
  - Article
  - Author
  - Design Style
  - Gallery Submission

---

## Step 5: Create Your First Author (2 minutes)

### 5a. Click Author

In left sidebar, click **Author**

### 5b. Create New

Click **Create**

### 5c. Fill in Form

```
Name: "You" (or your name)
Email: your@email.com
Bio: "Testing Sanity CMS"
```

Leave image and social links blank for now.

### 5d. Publish

Click **Publish** button (top right)

You should see:

```
✓ Published
```

---

## Step 6: Create Your First Article (3 minutes)

### 6a. Click Article

In left sidebar, click **Article**

### 6b. Create New

Click **Create**

### 6c. Fill in Form

```
Title: "My First Article with Sanity"
```

The slug auto-generates:

```
Slug: my-first-article-with-sanity
```

### 6d. Select Author

Find the **Author** field and click the dropdown.

Select the author you just created.

### 6e. Write Content

Click the **Content** field and write:

```
## Hello Sanity!

This is my first article managed in Sanity CMS.

It supports:
- Rich text formatting
- Lists and nesting
- And more...
```

### 6f. Add Metadata

Scroll down and fill:

```
Excerpt: "Testing the Sanity CMS integration with Eleventy"
Keywords: ["sanity", "cms", "eleventy", "headless"]
Tags: ["test", "cms"]
```

### 6g. Publish

Click **Publish**

You should see:

```
✓ Published
```

---

## Step 7: Create a Design Style (2 minutes)

### 7a. Click Design Style

In left sidebar, click **Design Style**

### 7b. Create New

Click **Create**

### 7c. Fill in Basic Info

```
Title: "Swiss Minimalism"
Description: "Clean, functional design with bold typography"
```

The slug auto-generates.

### 7d. Add Colors

Find **Color Palette** → Click **Add**

```
Color Name: "Swiss Black"
Hex Code: "#000000"
Usage: "Primary text, borders, structural elements"
```

Click **Add** again:

```
Color Name: "Swiss Red"
Hex Code: "#EF476F"
Usage: "Accent color, highlights, CTAs"
```

### 7e. Publish

Click **Publish**

---

## Step 8: Test Gallery Submission (2 minutes)

### 8a. Click Gallery Submission

In left sidebar, click **Gallery Submission**

### 8b. Create New

Click **Create**

### 8c. Fill in Submitter Info

```
Submitter Name: "Test User"
Email: test@example.com
Website: (leave blank)
```

### 8d. Add Submission Details

```
Submission URL: "https://example.com"
Screenshot: (Upload any image or skip)
Description: "Testing the gallery submission workflow"
```

### 8e. Select Design Style

Find **Style Reference** → Click dropdown

Select the "Swiss Minimalism" design style you just created

### 8f. Set Status

Find **Status** → Select "approved"

### 8g. Publish

Click **Publish**

---

## Step 9: Verify Eleventy Integration (1 minute)

### 9a. Stop Sanity Studio

In your terminal where `npm run sanity:dev` is running:

```
CTRL + C
```

### 9b. Build the Site

```bash
npm run build
```

Watch the console. You should see:

```
✓ Eleventy collections created
✓ Fetched articles from Sanity
✓ Fetched design styles from Sanity
...
Build complete!
```

### 9c. Check Output

The build should complete without Sanity errors. If you see:

```
✓ collections.sanityArticles: 1 items
✓ collections.sanityDesignStyles: 1 items
```

**Success!** 🎉

---

## Step 10: See Your Content in Templates

### 10a. View Templates

Any Nunjucks template can now access your Sanity data:

```nunjucks
{% for article in collections.sanityArticles %}
  <article>
    <h1>{{ article.title }}</h1>
    <p>By {{ article.author.name }}</p>
    <p>{{ article.excerpt }}</p>
  </article>
{% endfor %}

{% for style in collections.sanityDesignStyles %}
  <section>
    <h2>{{ style.title }}</h2>
    <p>{{ style.description }}</p>
    {% for color in style.colorPalette %}
      <div style="background: {{ color.hexCode }}">
        {{ color.name }}
      </div>
    {% endfor %}
  </section>
{% endfor %}
```

### 10b. Verify in Build Output

Check `_site/` for generated HTML pages.

Your content should be there!

---

## What You Just Did

✅ Created a Sanity project ✅ Configured environment variables ✅ Generated API
tokens ✅ Started the Sanity Studio ✅ Created an Author ✅ Created an Article
✅ Created a Design Style ✅ Created a Gallery Submission ✅ Built the site with
Eleventy ✅ Verified Sanity content is accessible in templates

---

## Next: Go Live

### Option A: Develop Locally (Default)

Continue using:

```bash
npm run sanity:dev      # Edit content
npm run dev             # View site changes
```

### Option B: Deploy Sanity Studio (Share with Team)

```bash
npm run sanity:deploy
```

Your studio becomes available at:

```
https://abc123def456.sanity.studio
```

Anyone you invite can edit content there.

### Option C: Set Up CI/CD (Auto-Rebuild)

1. Add `SANITY_PROJECT_ID` and `SANITY_READ_TOKEN` to GitHub Secrets
2. Update `.github/workflows/deploy.yml` to set environment
3. On each push → GitHub Actions fetches latest content → Auto-builds

---

## Common Questions

### Q: Where is my content stored?

**A:** In Sanity's cloud database. You access it via the Studio UI.

### Q: Can multiple people edit at the same time?

**A:** Yes! Deploy the studio to `https://YOUR_PROJECT_ID.sanity.studio` and
invite collaborators.

### Q: How do I delete content?

**A:** Open the document in Studio, click the three dots (**⋮**), select
**Delete**.

### Q: What if I make a mistake?

**A:** You can undo changes in the Studio. Click **Document History** to see all
versions.

### Q: How often does the site update?

**A:** Run `npm run build` whenever you publish content. Or set up GitHub
Actions to auto-build.

### Q: Do I need to know GROQ?

**A:** No! The API client in `src/_data/sanity.js` handles all queries. Just use
the collections.

### Q: Can I modify the schemas?

**A:** Yes! Edit files in `sanity/schemas/` and restart `npm run sanity:dev`.

---

## Troubleshooting

### Studio won't load (http://localhost:3333 blank)

```bash
cd sanity
npm install
npm run dev
```

### "Cannot connect to Sanity API"

Check `.env.local`:

- Is `SANITY_PROJECT_ID` set correctly?
- Is `SANITY_READ_TOKEN` valid?

Verify in Sanity dashboard that your token hasn't expired.

### Articles don't appear after publishing

1. Did you click **Publish**? (Not just "Save")
2. Run `npm run build` to fetch fresh data
3. Check `_site/` was regenerated

### Images not loading in article

Make sure you:

- Upload via Sanity's image uploader (not paste external URL)
- Set alt text for accessibility
- Sanity serves images from CDN automatically

---

## Resources

- **Sanity Docs:** https://www.sanity.io/docs
- **GROQ Guide:** https://www.sanity.io/docs/groq
- **Schema Types:** https://www.sanity.io/docs/schema-types
- **Eleventy + Sanity:** https://www.sanity.io/guides/eleventy

---

## What's Next?

1. **Create more content** to get familiar with the Studio
2. **Deploy Studio** so you can access it from anywhere
3. **Build template pages** to showcase your articles and styles
4. **Set up webhooks** for auto-rebuilds on publish (optional)
5. **Invite team members** to edit content collaboratively

---

**🎉 Congratulations!** You now have a fully functional Sanity CMS integrated
with your Eleventy portfolio. The hard part is done—now just create content!
