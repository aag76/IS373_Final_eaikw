# Professional Eleventy Portfolio Site

**Tech Stack:** Eleventy 3.x + Nunjucks + Vanilla JS + TailwindCSS + esbuild  
**Build System:** Parallel CSS (TailwindCSS), JS (esbuild), & Eleventy compilation  
**Hosting:** GitHub Pages (subpath: `/218_portfolio/`)  
**Design:** Swiss International Style (bold typography, minimal color, functional grids)

## Architecture Overview

### Build Process (`npm run build` = 3 concurrent pipes)

1. **CSS Pipeline:** `src/css/tailwind.css` → TailwindCSS → `_site/css/main.css` (minified)
2. **JS Pipeline:** 8 separate IIFE bundles (esbuild) → `_site/js/*.bundle.js` (minified, sourcemaps)
3. **Eleventy:** Markdown/Nunjucks → Static HTML, collections, RSS, sitemap

See `build-alpine.js` for JS bundle mappings. All 3 pipes run **in parallel** via `npm-run-all`. CSS/JS are built **separately** from Eleventy because they have custom tooling.

### Data Flow: Front Matter → Collections → Templates → HTML

**Blog/Project Creation:**
1. Create markdown file in `src/blog/` or `src/projects/` with YAML front matter
2. Must include: `layout`, `title`, `date`, `tags` (must include 'blog'/'projects' for collection)
3. Optional SEO fields: `keywords[]`, `excerpt`, `description`
4. `.eleventy.js` auto-collects via glob patterns and exposes as `collections.blog` & `collections.projects`
5. Nunjucks templates access front matter via `{{ title }}`, `{{ tags }}`, etc.

**Template Inheritance:**
- `src/_layouts/base.njk` - Root layout (JSON-LD schema, base HTML, nav, footer)
- `src/_includes/layouts/post.njk` - Blog post wrapper (meta, date, tags, navigation)
- `src/_includes/layouts/project.njk` - Project showcase wrapper
- `src/_includes/layouts/project-chapters.njk` - Multi-chapter project variant
- All extend base.njk, all use Nunjucks syntax

### CSS Architecture (Swiss Design System)

**Foundation in `tailwind.config.js`:**
- Custom properties (CSS variables) for Swiss color palette: `--swiss-black`, `--swiss-red`, `--swiss-gray-*`
- Fluid typography scale: `--fluid-display`, `--fluid-h1`, `--fluid-h2`, etc.
- Swiss grid: 12-column, 1.5rem gutters, asymmetric layouts (7:5, 8:4 splits)
- No rounded corners, shadows, or gradients; borders and lines are structural

**Tailwind is the primary** CSS tool (utility-first). Custom CSS properties provide theme values. Swiss grid system (`swiss-grid`, `swiss-col-*`) uses CSS variables for precision alignment.

### JavaScript Pattern (Vanilla, no frameworks)

Each feature has a dedicated bundle (esbuild IIFE format):
- `mobile-menu.js` → Hamburger menu state management (DOM-first class)
- `smooth-scroll.js` → Intersection Observer for scroll effects
- `stakeholder-enhanced.js` → Interactive card state for "work-with-me" page
- Others: project filters, about animations, navigation

**Convention:** Class-based, vanilla DOM API, no external dependencies. **Loading:** Async script tags with `defer` attribute in templates. All scripts are CSP-safe (no inline event handlers).

### Image Optimization Pipeline

`.eleventy.js` exposes `{% image src alt sizes %}` async shortcode:
- Generates WebP + JPEG at 300/600/1200px widths
- Lazy-loads, async-decodes, responsive with `<picture>` tags
- Output goes to `_site/images/` with generated filenames

### Collections & Filters (`.eleventy.js`)

**Collections:**
- `collections.blog` - All markdown files in `src/blog/` (reversed = newest first)
- `collections.projects` - All markdown files in `src/projects/` (reversed)
- `collections.all` - Every page (used for sitemap/RSS priority logic)

**Key Filters:**
- `dateFormat` / `readableDate` - Format dates (handles invalid dates gracefully)
- `dateToISO` - Convert to ISO 8601 for schema.org
- `excerpt` - Strip HTML, truncate to 200 chars
- `limit(array, n)` - Slice for pagination
- `getPreviousCollectionItem` / `getNextCollectionItem` - Blog nav links
- `baseUrl(url)` - Apply GitHub Pages path prefix (respects `process.env.PATH_PREFIX`)

## Critical Developer Workflows

### Local Development
```bash
npm run dev              # Watches all 3 pipes, serves on localhost:8080
npm run build:css       # Rebuild CSS only (debug mode)
npm run watch:js        # Rebuild JS only (watch mode)
npm run build:eleventy  # Rebuild HTML only
```

### Testing & Quality
```bash
npm run test            # Playwright visual/functional tests (requires running server)
npm run test:headed     # See browser UI during test run
npm run test:update     # Update visual snapshots
npm run lint            # Run all linters (JS, CSS, Markdown)
npm run lint:fix        # Auto-fix formatting + lint issues
npm run validate        # Full pipeline: lint:fix → build → test (pre-commit)
```

