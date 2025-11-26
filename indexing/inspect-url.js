const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_KEY = path.join(__dirname, 'service-account-key.json');
const SITE_URL = 'sc-domain:thehear.org'; // Domain property from Search Console

async function inspectUrl(urlToInspect) {
  console.log('🔍 Google Search Console - URL Inspection\n');

  if (!urlToInspect) {
    console.log('Usage: node inspect-url.js <URL>');
    console.log('\nExample:');
    console.log('node inspect-url.js https://www.thehear.org/en/israel/15-11-2025/feed');
    process.exit(1);
  }

  // Check for service account key
  if (!fs.existsSync(SERVICE_ACCOUNT_KEY)) {
    console.error('❌ ERROR: service-account-key.json not found!');
    process.exit(1);
  }

  try {
    console.log(`URL to inspect: ${urlToInspect}`);
    console.log(`Property: ${SITE_URL}\n`);

    // Initialize Google API client
    console.log('⏳ Authenticating...');
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const authClient = await auth.getClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    console.log('✓ Authenticated\n');

    // Inspect URL
    console.log('⏳ Inspecting URL...\n');

    const response = await searchconsole.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: urlToInspect,
        siteUrl: SITE_URL,
      },
    });

    console.log('✅ SUCCESS! URL Inspection Result:\n');

    const result = response.data.inspectionResult;

    // Index status
    console.log('═══════════════════════════════════════');
    console.log('📊 INDEX STATUS');
    console.log('═══════════════════════════════════════');

    const indexStatus = result.indexStatusResult;
    if (indexStatus) {
      console.log(`Verdict: ${indexStatus.verdict || 'Unknown'}`);
      console.log(`Coverage State: ${indexStatus.coverageState || 'Unknown'}`);
      console.log(`Robots.txt State: ${indexStatus.robotsTxtState || 'Unknown'}`);
      console.log(`Indexing State: ${indexStatus.indexingState || 'Unknown'}`);

      if (indexStatus.lastCrawlTime) {
        console.log(`Last Crawl: ${new Date(indexStatus.lastCrawlTime).toLocaleString()}`);
      }

      if (indexStatus.pageFetchState) {
        console.log(`Page Fetch: ${indexStatus.pageFetchState}`);
      }

      if (indexStatus.googleCanonical) {
        console.log(`Google Canonical: ${indexStatus.googleCanonical}`);
      }

      if (indexStatus.userCanonical) {
        console.log(`User Canonical: ${indexStatus.userCanonical}`);
      }
    }

    // Page indexing details
    if (result.pageIndexingResult) {
      console.log('\n═══════════════════════════════════════');
      console.log('📄 PAGE INDEXING DETAILS');
      console.log('═══════════════════════════════════════');

      const pageResult = result.pageIndexingResult;
      console.log(`Verdict: ${pageResult.verdict || 'Unknown'}`);

      if (pageResult.coverageState) {
        console.log(`Coverage: ${pageResult.coverageState}`);
      }
    }

    // Mobile usability
    if (result.mobileUsabilityResult) {
      console.log('\n═══════════════════════════════════════');
      console.log('📱 MOBILE USABILITY');
      console.log('═══════════════════════════════════════');

      const mobileResult = result.mobileUsabilityResult;
      console.log(`Verdict: ${mobileResult.verdict || 'Unknown'}`);

      if (mobileResult.issues && mobileResult.issues.length > 0) {
        console.log('\nIssues:');
        mobileResult.issues.forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue.issueType}: ${issue.message}`);
        });
      }
    }

    // Full raw response (for debugging)
    console.log('\n═══════════════════════════════════════');
    console.log('🔧 RAW RESPONSE (for debugging)');
    console.log('═══════════════════════════════════════');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);

    if (error.response?.data) {
      console.error('\nDetails:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.message.includes('not part of this property')) {
      console.error('\n💡 Make sure:');
      console.error('  1. The URL is part of your verified domain');
      console.error('  2. Using correct property:', SITE_URL);
    }

    process.exit(1);
  }
}

// Get URL from command line argument
const urlToInspect = process.argv[2];
inspectUrl(urlToInspect);
