# Headless CMS Evaluation Report

**Project:** Design Gallery Portfolio Site  
**Team:** IS373 Final Project  
**Date:** December 16, 2025  
**Evaluated By:** Project Team

---

## Executive Summary

This report evaluates three headless CMS options for our Eleventy-based
portfolio and design gallery site: **Sanity**, **Airtable**, and **Contentful**.
After comprehensive analysis across seven key criteria, we selected **Sanity**
as our primary CMS with **Airtable** as a complementary data backend for form
submissions.

---

## CMS Options Evaluated

1. **Sanity** - Structured content platform with real-time collaboration
2. **Airtable** - Spreadsheet-database hybrid with API access
3. **Contentful** - Enterprise-grade headless CMS with visual editor

---

## Comparison Table

| Criteria                 | Sanity                                                   | Airtable                                               | Contentful                                           |
| ------------------------ | -------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| **Data Modeling**        | ⭐⭐⭐⭐⭐ Schemas as code, portable text, custom types  | ⭐⭐⭐ Spreadsheet-style tables, limited relationships | ⭐⭐⭐⭐ Visual content modeling, good relationships |
| **API/Querying**         | ⭐⭐⭐⭐⭐ GROQ query language, GraphQL, real-time       | ⭐⭐⭐ REST API, simple filtering, formula fields      | ⭐⭐⭐⭐ REST + GraphQL, good filtering              |
| **Developer Experience** | ⭐⭐⭐⭐⭐ Excellent DX, TypeScript support, local dev   | ⭐⭐⭐⭐ Simple API, good docs, easy to start          | ⭐⭐⭐ Good but complex, steep learning curve        |
| **Editorial Workflow**   | ⭐⭐⭐⭐⭐ Sanity Studio, customizable, real-time collab | ⭐⭐⭐ Spreadsheet UI, familiar but limited            | ⭐⭐⭐⭐ Strong workflows, approval chains           |
| **Pricing & Limits**     | ⭐⭐⭐⭐⭐ Free tier generous (3 users, unlimited API)   | ⭐⭐⭐⭐ Free tier: 1,200 records/base                 | ⭐⭐ Expensive, limited free tier (1 user)           |
| **Eleventy Integration** | ⭐⭐⭐⭐⭐ Perfect fit, `@sanity/client` package         | ⭐⭐⭐⭐ Easy with REST API, good for forms            | ⭐⭐⭐⭐ Good integration, official SDK              |
| **Fit for THIS Project** | ⭐⭐⭐⭐⭐ Ideal for blog, design systems, portfolio     | ⭐⭐⭐⭐ Perfect for submissions, CRM data             | ⭐⭐⭐ Overkill for our needs, too enterprise        |

**Rating Scale:** ⭐ (Poor) to ⭐⭐⭐⭐⭐ (Excellent)

---

## Detailed Analysis

### 1. Data Modeling

#### Sanity ⭐⭐⭐⭐⭐

- **Schemas as code** in JavaScript/TypeScript
- Portable Text for rich content (blocks, marks, annotations)
- Custom field types and validation
- References and relationships between documents
- Version control friendly (schemas in git)

**Example Schema:**

```javascript
export default {
  name: "designStyle",
  type: "document",
  fields: [
    { name: "title", type: "string" },
    { name: "description", type: "text" },
    { name: "colors", type: "array", of: [{ type: "color" }] },
    { name: "principles", type: "array", of: [{ type: "block" }] },
  ],
};
```

**Pros:**

- Fully flexible content modeling
- Type-safe with TypeScript
- Complex nested structures supported
- Portable Text is perfect for blog posts

**Cons:**

- Requires code-based schema definition
- Learning curve for GROQ queries

---

#### Airtable ⭐⭐⭐

- **Spreadsheet-style tables** with columns as fields
- 15+ field types (text, number, attachment, select, etc.)
- Limited relationships (linked records)
- Formula fields for computed values
- No nested structures

**Structure:**

