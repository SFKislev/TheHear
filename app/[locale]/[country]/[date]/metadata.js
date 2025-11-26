import { getHeadline, getSummaryContent } from "@/utils/daily summary utils";
import { getCountryDailySummary, getCountryDayHeadlineOnly } from "@/utils/database/countryData";
import { fetchDailySnapshot } from "@/utils/database/fetchDailySnapshot";
import { countries } from "@/utils/sources/countries";
import { getWebsiteName, getSourceData } from "@/utils/sources/getCountryData";
import { add, parse, differenceInDays } from "date-fns";

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

export async function createMetadata(params) {
    const { country, locale, date } = await params;
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew || country : countryData.english || country;
    const flagEmoji = countryFlags[country] || '';
    const parsedDate = parse(date, 'dd-MM-yyyy', new Date(2000, 0, 1));
    // Shift to noon to avoid timezone rollover issues - MATCH PAGE.JS EXACTLY
    parsedDate.setHours(12, 0, 0, 0);

    // Validate date - return null metadata for invalid dates (Next.js will handle gracefully)
    if (isNaN(parsedDate.getTime())) {
        return {
            title: 'The Hear - News Headlines',
            description: 'Real-time news headlines and AI-powered analysis',
            robots: { index: false, follow: false }
        };
    }

    const formattedDate = date.replace(/-/g, '.');

    // Get just the headline - use JSON for historical dates, Firestore for recent dates
    let headline;
    try {
        const daysSinceDate = differenceInDays(new Date(), parsedDate);
        const isHistoricalDate = daysSinceDate > 2; // Historical dates use JSON
        
        let headlineData = null;
        
        if (isHistoricalDate) {
            // Try JSON first for historical dates (no Firestore reads)
            const jsonData = await fetchDailySnapshot(country, parsedDate);
            if (jsonData?.dailySummary) {
                headlineData = jsonData.dailySummary;
            }
        }
        
        // Fallback to Firestore if JSON didn't work or it's a recent date
        if (!headlineData) {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 2000) // 2 second timeout
            );
            headlineData = await Promise.race([
                getCountryDayHeadlineOnly(country, parsedDate),
                timeoutPromise
            ]);
        }

        if (headlineData) {
            headline = getHeadline(headlineData, locale);
        } else {
            throw new Error('No headline data');
        }
    } catch (error) {
        // Fallback to generic headline if timeout or error
        headline = locale === 'heb'
            ? `חדשות מ-${countryName} ל-${formattedDate}`
            : `News from ${countryName} for ${formattedDate}`;
    }

    const siteName = 'The Hear';

    // Consistent title format: [Flag] [Country] | [Date] | [Headline] | Headline Archive
    const title = locale === 'heb'
        ? `${flagEmoji} ${countryName} | ${formattedDate} | ${headline} | ארכיון כותרות`
        : `${flagEmoji} ${countryName} | ${formattedDate} | ${headline} | Headline Archive`;

    // Generic but informative description
    const description = locale === 'heb'
        ? `ארכיון כותרות חדשות מ-${countryName} ל-${date} - כותרות ראשיות מכלי תקשורת מרכזיים כפי שהתפתחו בזמן אמת`
        : `News headlines archive from ${countryName} for ${date} - Major headlines from leading news sources as they unfolded in real time`;

    const url = `https://www.thehear.org/${locale}/${country}/${date}`;

    return {
        title,
        description,
        keywords: `${countryName}, news, headlines, ${formattedDate}, archive, ${headline}`,
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
            type: 'article',
            publishedTime: parsedDate.toISOString(),
            modifiedTime: parsedDate.toISOString(),
            authors: ['The Hear'],
            section: 'News',
            tags: [countryName, 'news', 'headlines', formattedDate],
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
                'en': `https://www.thehear.org/en/${country}/${date}`,
                'he': `https://www.thehear.org/heb/${country}/${date}`,
                'x-default': `https://www.thehear.org/en/${country}/${date}`
            }
        },
    };
}

