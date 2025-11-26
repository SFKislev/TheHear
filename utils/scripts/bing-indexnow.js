/**
 * Bing IndexNow API - Instant URL Submission
 *
 * IndexNow is a protocol that allows websites to instantly inform search engines
 * about latest content changes on their website. This speeds up crawling and indexing.
 *
 * Docs: https://www.bing.com/indexnow
 */

// Generate a random API key (you only need to do this once)
// Save this key and host it at: https://www.thehear.org/{key}.txt
const INDEXNOW_KEY = crypto.randomUUID();

console.log('\n=== BING INDEXNOW SETUP ===\n');
console.log('1. Create a file at your website root with this exact filename:');
console.log(`   ${INDEXNOW_KEY}.txt`);
console.log('\n2. The file should contain ONLY this text:');
console.log(`   ${INDEXNOW_KEY}`);
console.log('\n3. Verify it\'s accessible at:');
console.log(`   https://www.thehear.org/${INDEXNOW_KEY}.txt`);
console.log('\n4. Then run the submission script below.');
console.log('\n=====================\n');

/**
 * Submit URLs to Bing IndexNow
 * @param {string[]} urls - Array of URLs to submit (max 10,000 per request)
 * @param {string} key - Your IndexNow API key
 */
async function submitToIndexNow(urls, key) {
    const payload = {
        host: "www.thehear.org",
        key: key,
        keyLocation: `https://www.thehear.org/${key}.txt`,
        urlList: urls
    };

    try {
        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 200) {
            console.log(`✅ Successfully submitted ${urls.length} URLs to IndexNow`);
            return true;
        } else if (response.status === 202) {
            console.log(`✅ URLs received (202) - ${urls.length} URLs submitted`);
            return true;
        } else if (response.status === 400) {
            console.error('❌ Bad request - Invalid format');
            return false;
        } else if (response.status === 403) {
            console.error('❌ Forbidden - Key validation failed. Check your key file!');
            return false;
        } else if (response.status === 422) {
            console.error('❌ Unprocessable Entity - URL doesn\'t belong to the host or is blocked by robots.txt');
            return false;
        } else if (response.status === 429) {
            console.error('❌ Too Many Requests - Rate limited');
            return false;
        } else {
            console.error(`❌ Unexpected status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Error submitting to IndexNow:', error.message);
        return false;
    }
}

/**
 * Generate feed URLs for a specific country and date range
 */
function generateFeedUrls(country, startDate, endDate, locales = ['en', 'heb']) {
    const urls = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        const day = String(current.getDate()).padStart(2, '0');
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const year = current.getFullYear();
        const dateString = `${day}-${month}-${year}`;

        locales.forEach(locale => {
            urls.push(`https://www.thehear.org/${locale}/${country}/${dateString}/feed`);
        });

        current.setDate(current.getDate() + 1);
    }

    return urls;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        INDEXNOW_KEY,
        submitToIndexNow,
        generateFeedUrls
    };
}
