# Google Analytics 4 Setup Guide

## ✅ Implementation Status

**COMPLETED:**
- ✅ GA4 script integration in `base.njk` with GDPR consent mode
- ✅ Cookie consent manager updated to grant analytics consent
- ✅ Site configuration prepared in `site.json`
- ✅ Privacy-first default (consent denied until user accepts)
- ✅ GDPR-compliant implementation

**PENDING:**
- ⏳ Create GA4 property and get Measurement ID
- ⏳ Replace placeholder `G-XXXXXXXXXX` with actual Measurement ID
- ⏳ Test consent flow
- ⏳ Verify analytics tracking in GA4 dashboard

---

## Step 1: Create Google Analytics 4 Property

### 1.1 Go to Google Analytics
Visit: https://analytics.google.com/

### 1.2 Create New Property
1. Click **Admin** (gear icon, bottom left)
2. Click **+ Create Property**
3. Enter property details:
   - **Property name**: "IS373 Portfolio" (or your preferred name)
   - **Reporting time zone**: Your timezone
   - **Currency**: Your currency
4. Click **Next**

### 1.3 Configure Business Information
1. **Industry category**: Select appropriate category (e.g., "Technology")
2. **Business size**: Select your organization size
3. **Intended use**: Check relevant boxes (e.g., "Examine user behavior")
4. Click **Create**
5. Accept Terms of Service

### 1.4 Set Up Data Stream
1. Choose **Web** platform
2. Enter website details:
   - **Website URL**: `https://www.eaikw.com`
   - **Stream name**: "IS373 Portfolio Website"
3. Click **Create stream**

### 1.5 Copy Measurement ID
1. You'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)
2. **COPY THIS ID** - you'll need it in the next step

Example:
```
Measurement ID: G-ABC123XYZ
```

---

## Step 2: Add Measurement ID to Your Site

### 2.1 Update `src/_data/site.json`

**BEFORE:**
```json
{
  "title": "Design Gallery- IS373",
  "description": "Professional portfolio showcasing modern web development expertise and innovative projects",
  "author": "Design Gallery- IS373",
  "url": "https://www.eaikw.com",
  "ga_measurement_id": "G-XXXXXXXXXX",  ⬅️ PLACEHOLDER
  "dev_mode": false,
  "social": {
    "github": "https://github.com/kaw393939",
    "linkedin": "https://www.linkedin.com/in/keithwilliams5/",
    "twitter": "https://twitter.com/everydayaikw",
    "youtube": "https://www.youtube.com/@EAIKW"
  }
}
```

**AFTER (Replace with your actual Measurement ID):**
```json
{
  "title": "Design Gallery- IS373",
  "description": "Professional portfolio showcasing modern web development expertise and innovative projects",
  "author": "Design Gallery- IS373",
  "url": "https://www.eaikw.com",
  "ga_measurement_id": "G-ABC123XYZ",  ⬅️ YOUR ACTUAL ID HERE
  "dev_mode": false,
  "social": {
    "github": "https://github.com/kaw393939",
    "linkedin": "https://www.linkedin.com/in/keithwilliams5/",
    "twitter": "https://twitter.com/everydayaikw",
    "youtube": "https://www.youtube.com/@EAIKW"
  }
}
```

### 2.2 Toggle Development Mode (Optional)
- Set `"dev_mode": true` to disable analytics during local development
- Set `"dev_mode": false` to enable analytics (production)

---

## Step 3: Build and Test Your Site

### 3.1 Rebuild Site
```bash
npm run build
```

This compiles your Eleventy site with the new GA4 configuration.

### 3.2 Start Development Server
```bash
npm run dev
```

Site will be available at: http://localhost:8080

### 3.3 Test in Browser
1. Open http://localhost:8080 in **incognito/private mode**
2. Open **DevTools** (F12 or Cmd+Option+I)
3. Go to **Console** tab

---

## Step 4: Verify Consent Flow

### 4.1 Initial Page Load (No Consent)
**Expected behavior:**
1. Cookie consent banner appears
2. Console shows: "GA4 gtag function not found" (if script not loaded yet)
3. **No `_ga` cookies** in Application → Cookies
4. Analytics storage: **DENIED** (default)

### 4.2 Check Network Tab
1. Open **DevTools → Network** tab
2. Filter by "google-analytics" or "gtag"
3. You should see:
   - `gtag/js?id=G-YOUR-ID` request
   - But NO subsequent `/collect` requests (because consent denied)

