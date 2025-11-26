import { countries } from "@/utils/sources/countries"

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

// Revalidate every 24 hours (current month updates daily)
export const revalidate = 86400

export async function GET() {
    const baseUrl = 'https://www.thehear.org'
    const locales = ['en', 'heb']
    const today = new Date()
    const res = []

    // Monthly archive pages - medium priority
    Object.keys(countries).forEach(country => {
        // Exclude Finland - no archive data available
        if (country === 'finland') return;

        const countryLaunchDate = countryLaunchDates[country];
        if (!countryLaunchDate) return;

        locales.forEach(locale => {
            // Generate all month/year combinations from launch date to current month
            let date = new Date(countryLaunchDate.getFullYear(), countryLaunchDate.getMonth(), 1);
            const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

            while (date <= currentMonthStart) {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const isCurrentMonth = date.getTime() === currentMonthStart.getTime();

                res.push({
                    url: `${baseUrl}/${locale}/${country}/history/${year}/${month}`,
                    lastModified: isCurrentMonth ? new Date() : new Date(year, parseInt(month) - 1, 1),
                    changeFrequency: isCurrentMonth ? 'daily' : 'never',
                    priority: 0.65 // Medium priority for archive pages
                });

                // Move to next month
                date.setMonth(date.getMonth() + 1);
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