export function LdJson({ country, locale, date, daySummary, headlines, initialSummaries, sources }) {
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew || country : countryData.english || country;
    const flagEmoji = countryFlags[country] || '';
    const headline = daySummary ? getHeadline(daySummary, locale) : '';
    const siteName = 'The Hear';
    // Format date consistently (DD-MM-YYYY format to match canonical URL)
    const formattedDate = typeof date === 'string' ? date :
        `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

    const title = `${flagEmoji} ${countryName} | ${formattedDate} | ${headline} | Headline Archive`;
    const url = `https://www.thehear.org/${locale}/${country}/${formattedDate}`;

    const parsedDate = typeof date === 'string' ? parse(date, 'dd-MM-yyyy', new Date(2000, 0, 1)) : date;
    parsedDate.setHours(12, 0, 0, 0);

    // Create concise description for CollectionPage
    const description = locale === 'heb'
        ? `ארכיון כותרות מ-${countryName} ל-${formattedDate}, כפי שהתפתחו בזמן אמת.`
        : `An archive of the Headlines from major news sources in ${countryName} for ${formattedDate}, as they unfolded in real time: relive the news.`;

    // Prepare main content (daily summary) for SEO prominence
    const mainContent = daySummary ? getSummaryContent(daySummary, locale) : null;

    // Prepare hourly summaries as abstracts (analytical summaries)
    const abstracts = [];

    if (initialSummaries && Array.isArray(initialSummaries) && initialSummaries.length > 0) {
        initialSummaries.forEach((summary, index) => {
            // Use direct field access for summary content
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
                    'dateCreated': (() => {
                        try {
                            if (summary.timestamp instanceof Date && !isNaN(summary.timestamp.getTime())) {
                                return summary.timestamp.toISOString();
                            } else if (summary.timestamp?.seconds) {
                                return new Date(summary.timestamp.seconds * 1000).toISOString();
                            }
                        } catch (e) { }
                        return parsedDate.toISOString();
                    })(),
                    'creator': {
                        '@type': 'NewsMediaOrganization',
                        'name': 'The Hear AI Analysis'
                    },
                    'about': `News analysis for ${formattedDate}`
                });
            }
        });
    }

    const image = 'https://www.thehear.org/logo192.png';

    // Create ItemList elements for all headlines
    const itemListElements = [];
    if (headlines && headlines.length > 0) {
        // Sort headlines by timestamp (newest first)
        const sortedHeadlines = [...headlines].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedHeadlines.forEach((h, index) => {
            const sourceData = getSourceData(country, h.website_id);
            const sourceName = sourceData?.name || h.website_id;

            const newsArticle = {
                '@type': 'NewsArticle',
                'headline': h.headline || '',
                'url': h.link || '',
                'datePublished': (() => {
                    try {
                        if (h.timestamp instanceof Date && !isNaN(h.timestamp.getTime())) {
                            return h.timestamp.toISOString();
                        } else if (h.timestamp?.seconds) {
                            return new Date(h.timestamp.seconds * 1000).toISOString();
                        }
                    } catch (e) { }
                    return parsedDate.toISOString();
                })(),
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
                'datePublished': parsedDate.toISOString(),
                'dateModified': parsedDate.toISOString(),
                'mainEntity': {
                    '@id': `${url}#headlines`
                },
                ...(mainContent && {
                    'mainContentOfPage': {
                        '@type': 'WebPageElement',
                        'text': mainContent,
                        'name': headline || 'Daily Summary'
                    }
                }),
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
                'name': `Headlines for ${countryName} - ${formattedDate}`,
                'numberOfItems': itemListElements.length,
                'itemListElement': itemListElements
            }
        ]
    };

    return (
        <script
            id={`jsonld-country-${country}-${locale}-${formattedDate}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}