### 4.3 Accept Analytics Cookies
1. Click **"Accept All"** on cookie banner
2. Console should show: `"✓ Analytics consent granted - GA4 tracking enabled"`
3. Check **Application → Cookies** - you should now see:
   - `_ga` cookie
   - `_ga_XXXXXXXXXX` cookie (container cookie)

### 4.4 Verify Tracking Requests
1. Navigate to another page (e.g., /blog/)
2. Check **Network** tab
3. You should see `/collect` requests to Google Analytics
4. These requests send pageview data

---

## Step 5: Monitor in GA4 Dashboard

### 5.1 Open Real-Time Report
1. Go to https://analytics.google.com/
2. Select your property
3. Navigate to **Reports → Realtime**

### 5.2 Generate Test Traffic
With your site still open:
1. Navigate through pages (home → blog → projects)
2. Click buttons and links
3. Scroll down pages

### 5.3 Verify Data in Dashboard
Within 1-2 minutes, you should see:
- **Active users**: 1 (you)
- **Pageviews**: Multiple (as you navigate)
- **Event count**: Various events
- **Top pages**: Your visited pages

---

## Step 6: GDPR Compliance Verification

### ✅ Checklist

- [ ] **Default consent denied**: Analytics storage denied on page load
- [ ] **No cookies before consent**: No `_ga` cookies until user accepts
- [ ] **Consent banner visible**: Banner appears on first visit
- [ ] **Clear opt-out**: "Reject All" button works
- [ ] **Granular control**: Users can select specific cookie types
- [ ] **Persistent choice**: Preference saved in localStorage
- [ ] **Privacy policy link**: Link to privacy policy present
- [ ] **Consent update works**: Accepting analytics enables tracking

### Test Commands

**Check localStorage:**
```javascript
// In browser console
localStorage.getItem('cookieConsent')      // Should be "true" or "false"
localStorage.getItem('cookiePreferences')  // Should show preferences object
```

**Check cookies:**
```javascript
// In browser console
document.cookie.includes('_ga')  // false before consent, true after
```

**Check consent state:**
```javascript
// In browser console
gtag('get', 'YOUR-MEASUREMENT-ID', 'analytics_storage')
// Returns: "denied" or "granted"
```

---

## Step 7: Custom Event Tracking (Optional)

### 7.1 Track Form Submissions

Add to your form handler:
```javascript
// Example: Contact form submission
gtag('event', 'form_submit', {
  form_id: 'contact_form',
  form_name: 'Contact Us'
});
```

### 7.2 Track Button Clicks

Add to button click handlers:
```javascript
// Example: Download button
gtag('event', 'file_download', {
  file_name: 'resume.pdf',
  link_url: '/files/resume.pdf'
});
```

### 7.3 Track Outbound Links

Add to external links:
```javascript
// Example: Social media link
gtag('event', 'click', {
  event_category: 'outbound',
  event_label: 'GitHub Profile',
  transport_type: 'beacon'
});
```

### 7.4 Verify Custom Events
1. Trigger the event (e.g., submit form)
2. Go to GA4 → **Reports → Realtime → Event count by Event name**
3. Your custom event should appear within 1-2 minutes

---

## Step 8: Configure Enhanced Measurement (Recommended)

### 8.1 Enable Enhanced Measurement
1. Go to **Admin → Data Streams**
2. Click your web stream
3. Click **Enhanced measurement** (toggle ON)
4. Configure automatic tracking:
   - ✅ **Page views**: Already tracked
   - ✅ **Scrolls**: Track 90% scroll depth
   - ✅ **Outbound clicks**: Track external links
   - ✅ **Site search**: Track search queries
   - ✅ **Video engagement**: Track YouTube embeds
   - ✅ **File downloads**: Track PDF, ZIP, etc.

### 8.2 These events auto-track:
- `scroll` (90% page depth)
- `click` (outbound links)
- `view_search_results` (if you have search)
- `file_download` (PDF, DOCX, etc.)
- `video_start`, `video_progress`, `video_complete` (YouTube)

---

## Step 9: Set Up Conversion Goals (Optional)

### 9.1 Mark Events as Conversions
1. Go to **Admin → Events**
2. Click **Create event** or toggle existing event
3. Mark important events as conversions:
   - `form_submit` → Conversion
   - `file_download` → Conversion
   - `purchase` → Conversion (if e-commerce)

### 9.2 View Conversion Reports
- **Reports → Engagement → Conversions**
- Shows conversion count, value, and trends

---

## Step 10: Documentation & Screenshots

### 10.1 Take Screenshots
Capture the following for your project documentation:

