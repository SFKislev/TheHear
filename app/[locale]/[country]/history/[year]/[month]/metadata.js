import { countries } from "@/utils/sources/countries";
import { getSourceData } from "@/utils/sources/getCountryData";
import { getSummaryContent } from "@/utils/daily summary utils";

export function createMetadata({ country, locale, year, month }) {
    const countryData = countries[country];
    if (!countryData) {
        return {
            title: 'Country not found',
            description: 'The requested country could not be found.'
        };
    }

    const countryName = locale === 'heb' ? countryData.hebrew : countryData.english;
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
        locale === 'heb' ? 'he' : 'en', 
        { month: 'long', year: 'numeric' }
    );

    const isHebrew = locale === 'heb';
    const url = `https://www.thehear.org/${locale}/${country}/history/${year}/${month}`;
    const siteName = 'The Hear';
    
    const title = isHebrew 
        ? `ארכיון חדשות ${countryName} - ${monthName} | The Hear`
        : `${countryName} News Archive - ${monthName} | The Hear`;
    
    const description = isHebrew
        ? `דף זה מתעד את הסיפורים העיקריים שהתרחשו בתקשורת ${countryName} ב-${monthName}. הכותרות היומיות והסקירות, שנועדו לתפקד כשיא היסטורי מיקרו בזמן אמת של כותרות חדשות, נכתבו על ידי בינה מלאכותית. בחר תאריך כדי לראות את הכותרות האמיתיות כפי שהתרחשו, ללא עריכה.`
        : `This page chronicles the main stories that unfolded in ${countryName} media on ${monthName}. The daily titles and overviews, meant to function as a real time, micro-history record of news headlines, were written by an AI. Pick a date to see the actual headlines as they played out, unedited.`;

    const keywords = isHebrew
        ? `${countryName}, חדשות, ארכיון, ${monthName}, סיכומים יומיים, עיתונות`
        : `${countryName}, news, archive, ${monthName}, daily summaries, journalism`;

    return {
        title,
        description,
        keywords,
        openGraph: {
            title,
            description,
            url,
            siteName,
            type: 'website',
            locale: isHebrew ? 'he_IL' : 'en_US',
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
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
            }
        },
        alternates: {
            canonical: url,
            languages: {
                'en': `https://www.thehear.org/en/${country}/history/${year}/${month}`,
                'he': `https://www.thehear.org/heb/${country}/history/${year}/${month}`,
                'x-default': `https://www.thehear.org/en/${country}/history/${year}/${month}`
            }
        }
    };
}

export function LdJson({ country, locale, year, month, dailySummaries, headlines, sources }) {
    const countryData = countries[country];
    if (!countryData) return null;

    const countryName = locale === 'heb' ? countryData.hebrew : countryData.english;
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
        locale === 'heb' ? 'he' : 'en', 
        { month: 'long', year: 'numeric' }
    );
    const isHebrew = locale === 'heb';
    const url = `https://www.thehear.org/${locale}/${country}/history/${year}/${month}`;
    
    const title = isHebrew 
        ? `ארכיון חדשות ${countryName} - ${monthName} | The Hear`
        : `${countryName} News Archive - ${monthName} | The Hear`;
    
    const description = isHebrew
        ? `דף זה מתעד את הסיפורים העיקריים שהתרחשו בתקשורת ${countryName} ב-${monthName}. הכותרות היומיות והסקירות, שנועדו לתפקד כשיא היסטורי מיקרו בזמן אמת של כותרות חדשות, נכתבו על ידי בינה מלאכותית. בחר תאריך כדי לראות את הכותרות האמיתיות כפי שהתרחשו, ללא עריכה.`
        : `This page chronicles the main stories that unfolded in ${countryName} media on ${monthName}. The daily titles and overviews, meant to function as a real time, micro-history record of news headlines, were written by an AI. Pick a date to see the actual headlines as they played out, unedited.`;

    const image = 'https://www.thehear.org/logo192.png';
    
    // Create abstracts from daily summaries
    const abstracts = [];
    if (dailySummaries && Array.isArray(dailySummaries) && dailySummaries.length > 0) {
        dailySummaries.forEach((summary, index) => {
            const summaryContent = getSummaryContent(summary, locale);
            
            if (summaryContent && summaryContent.trim() && summaryContent.length > 20) {
                const summaryDate = summary.date ? new Date(summary.date) : new Date();
                const formattedDate = `${String(summaryDate.getDate()).padStart(2, '0')}-${String(summaryDate.getMonth() + 1).padStart(2, '0')}-${summaryDate.getFullYear()}`;
                
                abstracts.push({
                    '@type': 'CreativeWork',
                    'abstract': summaryContent.trim(),
                    'dateCreated': summaryDate.toISOString(),
                    'creator': {
                        '@type': 'NewsMediaOrganization',
                        'name': 'The Hear - AI Overviews'
                    },
                    'about': `Daily news summary for ${countryName} - ${formattedDate}`,
                    'url': `https://www.thehear.org/${locale}/${country}/${formattedDate}`
                });
            }
        });
    }
    
    // Create ItemList elements for all headlines across all days
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
                'datePublished': h.timestamp ? new Date(h.timestamp).toISOString() : '',
                'publisher': {
                    '@type': 'Organization',
                    'name': sourceName,
                    'url': sourceData?.url || ''
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

    // Create breadcrumb navigation
    const breadcrumbList = {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'The Hear',
                'item': 'https://www.thehear.org'
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
                'name': isHebrew ? 'ארכיון' : 'Archive',
                'item': `https://www.thehear.org/${locale}/${country}/history`
            },
            {
                '@type': 'ListItem',
                'position': 4,
                'name': year,
                'item': `https://www.thehear.org/${locale}/${country}/history/${year}`
            },
            {
                '@type': 'ListItem',
                'position': 5,
                'name': monthName,
                'item': url
            }
        ]
    };

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
                'datePublished': new Date(parseInt(year), parseInt(month) - 1, 1).toISOString(),
                'dateModified': new Date().toISOString(),
                'mainEntity': {
                    '@id': `${url}#archive`
                },
                'breadcrumb': {
                    '@id': `${url}#breadcrumb`
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
                    },
                    'url': 'https://www.thehear.org'
                },
                'about': {
                    '@type': 'Thing',
                    'name': `${countryName} News Archive`,
                    'description': `Historical news archive for ${countryName} covering ${monthName}`
                }
            },
            breadcrumbList,
            {
                '@type': 'ItemList',
                '@id': `${url}#archive`,
                'name': `${countryName} News Archive - ${monthName}`,
                'description': `Complete archive of daily news summaries and headlines from ${countryName} for ${monthName}`,
                'numberOfItems': itemListElements.length,
                'itemListElement': itemListElements
            }
        ]
    };
    
    return (
        <script 
            id={`jsonld-archive-${country}-${locale}-${year}-${month}`}
            type="application/ld+json" 
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
        />
    )
}