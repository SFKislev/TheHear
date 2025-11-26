# Google Indexing API - Setup

Automated submission of feed pages to Google for crawling and indexing.

## 📁 Directory Structure

```
indexing/
├── submit-urls-priority.js      # Main script - Submit 200 URLs daily
├── inspect-url.js               # Check URL status in Search Console
├── reset-progress.js            # Reset submission tracking (if needed)
├── service-account-key.json     # Google Cloud credentials (NOT in git)
├── submitted-urls.json          # Tracks submitted URLs
├── logs/                        # Daily submission logs
│   └── indexing-YYYY-MM-DD.log
└── documentation/               # Detailed guides
    ├── QUICK-START.md           # Setup instructions
    ├── RESPONSE-FORMATS.md      # API response formats
    ├── SEARCH-CONSOLE-SETUP.md  # Search Console API setup
    └── indexing-api-documentation.md
```

---

## 🚀 Daily Usage

### Submit Next Batch of URLs (200/day)

```bash
node indexing/submit-urls-priority.js
```

**What it does:**
- Fetches URLs from `sitemap-feed.xml`
- Filters to English only (Hebrew comes later)
- Sorts by priority (most recent first)
- Submits next 200 unsubmitted URLs
- Tracks progress in `submitted-urls.json`
- Logs to `logs/indexing-YYYY-MM-DD.log`

**Run this once per day until all URLs submitted.**

---

### Check URL Status in Search Console

```bash
node indexing/inspect-url.js <URL>
```

**Example:**
```bash
node indexing/inspect-url.js https://www.thehear.org/en/israel/15-11-2025/feed
```

**Shows:**
- Index status (indexed, crawled, unknown, etc.)
- Last crawl time
- Google's canonical choice
- Robots.txt status
- Mobile usability

**Use this to spot-check progress weekly.**

---

## 📊 Progress Tracking

### Current Status

View your progress:
```bash
# Total submitted
cat indexing/submitted-urls.json | grep '"status": "success"' | wc -l

# View today's log
cat indexing/logs/indexing-$(date +%Y-%m-%d).log
```

### Expected Timeline

- **Total URLs**: ~6,839 (English only)
- **Daily quota**: 200 URLs/day
- **Days to complete**: ~34 days
- **Completion date**: ~December 20, 2025

After English is done, edit `submit-urls-priority.js`:
```javascript
ENGLISH_ONLY: false  // Switch to Hebrew
```

---

## 🔧 Utilities

### Reset Progress (Re-submit All URLs)

```bash
node indexing/reset-progress.js
```

Creates backup and clears `submitted-urls.json`.

---

## 📖 Documentation

Detailed guides in `documentation/`:

- **QUICK-START.md** - Initial setup (one-time)
- **SEARCH-CONSOLE-SETUP.md** - Search Console API usage
- **RESPONSE-FORMATS.md** - API response reference

---

## ⚙️ Configuration

All settings in `submit-urls-priority.js`:

```javascript
const CONFIG = {
  SITEMAP_URL: 'https://www.thehear.org/sitemap-feed.xml',
  DAILY_QUOTA: 200,           // Google's limit
  BATCH_SIZE: 100,            // Requests per batch
  ENGLISH_ONLY: true,         // Switch to false for Hebrew
};
```

---

## 🔐 Security

**Never commit credentials:**
- `service-account-key.json` is in `.gitignore`
- Logs directory is excluded from git
- Only `submitted-urls.json` is tracked

---

## 📈 Monitoring Results

### Check Google Search Console

1. Go to https://search.google.com/search-console
2. Pages report → Watch for increase in indexed pages
3. Look for submitted URLs moving from "Unknown" → "Indexed"

### Expected Progression

**Week 1:** URLs submitted via API
**Week 2:** "Discovered - currently not indexed"
**Week 3-4:** "Crawled - currently not indexed" OR "Indexed" ✅

---

## ❓ Troubleshooting

### Quota Exceeded Error
- Wait 24 hours (quota resets daily)
- Script automatically resumes next day

### Permission Denied
- Check service account is added to Search Console as Owner
- Verify API is enabled in Google Cloud Console

### All URLs Submitted
- Edit `ENGLISH_ONLY: false` to start Hebrew
- Or wait for indexing results

---

## 📞 Quick Reference

**Submit daily:**
```bash
node indexing/submit-urls-priority.js
```

**Check status:**
```bash
node indexing/inspect-url.js https://www.thehear.org/en/israel/15-11-2025/feed
```

**View progress:**
```bash
cat indexing/submitted-urls.json | grep -c '"status": "success"'
```

That's it! Run the submission script daily and monitor via Search Console.
