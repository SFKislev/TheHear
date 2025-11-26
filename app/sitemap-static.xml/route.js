import { countries } from "@/utils/sources/countries"

// Revalidate every 24 hours
export const revalidate = 86400

export async function GET() {
    const baseUrl = 'https://www.thehear.org'
    const res = []

    // MIGRATION STRATEGY: Initially only include About/Methodology
    // Live country and global pages will be added later (Month 4+)
    // This allows Google to focus on static, immutable content first

    // Static information pages - very high priority (easy to crawl, help Google understand the site)
    res.push({
        url: `${baseUrl}/about`,
        lastModified: new Date('2025-08-28'),
        changeFrequency: 'monthly',
        priority: 0.95 // Increased - helps Google understand the site's purpose
    });

    res.push({
        url: `${baseUrl}/methodology`,
        lastModified: new Date('2025-08-28'),
        changeFrequency: 'monthly',
        priority: 0.95 // Increased - helps Google understand the site's methodology
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
