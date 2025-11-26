/**
 * Submit feed URLs to Bing IndexNow
 *
 * Usage:
 *   node scripts/submit-to-bing.js <key> [country] [days]
 *
 * Examples:
 *   node scripts/submit-to-bing.js abc-123-def  # Submit all sitemaps
 *   node scripts/submit-to-bing.js abc-123-def us 30  # Submit last 30 days for US
 */

const { submitToIndexNow, generateFeedUrls } = require('./bing-indexnow.js');

const countries = [
    'israel', 'germany', 'us', 'italy', 'russia', 'iran', 'france',
    'lebanon', 'poland', 'uk', 'india', 'ukraine', 'spain',
    'netherlands', 'china', 'japan', 'turkey', 'uae', 'palestine', 'finland'
];

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error('Usage: node scripts/submit-to-bing.js <indexnow-key> [country] [days]');
        console.error('\nExamples:');
        console.error('  node scripts/submit-to-bing.js abc-123-def  # Submit static pages');
        console.error('  node scripts/submit-to-bing.js abc-123-def us 30  # Last 30 days for US');
        process.exit(1);
    }

    const key = args[0];
    const targetCountry = args[1] || null;
    const days = parseInt(args[2]) || 7;

    console.log('\n📤 Bing IndexNow Submission\n');
    console.log(`Key: ${key}`);
    console.log(`Target: ${targetCountry || 'All static pages + sitemaps'}`);
    console.log(`Days: ${days}\n`);

    let allUrls = [];

    if (!targetCountry) {
        // Submit main sitemaps and static pages (archive-focused strategy)
        // Excludes: date-pages (canonical to feed), live country/global pages (constantly changing)
        allUrls = [
            'https://www.thehear.org/sitemap.xml',
            'https://www.thehear.org/sitemap-static.xml',
            'https://www.thehear.org/sitemap-feed.xml',
            'https://www.thehear.org/sitemap-archives.xml',
            'https://www.thehear.org/sitemap-global-archives.xml',
            'https://www.thehear.org/about',
            'https://www.thehear.org/methodology'
        ];

        console.log('📋 Submitting sitemap URLs and static pages (archive strategy)...\n');
    } else {
        // Submit feed URLs for specific country
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        console.log(`📅 Generating feed URLs for ${targetCountry}`);
        console.log(`   From: ${startDate.toISOString().split('T')[0]}`);
        console.log(`   To:   ${endDate.toISOString().split('T')[0]}\n`);

        allUrls = generateFeedUrls(targetCountry, startDate, endDate);
    }

    console.log(`📊 Total URLs to submit: ${allUrls.length}\n`);

    // IndexNow accepts max 10,000 URLs per request
    // But we'll batch in smaller chunks for reliability
    const BATCH_SIZE = 1000;
    const batches = [];

    for (let i = 0; i < allUrls.length; i += BATCH_SIZE) {
        batches.push(allUrls.slice(i, i + BATCH_SIZE));
    }

    console.log(`📦 Batches: ${batches.length}\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < batches.length; i++) {
        console.log(`\n🔄 Batch ${i + 1}/${batches.length} (${batches[i].length} URLs)...`);

        const success = await submitToIndexNow(batches[i], key);

        if (success) {
            successCount += batches[i].length;
        } else {
            failCount += batches[i].length;
        }

        // Rate limiting: wait 1 second between batches
        if (i < batches.length - 1) {
            console.log('⏳ Waiting 1s...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Success: ${successCount} URLs`);
    console.log(`   ❌ Failed:  ${failCount} URLs`);
    console.log('\n🔗 Check status in Bing Webmaster Tools:');
    console.log('   https://www.bing.com/webmasters/\n');
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
