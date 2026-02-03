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

    // Feed pages - HIGHEST PRIORITY (bot-optimized, canonical, SSR)
    // These are the pages we want search engines to index
    Object.keys(countries).forEach(country => {
        const countryLaunchDate = COUNTRY_LAUNCH_DATES[country];
        if (!countryLaunchDate) {
            console.warn(`No launch date found for country: ${country}`);
            return;
        }

        // Calculate days since this country launched
        const daysSinceLaunch = Math.floor((today - countryLaunchDate) / (1000 * 60 * 60 * 24));

        // Include full history since launch (no cap)
        const maxDaysForCountry = Math.max(daysSinceLaunch, 0);

        locales.forEach(locale => {
            // Start from i=1 (yesterday) since today's date URLs don't exist yet
            for (let i = 1; i <= maxDaysForCountry; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                // Skip dates before this country launched
                if (date < countryLaunchDate) {
                    continue;
                }

                const dateString = createDateString(date);

                // Priority: yesterday = 1.0, gradually decreases to 0.7
                // These are bot-optimized pages, so they get highest priority
                const priority = 1.0 - ((i - 1) / maxDaysForCountry) * 0.3;

                res.push({
                    url: `${baseUrl}/${locale}/${country}/${dateString}/feed`,
                    lastModified: date,
                    changeFrequency: 'never', // Historical data doesn't change
                    priority: Math.max(0.7, priority) // Ensure minimum priority of 0.7
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