1. **GA4 Property Setup**
   - Screenshot of property settings
   - Shows Measurement ID

2. **Real-Time Report**
   - Screenshot showing active users
   - Shows pageviews and events

3. **Events Report**
   - Screenshot of event count by event name
   - Shows custom events tracking

4. **Cookie Consent Banner**
   - Screenshot of banner on page load
   - Shows GDPR-compliant design

5. **Browser DevTools**
   - Screenshot of Network tab with GA4 requests
   - Screenshot of Application → Cookies with `_ga` cookies

### 10.2 Update Documentation
Add screenshots to `docs/analytics-evaluation.md`:
```markdown
## Screenshots

### GA4 Property Configuration
![GA4 Property](../images/ga4-property.png)

### Real-Time Tracking
![Real-Time Report](../images/ga4-realtime.png)

### Custom Events
![Events Report](../images/ga4-events.png)

### Cookie Consent Banner
![Consent Banner](../images/cookie-consent-banner.png)

### GDPR Compliance
![DevTools Cookies](../images/ga4-cookies-devtools.png)
```

---

## Troubleshooting

### Issue: "GA4 gtag function not found"
**Cause**: GA4 script not loaded or dev_mode is true

**Solution:**
1. Check `site.json` - ensure `dev_mode: false`
2. Check `site.json` - ensure `ga_measurement_id` is set correctly
3. Rebuild site: `npm run build`
4. Clear cache and reload

### Issue: No cookies appear after accepting
**Cause**: Script not loaded or consent not updating

**Solution:**
1. Open DevTools → Console
2. Check for errors
3. Verify `gtag` function exists: `typeof gtag`
4. Check consent state: `gtag('get', 'YOUR-ID', 'analytics_storage')`

### Issue: No data in GA4 dashboard
**Cause**: Tracking not working or data delay

**Solution:**
1. Wait 24-48 hours for data to populate
2. Use **Realtime** report for immediate verification
3. Check Network tab for `/collect` requests
4. Verify Measurement ID matches property

### Issue: AdBlocker blocking GA4
**Cause**: Browser extension blocking Google Analytics

**Solution:**
1. Test in incognito mode with extensions disabled
2. Check Network tab for blocked requests
3. Add note in documentation about ad blocker impact

---

## Quick Reference

### File Changes Summary

| File | Change | Purpose |
|------|--------|---------|
| `src/_data/site.json` | Added `ga_measurement_id` and `dev_mode` | Store GA4 configuration |
| `src/_includes/layouts/base.njk` | Added GA4 script with consent mode | Load GA4 with privacy-first defaults |
| `src/js/cookie-consent.js` | Updated `loadAnalytics()` method | Grant consent when user accepts |

### Key Configuration

**GA4 Consent Mode (Default):**
```javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',  // Default DENY
  'wait_for_update': 500
});
```

**Consent Update (After User Accepts):**
```javascript
gtag('consent', 'update', {
  'analytics_storage': 'granted'  // Grant analytics
});
```

### NPM Scripts

```bash
npm run dev      # Start dev server (port 8080)
npm run build    # Build production site
npm run serve    # Serve built site
npm run clean    # Clean _site directory
```

---

## Next Steps

1. **Immediate:**
   - [ ] Create GA4 property (Step 1)
   - [ ] Get Measurement ID
   - [ ] Update `site.json` with your Measurement ID
   - [ ] Test consent flow (Steps 3-4)

2. **Within 24 hours:**
   - [ ] Verify data in GA4 dashboard (Step 5)
   - [ ] Take screenshots for documentation (Step 10)
   - [ ] Set up custom events (Step 7)

3. **Optional enhancements:**
   - [ ] Enable enhanced measurement (Step 8)
   - [ ] Set up conversion goals (Step 9)
   - [ ] Configure user properties
   - [ ] Set up audience segments

---

## Resources

- **Google Analytics 4 Documentation**: https://support.google.com/analytics/
- **Consent Mode Documentation**: https://developers.google.com/tag-platform/security/guides/consent
- **GDPR Compliance Guide**: https://privacy.google.com/businesses/compliance/
- **GA4 Setup Assistant**: https://analytics.google.com/analytics/web/#/setup-assistant

---

## Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Review console errors in DevTools
3. Verify Network tab for blocked requests
4. Check GA4 Realtime report (not historical reports)

**Remember**: Historical reports can take 24-48 hours to populate. Use **Realtime** report for immediate verification.

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0  
**Status**: ✅ Code implemented, awaiting Measurement ID