```
Table: Submissions
├── ConfirmationNumber (Single line text)
├── Status (Single select)
├── Email (Email)
├── DemoURL (URL)
└── SubmittedDate (Date)
```

**Pros:**

- Intuitive spreadsheet interface
- Quick setup, no coding required
- Great for tabular data
- Familiar to non-developers

**Cons:**

- Limited content relationships
- No nested/hierarchical data
- Not ideal for rich content (blogs, articles)
- No built-in versioning

---

#### Contentful ⭐⭐⭐⭐

- **Visual content modeling** through web UI
- Good field types and validations
- Content references and relationships
- Localization support
- Spaces and environments

**Pros:**

- Professional content modeling UI
- Strong relationship capabilities
- Enterprise features (workflows, roles)
- Multi-language support

**Cons:**

- Cannot version control schemas
- Vendor lock-in (proprietary format)
- Complex for simple projects
- Expensive beyond free tier

---

### 2. API/Querying

#### Sanity ⭐⭐⭐⭐⭐

- **GROQ** (Graph-Relational Object Queries) - SQL-like query language
- GraphQL support
- Real-time listeners for live updates
- Client libraries for JS, React, Vue, etc.

**GROQ Example:**

```javascript
*[_type == "post" && publishedAt < now()] | order(publishedAt desc) {
  title,
  slug,
  author->{name, image},
  categories[]->title
}
```

**Pros:**

- Powerful, expressive query language
- Fetch exactly what you need
- Real-time subscriptions
- Excellent performance

**Cons:**

- GROQ has learning curve
- Different from GraphQL/REST

---

#### Airtable ⭐⭐⭐

- **REST API** with simple endpoints
- Filter by formula
- Sort and pagination
- Webhooks (paid plans)

**API Example:**

```javascript
const records = await base("Submissions")
  .select({
    filterByFormula: `{Status} = 'pending'`,
    sort: [{ field: "SubmittedDate", direction: "desc" }],
  })
  .all();
```

**Pros:**

- Simple REST API
- Easy to understand
- Good documentation
- Formula-based filtering

**Cons:**

- Basic querying capabilities
- No joins or complex queries
- Rate limits (5 requests/second)
- Limited real-time features

---

#### Contentful ⭐⭐⭐⭐

- REST and GraphQL APIs
- Content Preview API
- Sync API for incremental updates
- CDN-backed delivery

**Pros:**

- Both REST and GraphQL
- Fast CDN delivery
- Preview API for drafts
- Good SDK support

**Cons:**

- API complexity
- More verbose queries
- Rate limits on free tier

---

### 3. Developer Experience

#### Sanity ⭐⭐⭐⭐⭐

- **Local development** with Sanity Studio
- TypeScript support out of the box
- Hot module reloading
- Excellent documentation
- Active community
- Open source core

**Development Setup:**

```bash
npm install sanity @sanity/client
sanity init
sanity dev  # Local studio at localhost:3333
```

**Pros:**

- Best-in-class DX
- Local-first development
- Version control schemas
- TypeScript types generation
- Modular and extensible

**Cons:**

- Initial setup more involved than spreadsheet tools
- Requires Node.js knowledge

---

#### Airtable ⭐⭐⭐⭐

- **No build tools required**
- Web-based interface
- Simple API integration
- Quick prototyping
- Good documentation

**Pros:**

- Fastest time to first API call
- No complex setup
- Visual data management
- Non-developers can contribute

**Cons:**

- No local development
- Limited customization
- Debugging API issues harder
- No TypeScript types

---

#### Contentful ⭐⭐⭐

- Web-based content modeling
- CLI tools available
- SDKs for major frameworks
- Migration scripts

**Pros:**

- Professional tooling
- Good SDK support
- Migration system

**Cons:**

- Steep learning curve
- Complex configuration
- Slower iteration
- More enterprise-focused

---

### 4. Editorial Workflow

#### Sanity ⭐⭐⭐⭐⭐

- **Sanity Studio** - Customizable React-based CMS
- Real-time collaboration
- Draft/publish workflow
- Custom input components
- Document history
- Scheduled publishing (plugin)

