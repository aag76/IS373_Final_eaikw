# Airtable Tables Setup Guide

## Overview

Your Design Gallery needs **3 tables** in Airtable to support all Discord
integrations:

1. ✅ **Submissions** (already exists)
2. 🆕 **EventRegistrations** (new)
3. 🆕 **Members** (new)

---

## Table 1: Submissions ✅

**Status:** Already created and configured

**Fields:**

- ConfirmationNumber (Single line text, Primary field)
- Status (Single select: pending, approved, rejected)
- Name (Single line text)
- Email (Email)
- DesignStyle (Single line text)
- DemoURL (URL)
- Authenticity (Long text)
- ToolsUsed (Long text)
- AdditionalNotes (Long text)
- SubmittedDate (Date & time)
- ReviewDate (Date & time)
- ReviewNotes (Long text)

**Discord Integration:** `#submissions` channel (Blue)

---

## Table 2: EventRegistrations 🆕

**Create this table in your Airtable base**

### Setup Instructions:

1. Open your Airtable base: `appAb5V2B9stvwMXv`
2. Click **"Add or import"** → **"Create blank table"**
3. Name it: `EventRegistrations`
4. Add these fields:

| Field Name         | Field Type       | Options/Notes                                   |
| ------------------ | ---------------- | ----------------------------------------------- |
| RegistrationNumber | Single line text | Primary field, auto-generated (EVT-XXXXXXXX)    |
| Status             | Single select    | Options: confirmed, cancelled, attended         |
| Name               | Single line text | Required                                        |
| Email              | Email            | Required                                        |
| Phone              | Phone number     | Optional                                        |
| EventName          | Single line text | Required                                        |
| EventDate          | Date             | Preferred event date                            |
| AdditionalNotes    | Long text        | Dietary restrictions, accessibility needs, etc. |
| RegisteredDate     | Date & time      | Auto-set when created                           |

### Field Configuration Details:

**RegistrationNumber** (Primary Field)

- Type: Single line text
- Description: Unique identifier (EVT-XXXXXXXX format)

**Status**

- Type: Single select
- Options:
  - ✅ confirmed (default)
  - ❌ cancelled
  - 🎯 attended

**RegisteredDate**

- Type: Date & time
- Include time: Yes
- Default: Now

**Discord Integration:** `#events` channel (Gold/Yellow)

---

## Table 3: Members 🆕

**Create this table in your Airtable base**

### Setup Instructions:

1. In the same Airtable base: `appAb5V2B9stvwMXv`
2. Click **"Add or import"** → **"Create blank table"**
3. Name it: `Members`
4. Add these fields:

| Field Name | Field Type       | Options/Notes                                |
| ---------- | ---------------- | -------------------------------------------- |
| MemberId   | Single line text | Primary field, auto-generated (MBR-XXXXXXXX) |
| Status     | Single select    | Options: active, inactive                    |
| Name       | Single line text | Required                                     |
| Email      | Email            | Required                                     |
| Role       | Single line text | Job title/role                               |
| Interests  | Long text        | Design interests                             |
| Website    | URL              | Portfolio/personal site                      |
| Bio        | Long text        | Member bio/description                       |
| JoinedDate | Date & time      | Auto-set when created                        |

### Field Configuration Details:

**MemberId** (Primary Field)

- Type: Single line text
- Description: Unique identifier (MBR-XXXXXXXX format)

**Status**

- Type: Single select
- Options:
  - ✅ active (default)
  - ⏸️ inactive

**JoinedDate**

- Type: Date & time
- Include time: Yes
- Default: Now

**Discord Integration:** `#introductions` channel (Purple)

---

## Quick Setup Checklist

- [x] Table 1: Submissions (already exists)
- [ ] Table 2: EventRegistrations (create now)
- [ ] Table 3: Members (create now)
- [ ] Test event registration form
- [ ] Test member signup form
- [ ] Verify Discord notifications in all 3 channels

---

## API Endpoints

Once tables are created, these endpoints will work:

### 1. Submissions

- **POST** `/.netlify/functions/submissions`
- **GET** `/.netlify/functions/submissions`
- Discord: `#submissions` (Blue)

### 2. Event Registrations

- **POST** `/.netlify/functions/register-event`
- **GET** `/.netlify/functions/register-event`
- Discord: `#events` (Gold)

### 3. New Members

- **POST** `/.netlify/functions/new-member`
- **GET** `/.netlify/functions/new-member`
- Discord: `#introductions` (Purple)

---

## Testing

After creating the tables, test each integration:

1. **Event Registration:**
   - Visit: `/register-event.html`
   - Fill out form and submit
   - Check Discord `#events` channel
   - Verify record in Airtable EventRegistrations table

2. **New Member:**
   - Visit: `/join-community.html`
   - Fill out form and submit
   - Check Discord `#introductions` channel
   - Verify record in Airtable Members table

3. **Submission (already working):**
   - Visit: `/submit-style-guide` (or your existing form)
   - Submit a style guide
   - Check Discord `#submissions` channel
   - Verify record in Airtable Submissions table

---

## Troubleshooting

**Error: "Table not found"**

- Make sure table names match exactly: `EventRegistrations` and `Members`
- Check Airtable base ID in `.env` file

**No Discord notifications:**

- Verify webhook URLs in `.env` and Netlify environment variables
- Check webhook permissions in Discord
- Look for errors in Netlify function logs

**Form submission fails:**

- Open browser console (F12) and check for errors
- Verify all required fields are filled
- Check Netlify function logs for server-side errors

---

## Environment Variables Required

Make sure these are set in both `.env` (local) and Netlify (production):

```bash
AIRTABLE_BASE_ID=appAb5V2B9stvwMXv
AIRTABLE_API_TOKEN=your_token_here
DISCORD_WEBHOOK_SUBMISSIONS=webhook_url_here
DISCORD_WEBHOOK_EVENTS=webhook_url_here
DISCORD_WEBHOOK_INTRODUCTIONS=webhook_url_here
```

---

## Next Steps

1. ✅ Create EventRegistrations table
2. ✅ Create Members table
3. ✅ Create Discord webhooks for #events and #introductions
4. ✅ Update environment variables
5. ✅ Deploy to Netlify
6. ✅ Test all three integrations

Need help? Check the main `DISCORD_INTEGRATION.md` for more details!
