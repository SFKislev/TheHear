// Revalidate every 24 hours
export const revalidate = 86400

export async function GET() {
    const baseUrl = 'https://www.thehear.org'
    const locales = ['en', 'heb']
    const today = new Date()
    const res = []

    // Global daily archive pages - starting from September 14, 2024
    const globalStartDate = new Date('2024-09-14');

    locales.forEach(locale => {
        // Calculate days since global archive launch
        const daysSinceGlobalLaunch = Math.floor((today - globalStartDate) / (1000 * 60 * 60 * 24));

        // Only include days where data actually exists, with reasonable maximum
        const maxDaysForGlobal = Math.min(daysSinceGlobalLaunch, 365);

        // Start from i=1 (yesterday) since today's date URLs don't exist yet
        for (let i = 1; i <= maxDaysForGlobal; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // Skip dates before global archive launch
            if (date < globalStartDate) {
                continue;
            }

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            // Priority increases with age: yesterday = 0.3, oldest = 0.6
            // Older pages are more important as they contain established historical data
            const priority = 0.3 + ((i - 1) / maxDaysForGlobal) * 0.3;

            res.push({
                url: `${baseUrl}/${locale}/global/history/${year}/${month}/${day}`,
                lastModified: date,
                changeFrequency: 'never', // Historical data doesn't change
                priority: Math.max(0.3, Math.min(0.6, priority)) // Ensure priority stays between 0.3 and 0.6
            });
        }
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