**Studio Features:**

- Desk structure customization
- Custom widgets and tools
- Real-time presence indicators
- Inline image editing
- Markdown and rich text

**Pros:**

- Fully customizable editorial experience
- Real-time collaboration
- Great for content teams
- Extensible with plugins

**Cons:**

- Requires hosting Studio (or use Sanity's hosted version)

---

#### Airtable ⭐⭐⭐

- **Spreadsheet interface** familiar to all users
- Views (Grid, Form, Calendar, Gallery)
- Filters and sorts
- Comments on records
- Form views for submissions

**Pros:**

- Zero learning curve for spreadsheet users
- Collaborative (like Google Sheets)
- Multiple view types
- Easy data entry

**Cons:**

- Not designed for rich content
- Limited editorial features
- No draft/publish workflow
- Basic collaboration

---

#### Contentful ⭐⭐⭐⭐

- **Web app** with professional UI
- Workflows and approval chains
- Scheduled publishing
- Roles and permissions
- Content preview

**Pros:**

- Enterprise-grade workflows
- Strong permissions system
- Approval processes
- Scheduled publishing

**Cons:**

- Complex for small teams
- Rigid compared to Sanity
- Requires training

---

### 5. Pricing & Limits

#### Sanity ⭐⭐⭐⭐⭐

**Free Tier:**

- ✅ Unlimited API requests
- ✅ 3 users
- ✅ 2 datasets
- ✅ 10GB bandwidth
- ✅ 5GB assets

**Paid Plans:**

- Growth: $99/month (team features)
- Business: $949/month (enterprise)

**Verdict:** Best free tier for developers

---

#### Airtable ⭐⭐⭐⭐

**Free Tier:**

- ✅ Unlimited bases
- ✅ 1,200 records per base
- ✅ 2GB attachment space per base
- ⚠️ API: 5 requests/second

**Paid Plans:**

- Plus: $10/user/month (5,000 records)
- Pro: $20/user/month (50,000 records)

**Verdict:** Good for small projects, scales with records

---

#### Contentful ⭐⭐

**Free Tier:**

- ⚠️ 1 user only
- ⚠️ 2 locales
- ⚠️ 25,000 records
- ⚠️ 1 million API calls/month

**Paid Plans:**

- Team: $489/month
- Premium: Custom pricing

**Verdict:** Limited free tier, expensive scaling

---

### 6. Eleventy Integration

#### Sanity ⭐⭐⭐⭐⭐

**Integration Pattern:**

```javascript
// src/_data/posts.js
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: "production",
  useCdn: true,
  apiVersion: "2025-01-01",
});

export default async function () {
  return await client.fetch(`*[_type == "post"]`);
}
```

**Pros:**

- Official `@sanity/client` package
- Build-time data fetching
- Incremental builds support
- Image transformation pipeline
- Perfect for static sites

**Cons:**

- None significant

---

#### Airtable ⭐⭐⭐⭐

**Integration Pattern:**

```javascript
// netlify/functions/submissions.js
const Airtable = require("airtable");
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(
  process.env.AIRTABLE_BASE_ID
);

exports.handler = async (event) => {
  const records = await base("Submissions").select().all();
  return { statusCode: 200, body: JSON.stringify(records) };
};
```

**Pros:**

- Simple REST API integration
- Great for serverless functions
- Dynamic data fetching
- Real-time form submissions

**Cons:**

- Not ideal for build-time content
- Rate limits for build-time queries

---

#### Contentful ⭐⭐⭐⭐

**Integration:**

```javascript
const contentful = require("contentful");
const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});
```

**Pros:**

- Official SDK
- Good Eleventy plugins available
- CDN-backed content delivery

**Cons:**

- More configuration required
- Verbose API responses

---

### 7. Fit for THIS Project

#### Our Project Requirements:

1. **Blog posts** about AI, design, technology
2. **Design system showcase** (Nordic Minimalism, Neo Brutalism,
   Deconstructivism)
3. **Portfolio projects** (case studies, work samples)
4. **Style guide submissions** (user-generated content, form data)
5. **Tracking system** (confirmation numbers, status updates)
6. **Review dashboard** for submissions

---

#### Sanity ⭐⭐⭐⭐⭐

**Perfect for:**

- ✅ Blog posts with rich content (Portable Text)
- ✅ Design system documentation
- ✅ Portfolio case studies
- ✅ Media-rich content (images, videos)
- ✅ Structured data with relationships
- ✅ Content versioning and history

**Why it wins:**

- Flexible schema for design systems (colors, typography, components)
- Portable Text ideal for technical blog posts with code blocks
- Real-time Studio for content team
- Free tier sufficient for our needs
- Excellent developer experience
- Perfect for Eleventy static site generation

---

#### Airtable ⭐⭐⭐⭐

**Perfect for:**

- ✅ Form submissions (name, email, demo URL)
- ✅ CRM-style data (leads, contacts)
- ✅ Tracking and status workflows
- ✅ Simple tabular data
- ✅ Review/approval process

**Why we still use it:**

- Ideal complement to Sanity for submissions
- Non-technical reviewers can manage data
- Spreadsheet interface for moderation
- Quick setup for form backend
- Good for dynamic, user-generated data

**Why it doesn't win:**

- Not suitable for blog content
- Limited content modeling
- No rich text capabilities
- Not designed for static site generation

---

#### Contentful ⭐⭐⭐

**Could work but:**

- ❌ Overkill for our project size
- ❌ Free tier too limited (1 user)
- ❌ Expensive scaling ($489/month minimum)
- ❌ Complex setup for simple needs
- ❌ Vendor lock-in concerns
- ⚠️ Better for large enterprise teams

**When to use Contentful:**

- Large content teams (10+ editors)
- Multi-brand or multi-site content
- Complex approval workflows needed
- Enterprise budget available

---

## Final Selection & Justification

### 🏆 **Winner: Sanity CMS**

We selected **Sanity** as our primary headless CMS with **Airtable** as a
complementary data backend.

---

### Why Sanity Wins

#### 1. **Content Modeling Excellence**

Sanity's schema-as-code approach is perfect for our design-focused content:

```javascript
// Design system schema
{
  name: 'designSystem',
  type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'description', type: 'array', of: [{type: 'block'}] },
    {
      name: 'colorPalette',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', type: 'string' },
          { name: 'hex', type: 'color' },
          { name: 'usage', type: 'text' }
        ]
      }]
    },
    { name: 'typography', type: 'object' },
    { name: 'components', type: 'array' }
  ]
}
```

This flexibility is impossible with spreadsheet-based tools like Airtable.

---

#### 2. **Developer Experience**

- **TypeScript support** for type-safe content
- **Local development** with Sanity Studio
- **Version control** for schemas (git-friendly)
- **GROQ queries** more powerful than REST APIs
- **Hot reloading** during development

**Comparison:**

```javascript
// Sanity GROQ - Fetch blog posts with author and categories
*[_type == "post"] {
  title,
  slug,
  author->{name, bio, image},
  categories[]->title
}

// Airtable - Would require multiple API calls
// 1. Fetch posts
// 2. Fetch authors separately
// 3. Fetch categories separately
// 4. Manually join in code
```

---

#### 3. **Perfect for Static Sites**

Sanity is designed for Jamstack/static site generation:

- **Build-time data fetching** (fast, cached)
- **Image pipeline** (automatic optimization)
- **Incremental builds** (only rebuild changed content)
- **CDN-ready** content delivery

Eleventy + Sanity = optimal performance

---

#### 4. **Content Team Friendly**

- **Sanity Studio** provides professional editing experience
- **Real-time collaboration** (see other editors' cursors)
- **Customizable interface** (add custom tools, widgets)
- **Portable Text** (rich text that's structured, not HTML soup)
- **Preview modes** (see changes before publishing)

vs. Airtable's spreadsheet (not designed for articles/blogs)

---

#### 5. **Pricing & Scalability**

**Sanity Free Tier:**

- Unlimited API requests ✅
- 3 users (enough for our team) ✅
- 10GB bandwidth ✅
- All features unlocked ✅

**Contentful Free Tier:**

- Only 1 user ❌
- Limited API calls ❌
- $489/month for team features ❌

For a student/portfolio project, Sanity's free tier is unbeatable.

---

#### 6. **Future-Proof & Portable**

- **Open source core** (not locked to vendor)
- **Schemas in code** (can migrate if needed)
- **Standard APIs** (GROQ, GraphQL, REST)
- **Export data easily** (NDJSON format)

vs. Contentful's proprietary format

---

### Why We Also Use Airtable

**Separation of concerns:**

```
📝 Content (Sanity)          📊 Data (Airtable)
├── Blog posts              ├── Form submissions
├── Design systems          ├── Confirmation numbers
├── Portfolio projects      ├── Review status
└── Static pages            └── Moderation workflow
```

Airtable excels at:

- **Form submissions** (dynamic, user-generated)
- **Review workflows** (spreadsheet interface for non-devs)
- **Status tracking** (pending → approved → published)
- **CRM-style data** (contacts, leads)

This hybrid approach leverages each tool's strengths:

- Sanity = Content management
- Airtable = Data management

---

### Why NOT Contentful

1. **Free tier insufficient** (1 user only)
2. **Expensive scaling** ($489/month minimum)
3. **Overkill complexity** for our project size
4. **Vendor lock-in** (proprietary content format)
5. **Poor value** compared to Sanity's free tier

Contentful is built for enterprise teams with budgets, not student projects.

---

## Implementation Architecture

### Final Tech Stack:

```
┌─────────────────────────────────────────────┐
│           Eleventy Static Site              │
│         (Build Time Generation)             │
└─────────────┬───────────────────────────────┘
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
┌──────────┐    ┌─────────────┐
│  Sanity  │    │  Airtable   │
│   CMS    │    │   Database  │
└──────────┘    └─────────────┘
      │                │
      │                │
      ▼                ▼
  Content          Submissions
  • Blog           • Form data
  • Pages          • Reviews
  • Projects       • Tracking
```

### Data Flow:

**1. Build Time (Sanity):**

```javascript
// src/_data/posts.js
export default async function () {
  return await sanityClient.fetch(`*[_type == "post"]`);
}
```

→ Eleventy fetches content from Sanity  
→ Generates static HTML pages  
→ Deploys to CDN (fast, cached)

**2. Runtime (Airtable):**

```javascript
// netlify/functions/submissions.js
exports.handler = async (event) => {
  const record = await airtable.create({ ... });
  return { statusCode: 200, body: JSON.stringify(record) };
};
```

→ User submits form  
→ Serverless function saves to Airtable  
→ Review dashboard fetches from Airtable

---

## Conclusion

**Sanity wins** because it provides:

1. ✅ Best content modeling for design systems
2. ✅ Superior developer experience
3. ✅ Perfect Eleventy integration
4. ✅ Generous free tier
5. ✅ Real-time collaboration for content teams
6. ✅ Future-proof and portable

**Airtable complements** Sanity by handling:

1. ✅ User-generated form submissions
2. ✅ Dynamic data that changes frequently
3. ✅ Review workflows for non-technical staff
4. ✅ CRM-style tracking and status management

This **hybrid approach** leverages each tool's strengths while avoiding their
weaknesses, resulting in an optimal architecture for our design gallery
portfolio site.

---

## References

- [Sanity.io Documentation](https://www.sanity.io/docs)
- [Airtable API Documentation](https://airtable.com/developers/web/api/introduction)
- [Contentful Documentation](https://www.contentful.com/developers/docs/)
- [Eleventy Documentation](https://www.11ty.dev/docs/)
- [Jamstack Best Practices](https://jamstack.org/best-practices/)

---

**Document Version:** 1.0  
**Last Updated:** December 16, 2025  
**Status:** Final Selection Approved
