const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  SERVICE_ACCOUNT_KEY: path.join(__dirname, 'service-account-key.json'),
  SUBMITTED_URLS_FILE: path.join(__dirname, 'submitted-urls.json'),
  LOGS_DIR: path.join(__dirname, 'logs'),
  SITEMAP_URL: 'https://www.thehear.org/sitemap-feed.xml',
  DAILY_QUOTA: 200,
  BATCH_SIZE: 100,
  ENGLISH_ONLY: true, // Submit English first, Hebrew later
};

// Ensure logs directory exists
if (!fs.existsSync(CONFIG.LOGS_DIR)) {
  fs.mkdirSync(CONFIG.LOGS_DIR, { recursive: true });
}

// Initialize log file for this run
const logFile = path.join(
  CONFIG.LOGS_DIR,
  `indexing-${new Date().toISOString().split('T')[0]}.log`
);

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
}

// Load submitted URLs history
function loadSubmittedUrls() {
  try {
    if (fs.existsSync(CONFIG.SUBMITTED_URLS_FILE)) {
      const data = fs.readFileSync(CONFIG.SUBMITTED_URLS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    log(`Error loading submitted URLs: ${error.message}`, 'WARN');
  }
  return { urls: {}, lastRun: null };
}

// Save submitted URLs history
function saveSubmittedUrls(data) {
  try {
    fs.writeFileSync(
      CONFIG.SUBMITTED_URLS_FILE,
      JSON.stringify(data, null, 2),
      'utf8'
    );
  } catch (error) {
    log(`Error saving submitted URLs: ${error.message}`, 'ERROR');
  }
}

// Parse sitemap XML and extract URLs with priority
async function fetchSitemapUrlsWithPriority() {
  log(`Fetching sitemap from: ${CONFIG.SITEMAP_URL}`);

  try {
    const response = await fetch(CONFIG.SITEMAP_URL);
    const xmlText = await response.text();

    // Parse XML to extract URLs and priorities
    const urlEntries = [];
    const urlBlocks = xmlText.split('<url>').slice(1); // Skip the first element (before first <url>)

    for (const block of urlBlocks) {
      const urlMatch = block.match(/<loc>(.*?)<\/loc>/);
      const priorityMatch = block.match(/<priority>(.*?)<\/priority>/);
      const lastModMatch = block.match(/<lastmod>(.*?)<\/lastmod>/);

      if (urlMatch) {
        const url = urlMatch[1];
        const priority = priorityMatch ? parseFloat(priorityMatch[1]) : 0.5;
        const lastMod = lastModMatch ? new Date(lastModMatch[1]) : new Date();

        urlEntries.push({
          url,
          priority,
          lastModified: lastMod
        });
      }
    }

    log(`Found ${urlEntries.length} URLs in sitemap`);
    return urlEntries;
  } catch (error) {
    log(`Error fetching sitemap: ${error.message}`, 'ERROR');
    throw error;
  }
}

// Submit URL to Google Indexing API
async function submitUrl(indexing, url) {
  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED',
      },
    });

    return { success: true, response: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    };
  }
}

