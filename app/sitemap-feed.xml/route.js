import { countries } from "@/utils/sources/countries"
import { createDateString } from "@/utils/utils"

// Per-country launch dates - actual dates when data became available
const countryLaunchDates = {
    'israel': new Date('2024-07-04'),
    'germany': new Date('2024-07-28'),
    'us': new Date('2024-07-31'),
    'italy': new Date('2024-08-28'),
    'russia': new Date('2024-08-29'),
    'iran': new Date('2024-08-29'),
    'france': new Date('2024-08-29'),
    'lebanon': new Date('2024-08-29'),
    'poland': new Date('2024-08-30'),
    'uk': new Date('2024-09-05'),
    'india': new Date('2024-09-05'),
    'ukraine': new Date('2024-09-05'),
    'spain': new Date('2024-09-05'),
    'netherlands': new Date('2024-09-05'),
    'china': new Date('2024-09-06'),
    'japan': new Date('2024-09-07'),
    'turkey': new Date('2024-09-07'),
    'uae': new Date('2024-09-08'),
    'palestine': new Date('2024-09-10'),
    'finland': new Date('2025-02-20')
};

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
        const countryLaunchDate = countryLaunchDates[country];
        if (!countryLaunchDate) {
            console.warn(`No launch date found for country: ${country}`);
            return;
        }

        // Calculate days since this country launched
        const daysSinceLaunch = Math.floor((today - countryLaunchDate) / (1000 * 60 * 60 * 24));

        // Only include days where data actually exists, with reasonable maximum
        const maxDaysForCountry = Math.min(daysSinceLaunch, 365);

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
