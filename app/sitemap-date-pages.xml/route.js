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

    // Base date pages (without /feed) - Medium priority
    // These are JS-heavy interactive pages, not canonical
    // The /feed pages are the canonical versions
    Object.keys(countries).forEach(country => {
        const countryLaunchDate = COUNTRY_LAUNCH_DATES[country];
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

                // Lower priority than feed pages - these are not canonical
                // Priority: yesterday = 0.5, older = 0.3
                const priority = 0.5 - ((i - 1) / maxDaysForCountry) * 0.2;

                res.push({
                    url: `${baseUrl}/${locale}/${country}/${dateString}`,
                    lastModified: date,
                    changeFrequency: 'never', // Historical data doesn't change
                    priority: Math.max(0.3, priority) // Ensure minimum priority of 0.3
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
