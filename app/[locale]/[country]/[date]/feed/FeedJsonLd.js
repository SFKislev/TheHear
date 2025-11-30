import { getHeadline, getSummaryContent } from "@/utils/daily summary utils";
import { countries } from "@/utils/sources/countries";
import { getSourceData } from "@/utils/sources/getCountryData";

// Flag emoji mapping for countries
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

export default function FeedJsonLd({ country, locale, date, daySummary, headlines, initialSummaries }) {
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew || country : countryData.english || country;
    const flagEmoji = countryFlags[country] || '';
    const timezone = countryData.timezone || 'UTC';

    // Format date consistently (DD-MM-YYYY format to match canonical URL)
    const formattedDate = typeof date === 'string' ? date :
        `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

    const formattedDateDisplay = formattedDate.replace(/-/g, '.');
    const headline = daySummary ? getHeadline(daySummary, locale) : '';

    const title = locale === 'heb'
        ? `${flagEmoji} ${countryName} | ${formattedDateDisplay} | ארכיון כותרות`
        : `${flagEmoji} ${countryName} | ${formattedDateDisplay} | Headline Archive`;

    const url = `https://www.thehear.org/${locale}/${country}/${formattedDate}/feed`;

    // Description for the feed page - emphasizing chronological archive
    const description = locale === 'heb'
        ? `ארכיון מלא של כותרות חדשות מ-${countryName} ל-${formattedDateDisplay} - כל הכותרות בסדר כרונולוגי`
        : `Complete chronological archive of news headlines from ${countryName} for ${formattedDateDisplay} - All ${headlines.length} headlines as they appeared throughout the day`;

    // Helper to clean summary text
    const cleanSummaryText = (text) => {
        if (!text) return '';
        const markers = ['HEBREWSUMMARY:', 'LOCALSUMMARY:', 'SUMMARY:'];
        let cleanText = text;
        for (const marker of markers) {
            const markerIndex = text.indexOf(marker);
            if (markerIndex !== -1) {
                cleanText = text.substring(0, markerIndex).trim();
                break;
            }
        }
        return cleanText;
    };

    // Prepare main content (daily summary) for SEO prominence
    const mainContent = daySummary ? getSummaryContent(daySummary, locale) : null;
    const rawMainHeadline = daySummary ? headline : '';

    // Add date to main daily summary headline for archival context
    let mainHeadline = rawMainHeadline;
    if (rawMainHeadline && date) {
        const dateObj = date instanceof Date ? date : new Date(date);
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).formatToParts(dateObj);

        const month = parts.find(p => p.type === 'month').value;
        const day = parts.find(p => p.type === 'day').value;
        const year = parts.find(p => p.type === 'year').value;
        const dateStr = `${month} ${day} ${year}`; // No comma between day and year

        mainHeadline = `${dateStr} - ${rawMainHeadline}`;
    }

    // Prepare hourly summaries as structured AnalysisNewsArticle items
    const hourlySummaries = [];
    if (initialSummaries && Array.isArray(initialSummaries) && initialSummaries.length > 0) {
        initialSummaries.forEach((summary, index) => {
            // Get summary content
            let summaryContent = '';
            if (locale === 'heb') {
                summaryContent = cleanSummaryText(summary.hebrewSummary || summary.summary || summary.translatedSummary);
            } else {
                summaryContent = cleanSummaryText(summary.summary || summary.translatedSummary || summary.hebrewSummary);
            }

            // Get summary headline
            let summaryHeadline = '';
            if (locale === 'heb') {
                summaryHeadline = cleanSummaryText(summary.hebrewHeadline || summary.headline);
            } else {
                summaryHeadline = cleanSummaryText(summary.englishHeadline || summary.headline);
            }

            if (summaryContent && summaryContent.trim() && summaryContent.length > 20) {
                // Add date + timestamp to headline for archival context (in local timezone)
                const timestamp = summary.timestamp ? new Date(summary.timestamp) : null;
                let dateTimePrefix = '';
                if (timestamp) {
                    // Format date and time in the country's local timezone
                    // Include year for historical archive context
                    const parts = new Intl.DateTimeFormat('en-US', {
                        timeZone: timezone,
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }).formatToParts(timestamp);

                    const month = parts.find(p => p.type === 'month').value;
                    const day = parts.find(p => p.type === 'day').value;
                    const year = parts.find(p => p.type === 'year').value;
                    const dateStr = `${month} ${day} ${year}`; // No comma between day and year

                    const timeStr = timestamp.toLocaleString('en-US', {
                        timeZone: timezone,
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                    dateTimePrefix = `${dateStr}, ${timeStr} - `;
                }
                const fullHeadline = summaryHeadline
                    ? `${dateTimePrefix}${summaryHeadline}`
                    : `${dateTimePrefix}News analysis ${index + 1}`;

                hourlySummaries.push({
                    '@type': 'AnalysisNewsArticle',
                    'headline': fullHeadline,
                    'articleBody': summaryContent.trim(),
                    'datePublished': summary.timestamp ? new Date(summary.timestamp).toISOString() : date.toISOString(),
                    'image': {
                        '@type': 'ImageObject',
                        'url': 'https://www.thehear.org/logo512.png',
                        'width': 512,
                        'height': 512
                    },
                    'author': {
                        '@type': 'Organization',
                        'name': 'The Hear AI Analysis',
                        'url': 'https://www.thehear.org'
                    },
                    'publisher': {
                        '@type': 'NewsMediaOrganization',
                        'name': 'The Hear',
                        'logo': {
                            '@type': 'ImageObject',
                            'url': 'https://www.thehear.org/logo192.png'
                        },
                        'url': 'https://www.thehear.org',
                        'publishingPrinciples': 'https://www.thehear.org/methodology',
                        'masthead': 'https://www.thehear.org/about'
                    },
                    'about': {
                        '@type': 'Thing',
                        'name': `Overview of Headlines from ${countryName}`
                    },
                    'inLanguage': locale === 'heb' ? 'he' : 'en'
                });
            }
        });
    }

    const image = 'https://www.thehear.org/logo192.png';
    const totalHeadlines = headlines?.length || 0;

    // Build comprehensive JSON-LD for a chronological news archive page
    // This is a CollectionPage containing AnalysisNewsArticle items (AI summaries)
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
                'datePublished': date instanceof Date ? date.toISOString() : new Date(date).toISOString(),
                'dateModified': date instanceof Date ? date.toISOString() : new Date(date).toISOString(),
                'about': {
                    '@type': 'Thing',
                    'name': `${countryName} News`,
                    'description': `Historical news archive from ${countryName} for ${formattedDateDisplay}`
                },
                ...(mainContent && mainHeadline && {
                    'mainEntity': {
                        '@type': 'AnalysisNewsArticle',
                        'headline': mainHeadline,
                        'articleBody': mainContent,
                        'datePublished': date instanceof Date ? date.toISOString() : new Date(date).toISOString(),
                        'image': {
                            '@type': 'ImageObject',
                            'url': 'https://www.thehear.org/logo512.png',
                            'width': 512,
                            'height': 512
                        },
                        'author': {
                            '@type': 'Organization',
                            'name': 'The Hear AI Analysis',
                            'url': 'https://www.thehear.org'
                        },
                        'publisher': {
                            '@type': 'NewsMediaOrganization',
                            'name': 'The Hear',
                            'logo': {
                                '@type': 'ImageObject',
                                'url': image
                            },
                            'url': 'https://www.thehear.org',
                            'publishingPrinciples': 'https://www.thehear.org/methodology',
                            'masthead': 'https://www.thehear.org/about'
                        },
                        'about': `Daily news summary for ${countryName}`,
                        'inLanguage': locale === 'heb' ? 'he' : 'en'
                    }
                }),
                ...(hourlySummaries.length > 0 && {
                    'hasPart': hourlySummaries
                }),
                'isPartOf': {
                    '@type': 'ItemList',
                    'name': `${countryName} News Archive`,
                    'description': `Chronological archive of ${totalHeadlines} news headlines from ${countryName}`,
                    'numberOfItems': totalHeadlines
                },
                'publisher': {
                    '@type': 'NewsMediaOrganization',
                    'name': 'The Hear',
                    'logo': {
                        '@type': 'ImageObject',
                        'url': image
                    },
                    'url': 'https://www.thehear.org',
                    'publishingPrinciples': 'https://www.thehear.org/methodology',
                    'masthead': 'https://www.thehear.org/about'
                },
                'breadcrumb': {
                    '@id': `${url}#breadcrumb`
                }
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${url}#breadcrumb`,
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Home',
                        'item': 'https://www.thehear.org/'
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': countryName,
                        'item': `https://www.thehear.org/${locale}/${country}`
                    },
                    {
                        '@type': 'ListItem',
                        'position': 3,
                        'name': formattedDateDisplay,
                        'item': `https://www.thehear.org/${locale}/${country}/${formattedDate}`
                    },
                    {
                        '@type': 'ListItem',
                        'position': 4,
                        'name': 'Feed View',
                        'item': url
                    }
                ]
            }
        ]
    };

    return (
        <script
            id={`jsonld-feed-${country}-${locale}-${formattedDate}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
