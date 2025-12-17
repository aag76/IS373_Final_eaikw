# Discord Integration - Quick Setup

## ✅ What's Integrated

Your Design Gallery site now automatically sends Discord notifications for:

1. **New Style Guide Submissions** → Posts to `#submissions` channel
   - Design style name, submitter info, demo URL, confirmation number
2. **New Event Registrations** → Posts to `#events` channel
   - Event name, registrant info, registration number
3. **New Members** → Posts to `#introductions` channel
   - Member name, role, interests, website, member ID

Each notification is beautifully formatted with rich embeds and color-coded by
type!

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Three Discord Channels

First, create these channels in your Discord server:

- `#submissions` - For style guide submissions
- `#events` - For event registrations
- `#introductions` - For new members

### Step 2: Create Webhooks for Each Channel

For each channel, follow these steps:

### Step 3: Add to Environment Variables

**Local Development (.env file):**

```bash
# For #submissions channel
DISCORD_WEBHOOK_SUBMISSIONS=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN

# For #events channel
DISCORD_WEBHOOK_EVENTS=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN

# For #introductions channel
DISCORD_WEBHOOK_INTRODUCTIONS=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN
```

**Netlify Production:**

Add all three environment variables:

1. Go to Netlify Dashboard → Your Site
2. **Site Settings** → **Environment Variables**
3. Click **"Add a variable"** and add each:
   - Key: `DISCORD_WEBHOOK_SUBMISSIONS` → Value: Submissions webhook URL
   - Key: `DISCORD_WEBHOOK_EVENTS` → Value: Events webhook URL
   - Key: `DISCORD_WEBHOOK_INTRODUCTIONS` → Value: Introductions webhook URL
4. Click **"Save"**
   DISCORD_WEBHOOK_SUBMISSIONS=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN

```
### Step 4: Deploy & Test

1. Deploy your site to Netlify (or it will auto-deploy)
2. Test each integration:
   - Submit a style guide → Check `#submissions` ✅
   - Register for an event → Check `#events` ✅
   - Join as a member → Check `#introductions` ✅
3. See the notifications appear in Discord! 🎉
3. Click **"Add a variable"**
4. Key: `DISCORD_WEBHOOK_SUBMISSIONS`
5. Value: Your webhook URL
6. Click **"Save"**

### Step 3: Deploy & Test

1. Deploy your site to Netlify (or it will auto-deploy)
2. Submit a test style guide via your form
3. Check your Discord channel for the notification! 🎉
## 📝 Example Discord Messages

### #submissions Channel (Blue 🔵)
```

📬 New submission received!

🎨 New Style Guide Submission!

📝 Design Style: Nordic Minimalism 👤 Submitter: John Doe 📧 Email:
john@example.com 🔗 Demo URL: https://example.com/demo 🎫 Confirmation Number:
DSG-A1B2C3D4 📅 Submitted: 12/16/2025, 3:45:00 PM

```

### #events Channel (Gold 🟡)
```

🎉 New event registration!

📅 New Event Registration!

🎯 Event Name: Design Systems Workshop 👤 Registrant: Jane Smith

## 🎨 Customization

### Current Color Scheme

- **Submissions** (`#submissions`): Blue (3447003)
- **Events** (`#events`): Gold/Yellow (15844367)
- **Introductions** (`#introductions`): Purple (5763719)

To change colors, edit the respective function files:

- `/netlify/functions/submissions.js`
- `/netlify/functions/register-event.js`
- `/netlify/functions/new-member.js`

```javascript
color: 3447003, // Change this number
// Other colors: Red: 15158332, Green: 3066993, Orange: 16098851
```

### Add More Fields

Add to the `fields` array in any function:

```javascript
{
  name: "🛠️ Custom Field",
  value: data.customField || "Not specified",
  inline: false,
}
```

## 📋 API Endpoints

Your site now has three automated Discord integrations:

1. **POST** `/.netlify/functions/submissions` → `#submissions`
2. **POST** `/.netlify/functions/register-event` → `#events`
3. **POST** `/.netlify/functions/new-member` → `#introductions`

## 🗄️ Airtable Tables

You'll need to create these tables in your Airtable base:

### 1. Submissions Table (already exists ✅)

- ConfirmationNumber, Status, Name, Email, DesignStyle, DemoURL, etc.

### 2. EventRegistrations Table (new)

- RegistrationNumber, Status, Name, Email, Phone, EventName, EventDate,
  RegisteredDate

### 3. Members Table (new)

- MemberId, Status, Name, Email, Role, Interests, Website, Bio, JoinedDate

## 🔗 Integration Flow

---

## 🎨 Customization

### Change Notification Color

Edit `/netlify/functions/submissions.js`:

```javascript
color: 3447003, // Blue (change this)
// Colors: Red: 15158332, Green: 3066993, Yellow: 16776960
```

### Add More Fields

Add to the `fields` array:

```javascript
{
  name: "🛠️ Tools Used",
  value: submission.toolsUsed || "Not specified",
  inline: false,
}
```

### Multiple Channels

Add more webhooks in `.env`:

```bash
DISCORD_WEBHOOK_SUBMISSIONS=webhook_url_1
DISCORD_WEBHOOK_ACTIVITY=webhook_url_2
DISCORD_WEBHOOK_APPROVALS=webhook_url_3
```

---

## 🔒 Security

- ✅ Webhook URL is kept in environment variables (not in code)
- ✅ `.env` file is in `.gitignore` (never committed)
- ✅ Netlify environment variables are encrypted
- ⚠️ If webhook URL leaks, regenerate it in Discord

---

## 🐛 Troubleshooting

### No notifications appearing?

1. **Check webhook URL is set:**

   ```bash
   echo $DISCORD_WEBHOOK_SUBMISSIONS
   ```

2. **Verify webhook is valid:**
   - Go to Discord → Channel Settings → Integrations
   - Ensure webhook exists and is active

3. **Check Netlify logs:**
   - Netlify Dashboard → Functions → submissions
   - Look for "Discord notification sent" or error messages

4. **Test webhook manually:**
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}'
   ```

### Notifications working locally but not on Netlify?

- Verify environment variable is set in Netlify dashboard
- Redeploy after adding environment variable
- Check Netlify function logs for errors

---

## 📊 Discord Server Structure (Recommended)

Create these channels:

- **#submissions** - New style guide submissions
- **#activity** - General site activity
- **#announcements** - Important updates
- **#general** - Community discussion
- **#showcase** - Share approved designs

---

## ✅ Requirements Met

- ✅ Discord server integrated
- ✅ Automated submission notifications
- ✅ Real-time updates to team
- ✅ Community engagement enabled

---

## 🔗 Share Your Server

Get your Discord invite link:

1. Server Settings → Invites
2. Create Invite → Set to "Never expire"
3. Copy link
4. Add to your site footer or About page

Example: `https://discord.gg/YOUR_INVITE_CODE`
