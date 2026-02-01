import { countries } from "@/utils/sources/countries"
import { createDateString } from "@/utils/utils"

// Per-country launch dates - actual dates when data became available
const countryLaunchDates = {
    'israel': new Date('2024-07-04'),
    'germany': new Date('2024-09-13'),
    'us': new Date('2024-09-15'),
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
    'palestine': new Date('2024-09-10'),
    'kenya': new Date('2025-11-05'),
    'finland': new Date('2025-02-20')
};

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
        const countryLaunchDate = countryLaunchDates[country];
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

