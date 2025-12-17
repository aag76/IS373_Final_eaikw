# Airtable Integration Setup

Your site is now configured to use **Airtable** as the backend for style guide
submissions instead of in-memory storage!

## 🚀 Setup Instructions

### 1. Install Airtable Package

Run this command to install the Airtable Node.js library:

```bash
npm install airtable
```

### 2. Set Up Your Airtable Base

1. Go to [Airtable](https://airtable.com) and open your **"Design Gallery CMS"**
   base
2. Create a table named **"Submissions"** (or rename an existing one)
3. Add these fields to your table:

| Field Name           | Field Type       | Notes                                |
| -------------------- | ---------------- | ------------------------------------ |
| `ConfirmationNumber` | Single line text | Primary identifier (DSG-XXXXXXXX)    |
| `Status`             | Single select    | Options: pending, approved, rejected |
| `Name`               | Single line text | Submitter's name                     |
| `Email`              | Email            | Submitter's email                    |
| `DesignStyle`        | Single line text | Name of the design style             |
| `DemoURL`            | URL              | Link to demo/portfolio               |
| `Authenticity`       | Long text        | Authenticity statement               |
| `ToolsUsed`          | Long text        | Tools used to create the style       |
| `AdditionalNotes`    | Long text        | Additional notes                     |
| `SubmittedDate`      | Date & Time      | Submission timestamp                 |
| `ReviewDate`         | Date & Time      | When reviewed (optional)             |
| `ReviewNotes`        | Long text        | Reviewer feedback (optional)         |

### 3. Get Your Airtable Credentials

**API Token:**

1. Go to https://airtable.com/account
2. Click "Generate API key" or copy your existing token
3. Save this token securely

**Base ID:**

1. Open your Airtable base in a browser
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. The Base ID is the part starting with `app` (e.g., `appXXXXXXXXXXXXXX`)

### 4. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Airtable Configuration
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_API_TOKEN=your_airtable_api_token_here
```

### 5. Deploy to Netlify

1. Push your code to GitHub
2. In Netlify Dashboard → Site Settings → Environment Variables
3. Add these variables:
   - `AIRTABLE_BASE_ID` = your base ID
   - `AIRTABLE_API_TOKEN` = your API token

### 6. Test Your Integration

1. **Submit a form** at `/blog/submit-style-guide/`
2. Check your **Airtable base** - you should see a new record!
3. **Track submission** at `/track-submission/` using the confirmation number
4. **View all submissions** at `/review/` (loads live from Airtable)

## 📋 What's Been Integrated

✅ **Submission Form** → Creates records in Airtable ✅ **Track Submissions** →
Queries Airtable by confirmation number ✅ **Review Dashboard** → Fetches all
submissions from Airtable ✅ **Auto-generated confirmation numbers**
(DSG-XXXXXXXX format)

## 🔧 How It Works

1. User submits form → POST to `/.netlify/functions/submissions`
2. Netlify Function creates record in Airtable
3. Returns confirmation number to user
4. Review page fetches all records with GET request
5. Track page searches by confirmation number

## 📊 Airtable Views (Optional)

Create these views in Airtable for better organization:

- **Pending Review** - Filter: `Status = "pending"`
- **Approved** - Filter: `Status = "approved"`
- **Rejected** - Filter: `Status = "rejected"`
- **Recent First** - Sort: `SubmittedDate` descending

## 🔒 Security Notes

- Never commit your `.env` file (it's in `.gitignore`)
- Keep your Airtable API token private
- Add authentication to review page in production
- Consider rate limiting on the API endpoints

## 🎯 Next Steps

1. Install airtable package: `npm install airtable`
2. Set up your Airtable base with the fields above
3. Add environment variables
4. Test locally with `npm run dev`
5. Deploy to Netlify with environment variables configured

---

Your submissions will now persist in Airtable and be accessible across deploys!
🎉
