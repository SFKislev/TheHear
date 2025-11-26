# Quick Start Guide - Google Indexing API

## Step-by-Step Setup (15 minutes)

### Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create/Select Project**:
   - Click the project dropdown (top left)
   - Click "New Project"
   - Name: "the-hear-indexing" (or similar)
   - Click "Create"

3. **Enable Indexing API**:
   - In the search bar, type "Indexing API"
   - Click on "Web Search Indexing API" or "Indexing API"
   - Click "Enable" button
   - Wait for it to enable (~30 seconds)

### Step 2: Create Service Account

1. **Navigate to Credentials**:
   - In left menu: "APIs & Services" → "Credentials"

2. **Create Service Account**:
   - Click "+ CREATE CREDENTIALS" (top)
   - Select "Service Account"

3. **Fill in details**:
   - Service account name: `indexing-api`
   - Service account ID: (auto-filled)
   - Click "CREATE AND CONTINUE"

4. **Skip Role Assignment**:
   - Click "CONTINUE" (don't assign any roles)

5. **Skip User Access**:
   - Click "DONE"

### Step 3: Download Service Account Key

1. **Find your service account**:
   - You'll see it in the Service Accounts list
   - Click on the service account email (looks like `indexing-api@project-id.iam.gserviceaccount.com`)

2. **Create JSON key**:
   - Click the "KEYS" tab
   - Click "ADD KEY" → "Create new key"
   - Select "JSON" format
   - Click "CREATE"
   - **A JSON file will download automatically**

3. **Move the file**:
   - Rename the downloaded file to: `service-account-key.json`
   - Move it to: `E:\Code\Headline_Scraper\Nextjs-frontend-version\headline_next\indexing\`

4. **Copy the service account email** (you'll need it next):
   - Example: `indexing-api@the-hear-indexing.iam.gserviceaccount.com`

### Step 4: Add Service Account to Search Console

1. **Go to Google Search Console**: https://search.google.com/search-console

2. **Select your property**:
   - Choose "www.thehear.org" from the property dropdown (top left)

3. **Add user**:
   - Go to "Settings" (⚙️ in left sidebar)
   - Click "Users and permissions"
   - Click "ADD USER" button

4. **Add service account**:
   - Paste the service account email (from Step 3)
   - Permission: Select "**Owner**" (this is required for Indexing API)
   - Click "ADD"

### Step 5: Run the Script

1. **Open terminal** in the project directory:
   ```bash
   cd E:\Code\Headline_Scraper\Nextjs-frontend-version\headline_next
   ```

2. **Run the priority-based indexing script** (recommended):
   ```bash
   node indexing/submit-urls-priority.js
   ```

   This script:
   - Submits English URLs first (Hebrew later)
   - Prioritizes most recent pages (highest sitemap priority)
   - Sorts by recency within same priority

   **OR** use the basic script (alphabetical order):
   ```bash
   node indexing/submit-urls.js
   ```

3. **Expected output**:
   ```
   ========================================
   Starting Google Indexing API submission
   ========================================
   Fetching sitemap from: https://www.thehear.org/sitemap-feed.xml
   Found 14382 URLs in sitemap
   Previously submitted: 0 URLs
   Unsubmitted URLs: 14382
   Will submit 200 URLs today (quota: 200)
   Authenticating with Google Cloud...
   Authentication successful!

   Processing batch 1 (100 URLs)...
   ✓ 1/200 - https://www.thehear.org/en/us/15-08-2025/feed
   ✓ 2/200 - https://www.thehear.org/en/us/16-08-2025/feed
   ...
   ```

4. **Check results**:
   - Success/error counts at the end
   - Logs saved to: `indexing/logs/indexing-YYYY-MM-DD.log`
   - Progress saved to: `indexing/submitted-urls.json`

## Daily Usage

### Automatic Daily Submissions

**Option 1: Manual Daily Run**
```bash
node indexing/submit-urls.js
```

**Option 2: Windows Task Scheduler** (Automated)
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at a specific time
4. Action: Start a program
   - Program: `node`
   - Arguments: `E:\Code\Headline_Scraper\Nextjs-frontend-version\headline_next\indexing\submit-urls.js`
   - Start in: `E:\Code\Headline_Scraper\Nextjs-frontend-version\headline_next`

**Option 3: Vercel Cron Job** (Recommended for production)
- Create API route: `/api/submit-indexing`
- Add cron job to `vercel.json`
- Runs automatically daily

## Checking Submission Status

Check if a specific URL was submitted:
```bash
node indexing/check-status.js https://www.thehear.org/en/us/15-08-2025/feed
```

## Troubleshooting

### Error: "service-account-key.json not found"
- Make sure you downloaded the JSON key file
- Rename it to exactly `service-account-key.json`
- Place it in the `indexing/` directory

### Error: "Permission denied" or "403 Forbidden"
- Make sure you added the service account to Search Console as "Owner"
- Wait 5-10 minutes after adding for permissions to propagate
- Verify the service account email matches exactly

### Error: "Quota exceeded"
- Google allows 200 URLs/day
- Wait 24 hours and run again
- Script automatically tracks quota

### Error: "API not enabled"
- Go to Google Cloud Console
- Search for "Indexing API"
- Click "Enable"

## Files Created

```
indexing/
├── README.md                    - Detailed documentation
├── QUICK-START.md              - This file
├── submit-urls.js              - Main submission script
├── check-status.js             - Check URL status
├── service-account-key.json    - Your credentials (DO NOT COMMIT)
├── submitted-urls.json         - Tracks submitted URLs
├── logs/                       - Daily log files
│   └── indexing-2025-11-16.log
└── .gitignore                  - Prevents committing secrets
```

## Expected Timeline

- **Day 1**: Submit first 200 URLs
- **Day 2-71**: Continue daily submissions (14,382 URLs ÷ 200/day = ~72 days)
- **Week 1-2**: Google starts crawling submitted URLs
- **Week 2-4**: URLs begin appearing in Search Console
- **Week 4-8**: Significant increase in indexed pages

## Monitoring Results

1. **Google Search Console**:
   - Go to "Coverage" report
   - Watch for increase in indexed pages
   - Monitor "Discovered - currently not indexed" → should move to "Indexed"

2. **Check logs daily**:
   - `indexing/logs/indexing-YYYY-MM-DD.log`
   - Look for success/error patterns

3. **Track progress**:
   - Open `submitted-urls.json`
   - See count of submitted URLs
   - See last run timestamp

## Security Notes

⚠️ **IMPORTANT**:
- `service-account-key.json` contains sensitive credentials
- It's already in `.gitignore` - NEVER commit it to Git
- Keep it secure and private
- If compromised, delete it from Google Cloud Console and create a new one

## Need Help?

If you encounter issues:
1. Check the log files in `indexing/logs/`
2. Verify all setup steps were completed
3. Make sure service account has "Owner" permission in Search Console
4. Check Google Cloud Console for API quota limits