### Deployment
- **GitHub Actions** (`.github/workflows/deploy.yml`) triggers on `main` branch push
- Builds site, runs tests, deploys to `gh-pages` branch
- Path prefix (`/218_portfolio/`) is set via `build` script

## Patterns & Conventions (Non-obvious)

### Front Matter in Markdown
Blog posts **must** include YAML block at top:
```yaml
---
layout: layouts/post.njk      # Required; must point to existing template
title: "Post Title"            # Required; used in HTML, collections, feeds
description: "Brief summary"   # Recommended; used in meta tags
date: 2025-01-15              # Required; ISO format (YYYY-MM-DD); controls sort order
tags: ["blog", "topic1"]      # Required; "blog" triggers collection inclusion
keywords: ["seo", "keywords"] # Optional; 8-10 per post for SEO
excerpt: "Social media hook"  # Optional; 160-200 chars; used in feeds
---
```

### Nunjucks Syntax Quirks
- `{{ variable }}` for output (Jinja2-like)
- `{% for item in array %}...{% endfor %}` for loops
- `{% if condition %}...{% endif %}` for conditionals
- `{{ var | filter }}` for filters (chainable)
- `{# comment #}` for comments (not rendered)
- `{% import "path/file.njk" as name %}` and `{{ name.macro() }}` for components

### Swiss Design Inline Styles
Site **heavily uses inline styles** (not CSS classes) for:
- Grid asymmetry: `style="padding-right: var(--space-3xl);"` + `class="swiss-col-7 md:swiss-col-5"`
- Color properties: `style="color: var(--swiss-gray-600);"`
- Typography: `style="font-size: var(--fluid-h1); letter-spacing: -0.02em;"`

This hybrid approach (Tailwind utilities + inline CSS vars) is intentional for design flexibility. When updating styles, check **both** the CSS class and inline `style` attributes.

### Collection Navigation
Blog posts have previous/next links via filters:
```nunjucks
{% set prevPost = collections.blog | getPreviousCollectionItem(page) %}
{% set nextPost = collections.blog | getNextCollectionItem(page) %}
```
These depend on collection order (reversed = newest first). Adding/removing posts auto-updates links.

### SEO & Structured Data
- All pages include JSON-LD Person schema in `base.njk` (header person, NJIT affiliation)
- Blog posts auto-get `BlogPosting` schema with keywords/excerpt if frontmatter provided
- RSS/sitemap generated from collections with priority rules:
  - Home: 1.0, Blog/Projects: 0.8, Others: 0.5
  - Blog posts: monthly changefreq (rarely updated after publication)

### Docker Workflow
- **Dev:** `docker compose --profile dev up` mounts source, live-reloads, port 8080
- **Prod:** `docker compose --profile production up` uses multi-stage build, Nginx, optimized image
- Both defined in `docker-compose.yml`; Dockerfile.dev for live-reload, Dockerfile for production

## Common Tasks

**Add a blog post:**
1. Create `src/blog/my-slug.md` with YAML frontmatter (see above)
2. `npm run dev` to preview
3. Push to trigger GitHub Actions deployment

**Update navigation:**
- Edit `src/_includes/layouts/base.njk` (header nav links)
- Navigation is hardcoded (no data-driven nav collection)

**Add a project:**
1. Create `src/projects/project-slug.md` (same frontmatter as blog)
2. Use `layout: layouts/project.njk` (or `project-chapters.njk` for multi-part)
3. Include `technologies: ["Tech1", "Tech2"]` frontmatter for display

**Update site-wide metadata:**
- Edit `src/_data/site.json` (title, description, author, social links)
- Accessible in all templates as `{{ site.title }}`, etc.
- Used in base.njk for JSON-LD schema and meta tags

**Fix visual/performance issues:**
1. CSS issues → Check `tailwind.config.js` + inline styles in templates
2. JS issues → Check `src/js/*.js` and esbuild config in `build-alpine.js`
3. Build issues → Check `.eleventy.js` (collections, filters, plugins)

## File Reference

| File | Purpose |
|------|---------|
| `.eleventy.js` | Core config: collections, filters, plugins, image optimization |
| `build-alpine.js` | esbuild JS bundling (8 bundles, parallel) |
| `tailwind.config.js` | TailwindCSS config + Swiss design tokens |
| `src/_layouts/base.njk` | Root template: HTML structure, nav, JSON-LD schema |
| `src/_includes/layouts/*.njk` | Post/project/chapters templates (extend base) |
| `src/_data/site.json` | Global metadata (title, author, social, URL) |
| `src/blog/` | Markdown blog posts with YAML frontmatter |
| `src/projects/` | Markdown project pages with YAML frontmatter |
| `src/js/*.js` | Vanilla JS modules (bundled separately) |
| `playwright.config.ts` | E2E test config (baseURL: http://localhost:8765) |
