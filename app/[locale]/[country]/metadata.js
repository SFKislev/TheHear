import { countries } from "@/utils/sources/countries";
import { getSourceData } from "@/utils/sources/getCountryData";

// Flag emoji mapping for countries (same as date pages)
const countryFlags = {
    "israel": "🇮🇱",
    "china": "🇨🇳",
    "finland": "🇫🇮",
    "france": "🇫🇷",
    "germany": "🇩🇪",
    "india": "🇮🇳",
    "iran": "🇮🇷",
    "italy": "🇮🇹",
    "japan": "🇯🇵",
    "lebanon": "🇱🇧",
    "netherlands": "🇳🇱",
    "palestine": "🇵🇸",
    "poland": "🇵🇱",
    "russia": "🇷🇺",
    "spain": "🇪🇸",
    "turkey": "🇹🇷",
    "uk": "🇬🇧",
    "us": "🇺🇸",
    "ukraine": "🇺🇦",
    "uae": "🇦🇪"
};

export async function createMetadata(params) {
    const { country, locale } = await params;
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew || country : countryData.english || country;
    const flagEmoji = countryFlags[country] || '';
    const siteName = 'The Hear';
    
    // Consistent title format: [Flag] Live Headlines from [Country] | Unfiltered news
    const title = locale === 'heb'
        ? `${flagEmoji} כותרות חיות מ${countryName} | דוכן עיתונים מתעדכן `
        : `${flagEmoji} Live Headlines from ${countryName} | Unfiltered news`;
    
    const description = locale === 'heb'
        ? `דוכן כותרות חי של עיתונים מ-${countryName}; ארכיון חדשות המעדכן בזמן אמת.`
        : `Live news headlines from ${countryName} - Real-time updates from major news sources displayed side by side.`;
    
    const url = `https://www.thehear.org/${locale}/${country}`;
    return {
        title,
        description,
        keywords: `${countryName}, live news, headlines, real-time, unfiltered news, ${flagEmoji}`,
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            title,
            description,
            url,
            siteName,
            locale: locale === 'heb' ? 'he_IL' : 'en_US',
            type: 'website',
            publishedTime: new Date().toISOString(),
            modifiedTime: new Date().toISOString(),
            authors: ['The Hear'],
            section: 'News',
            tags: [countryName, 'live news', 'headlines', 'real-time'],
            images: [
                {
                    url: 'https://www.thehear.org/logo192.png',
                    width: 192,
                    height: 192,
                    alt: `${siteName} logo`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['https://www.thehear.org/logo512.png'],
            site: '@thehearnews',
            creator: '@thehearnews'
        },
        alternates: {
            canonical: url,
            languages: {
                'en': `https://www.thehear.org/en/${country}`,
                'he': `https://www.thehear.org/heb/${country}`,
                'x-default': `https://www.thehear.org/en/${country}`
            }
        },
    };
}

export function LdJson({ country, locale, headlines, initialSummaries, sources, yesterdaySummary }) {
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew || country : countryData.english || country;
    const flagEmoji = countryFlags[country] || '';
    const url = `https://www.thehear.org/${locale}/${country}`;
    
    // Create concise description for CollectionPage
    const description = locale === 'heb'
        ? `דוכן כותרות חי של עיתונים מ-${countryName}; ארכיון חדשות המעדכן בזמן אמת.`
        : `Live news headlines from ${countryName} - Real-time updates from major news sources displayed side by side.`;
    
    const image = 'https://www.thehear.org/logo192.png';
    const title = locale === 'heb'
        ? `${flagEmoji} כותרות חיות מ${countryName} | דוכן עיתונים מתעדכן`
        : `${flagEmoji} Live Headlines from ${countryName} | Unfiltered news`;
    
    // Prepare hourly summaries as abstracts (analytical summaries)
    // ONLY include today's summaries (current calendar day UTC) - not yesterday's
    // Live page shows current analysis, not historical
    const abstracts = [];
    if (initialSummaries && Array.isArray(initialSummaries) && initialSummaries.length > 0) {
        const now = new Date();
        const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

        // Filter to only today's summaries (same calendar day UTC)
        const todaySummaries = initialSummaries.filter(summary => {
            if (!summary.timestamp) return false;
            const summaryDate = new Date(summary.timestamp);
            return summaryDate >= todayStart;
        });

        // Take only most recent 5 summaries (what's typically visible in UI)
        todaySummaries
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
            .forEach(summary => {
                let summaryContent = '';

                if (locale === 'heb') {
                    summaryContent = summary.hebrewSummary || summary.summary || summary.translatedSummary;
                } else {
                    summaryContent = summary.summary || summary.translatedSummary || summary.hebrewSummary;
                }

                if (summaryContent && summaryContent.trim() && summaryContent.length > 20) {
                    abstracts.push({
                        '@type': 'CreativeWork',
                        'abstract': summaryContent.trim(),
                        'dateCreated': new Date(summary.timestamp).toISOString(),
                        'creator': {
                            '@type': 'NewsMediaOrganization',
                            'name': 'The Hear AI Analysis'
                        },
                        'about': `Live news analysis for ${countryName}`
                    });
                }
            });
    }
    
    // Create ItemList elements - ONLY for currently visible/recent headlines
    // Live pages show ~6-40 headlines (latest per source), not all 500+ in the data
    // Match JSON-LD to actual UI to avoid structured data spam appearance
    const itemListElements = [];
    if (headlines && headlines.length > 0) {
        // Group by source, take only most recent headline per source
        const headlinesBySource = {};
        headlines.forEach(h => {
            const sourceName = getSourceData(country, h.website_id)?.name || h.website_id;
            if (!headlinesBySource[sourceName] ||
                new Date(h.timestamp) > new Date(headlinesBySource[sourceName].timestamp)) {
                headlinesBySource[sourceName] = h;
            }
        });

        // Convert to array and sort by timestamp (newest first)
        const recentHeadlines = Object.values(headlinesBySource)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 50); // Cap at 50 headlines max (typical UI shows 20-40)

        recentHeadlines.forEach((h, index) => {
            const sourceData = getSourceData(country, h.website_id);
            const sourceName = sourceData?.name || h.website_id;

            const newsArticle = {
                '@type': 'NewsArticle',
                'headline': h.headline || '',
                'url': h.link || '',
                'datePublished': h.timestamp ? new Date(h.timestamp).toISOString() : '',
                'publisher': {
                    '@type': 'Organization',
                    'name': sourceName
                }
            };

            // Only add description if subtitle exists and is not empty
            if (h.subtitle && h.subtitle.trim()) {
                newsArticle.description = h.subtitle;
            }

            itemListElements.push({
                '@type': 'ListItem',
                'position': index + 1,
                'item': newsArticle
            });
        });
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': url,
                'name': title,
                'description': description,
                'url': url,
                'inLanguage': locale === 'heb' ? 'he' : 'en',
                'datePublished': new Date().toISOString(),
                'dateModified': new Date().toISOString(),
                'mainEntity': {
                    '@id': `${url}#headlines`
                },
                ...(abstracts.length > 0 && {
                    'hasPart': abstracts
                }),
                'publisher': {
                    '@type': 'NewsMediaOrganization',
                    'name': 'The Hear',
                    'logo': {
                        '@type': 'ImageObject',
                        'url': image
                    }
                }
            },
            {
                '@type': 'ItemList',
                '@id': `${url}#headlines`,
                'name': `Live Headlines for ${countryName}`,
                'numberOfItems': itemListElements.length,
                'itemListElement': itemListElements
            }
        ]
    };
    
    return (
        <script 
            id={`jsonld-country-${country}-${locale}`}
            type="application/ld+json" 
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
        />
    )
}
