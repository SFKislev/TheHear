// Sitemap Index - Routes to specialized sitemaps
// This is the main sitemap that search engines will discover
// It delegates to specialized sitemaps for better organization and crawl efficiency

// Revalidate the sitemap index every 24 hours
export const revalidate = 86400 // 24 hours in seconds

export default function sitemap() {
    const baseUrl = 'https://www.thehear.org'

    return [
        {
            url: `${baseUrl}/sitemap-static.xml`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/sitemap-feed.xml`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/sitemap-archives.xml`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/sitemap-global-archives.xml`,
            lastModified: new Date(),
        },
    ]
}
