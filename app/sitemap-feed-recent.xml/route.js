import { countries } from "@/utils/sources/countries"
import { createDateString } from "@/utils/utils"
import { COUNTRY_LAUNCH_DATES } from "@/utils/launchDates"

// Revalidate every 24 hours
export const revalidate = 86400

export async function GET() {
    const baseUrl = 'https://www.thehear.org'
    const locales = ['en', 'heb']
    const today = new Date()
    const res = []

    // CRITICAL: Only include last 60 days to reduce sitemap size during authority building
    // This shows Google we prioritize quality over quantity
    // Expand gradually as backlinks grow (see DOMAIN_AUTHORITY_CRISIS_ANALYSIS.md)
    const DAYS_TO_INCLUDE = 60;

    // Feed pages - HIGHEST PRIORITY (bot-optimized, canonical, SSR)
    // Only recent content to focus crawl budget on high-value pages
    Object.keys(countries).forEach(country => {
        const countryLaunchDate = COUNTRY_LAUNCH_DATES[country];
        if (!countryLaunchDate) {
            console.warn(`No launch date found for country: ${country}`);
            return;
        }

        locales.forEach(locale => {
            // Only include recent days (last 60 days)
            for (let i = 1; i <= DAYS_TO_INCLUDE; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                // Skip dates before this country launched
                if (date < countryLaunchDate) {
                    continue;
                }

                const dateString = createDateString(date);

                // Higher priority for recent content (yesterday = 1.0, gradually decreases)
                const priority = 1.0 - ((i - 1) / DAYS_TO_INCLUDE) * 0.2;

                res.push({
                    url: `${baseUrl}/${locale}/${country}/${dateString}/feed`,
                    lastModified: date,
                    changeFrequency: 'never', // Historical data doesn't change
                    priority: Math.max(0.8, priority) // Ensure minimum priority of 0.8
                });
            }
        });
    });

    // Convert to XML format
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${res.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    })
}