// Main execution
async function main() {
  log('========================================');
  log('Starting Google Indexing API submission (PRIORITY MODE)');
  log('========================================');

  // Check for service account key
  if (!fs.existsSync(CONFIG.SERVICE_ACCOUNT_KEY)) {
    log('ERROR: service-account-key.json not found!', 'ERROR');
    log('Please follow the setup instructions in README.md', 'ERROR');
    process.exit(1);
  }

  // Load submitted URLs history
  const submittedData = loadSubmittedUrls();
  log(`Previously submitted: ${Object.keys(submittedData.urls).length} URLs`);

  // Fetch URLs from sitemap with priority
  const allUrlEntries = await fetchSitemapUrlsWithPriority();

  // Filter to English only if configured
  let filteredEntries = allUrlEntries;
  if (CONFIG.ENGLISH_ONLY) {
    filteredEntries = allUrlEntries.filter(entry => entry.url.includes('/en/'));
    log(`Filtered to English only: ${filteredEntries.length} URLs`);
  }

  // Filter out already submitted URLs
  const unsubmittedEntries = filteredEntries.filter(entry => !submittedData.urls[entry.url]);
  log(`Unsubmitted URLs: ${unsubmittedEntries.length}`);

  if (unsubmittedEntries.length === 0) {
    log('No new URLs to submit.', 'INFO');

    // Check if we should switch to Hebrew
    if (CONFIG.ENGLISH_ONLY) {
      const hebrewEntries = allUrlEntries.filter(entry => entry.url.includes('/heb/'));
      const unsubmittedHebrew = hebrewEntries.filter(entry => !submittedData.urls[entry.url]);

      if (unsubmittedHebrew.length > 0) {
        log(`\n✓ All English URLs submitted!`, 'INFO');
        log(`To submit Hebrew URLs, edit CONFIG.ENGLISH_ONLY = false in this script`, 'INFO');
        log(`Hebrew URLs remaining: ${unsubmittedHebrew.length}`, 'INFO');
      } else {
        log('All URLs from sitemap have been submitted!', 'INFO');
        log('To re-submit URLs, delete submitted-urls.json', 'INFO');
      }
    }
    return;
  }

  // Sort by priority (highest first) then by date (most recent first)
  unsubmittedEntries.sort((a, b) => {
    // First sort by priority (descending)
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    // Then by date (most recent first)
    return b.lastModified - a.lastModified;
  });

  // Determine how many to submit today
  const urlsToSubmit = unsubmittedEntries.slice(0, CONFIG.DAILY_QUOTA);

  log(`Will submit ${urlsToSubmit.length} URLs today (quota: ${CONFIG.DAILY_QUOTA})`);
  log(`Priority range: ${urlsToSubmit[0]?.priority.toFixed(2)} to ${urlsToSubmit[urlsToSubmit.length - 1]?.priority.toFixed(2)}`);

  // Initialize Google API client
  log('Authenticating with Google Cloud...');
  const auth = new google.auth.GoogleAuth({
    keyFile: CONFIG.SERVICE_ACCOUNT_KEY,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const authClient = await auth.getClient();
  const indexing = google.indexing({ version: 'v3', auth: authClient });

  log('Authentication successful!');

  // Submit URLs in batches
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < urlsToSubmit.length; i += CONFIG.BATCH_SIZE) {
    const batch = urlsToSubmit.slice(i, i + CONFIG.BATCH_SIZE);
    log(`\nProcessing batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1} (${batch.length} URLs)...`);

    for (const entry of batch) {
      const result = await submitUrl(indexing, entry.url);

      if (result.success) {
        successCount++;
        submittedData.urls[entry.url] = {
          submittedAt: new Date().toISOString(),
          status: 'success',
          priority: entry.priority
        };
        log(`✓ ${successCount}/${urlsToSubmit.length} [P:${entry.priority.toFixed(2)}] - ${entry.url}`, 'SUCCESS');
      } else {
        errorCount++;
        submittedData.urls[entry.url] = {
          submittedAt: new Date().toISOString(),
          status: 'error',
          error: result.error,
        };
        log(`✗ ${entry.url} - ${result.error}`, 'ERROR');
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Longer delay between batches
    if (i + CONFIG.BATCH_SIZE < urlsToSubmit.length) {
      log('Waiting 5 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Save updated submission history
  submittedData.lastRun = new Date().toISOString();
  saveSubmittedUrls(submittedData);

  // Summary
  log('\n========================================');
  log('SUBMISSION SUMMARY');
  log('========================================');
  log(`Total submitted: ${urlsToSubmit.length}`);
  log(`Successful: ${successCount}`);
  log(`Errors: ${errorCount}`);
  log(`Remaining unsubmitted: ${unsubmittedEntries.length - urlsToSubmit.length}`);
  log(`Total tracked URLs: ${Object.keys(submittedData.urls).length}`);
  log('========================================');

  if (unsubmittedEntries.length - urlsToSubmit.length > 0) {
    const daysRemaining = Math.ceil((unsubmittedEntries.length - urlsToSubmit.length) / CONFIG.DAILY_QUOTA);
    log(`\nRun this script again to submit the next batch.`);
    log(`Estimated days to complete (English): ${daysRemaining}`);
  } else if (CONFIG.ENGLISH_ONLY) {
    const hebrewEntries = allUrlEntries.filter(entry => entry.url.includes('/heb/'));
    const unsubmittedHebrew = hebrewEntries.filter(entry => !submittedData.urls[entry.url]);

    if (unsubmittedHebrew.length > 0) {
      log(`\n✓ All English URLs submitted!`);
      log(`To submit Hebrew URLs (${unsubmittedHebrew.length} remaining):`);
      log(`Edit this script: CONFIG.ENGLISH_ONLY = false`);
    } else {
      log('\n✓ All URLs from sitemap have been submitted!');
    }
  }
}

// Run the script
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'ERROR');
  log(error.stack, 'ERROR');
  process.exit(1);
});
