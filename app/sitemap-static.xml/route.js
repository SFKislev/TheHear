import { countries } from "@/utils/sources/countries"

// Revalidate every 24 hours
export const revalidate = 86400

export async function GET() {
    const baseUrl = 'https://www.thehear.org'
    const res = []
    const now = new Date()

    // Static information pages - very high priority (easy to crawl, help Google understand the site)
    res.push({
        url: `${baseUrl}/about`,
        lastModified: new Date('2025-08-28'),
        changeFrequency: 'monthly',
        priority: 0.95
    });

    res.push({
        url: `${baseUrl}/methodology`,
        lastModified: new Date('2025-08-28'),
        changeFrequency: 'monthly',
        priority: 0.95
    });

    // Global overview pages - high priority, frequently updated real-time content
    // These pages provide unique AI-generated analysis of global news coverage
    res.push({
        url: `${baseUrl}/en/global`,
        lastModified: now, // Always current - signals fresh content
        changeFrequency: 'hourly', // Updates throughout the day
        priority: 0.8 // High priority for unique content
    });

    res.push({
        url: `${baseUrl}/heb/global`,
        lastModified: now,
        changeFrequency: 'hourly',
        priority: 0.8
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
