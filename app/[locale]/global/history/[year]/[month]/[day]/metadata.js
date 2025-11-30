import { countries } from "@/utils/sources/countries";
import { getSourceData } from "@/utils/sources/getCountryData";
import { getSummaryContent } from "@/utils/daily summary utils";

export async function createMetadata({ params }) {
    const { locale, year, month, day } = await params;
    
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dateString = currentDate.toLocaleDateString(
        locale === 'heb' ? 'he' : 'en', 
        { day: 'numeric', month: 'long', year: 'numeric' }
    );

    const isHebrew = locale === 'heb';
    const url = `https://www.thehear.org/${locale}/global/history/${year}/${month}/${day}`;
    const siteName = 'The Hear';
    
    const title = isHebrew 
        ? `ארכיון חדשות עולמי - ${dateString} | The Hear`
        : `Global News Archive - ${dateString} | The Hear`;
    
    const description = isHebrew
        ? `דף זה מתעד את הכותרות החדשות העיקריות מתאריך ה-${dateString}. הכותרות היומיות והסקירות, שנועדו לשמש כתיעוד בזמן אמת של כותרות חדשות, נכתבו על ידי בינה מלאכותית. בחר מדינה כדי לראות את הכותרות כפי שהתרחשו, ללא עריכה.`
        : `This page chronicles the main stories that unfolded across the world on ${dateString}. The daily titles and overviews, meant to function as a real time, micro-history record of global news headlines, were written by an AI. View headlines from all countries on a single day.`;

    const keywords = isHebrew
        ? `חדשות עולמיות, ארכיון, ${dateString}, סיכומים יומיים, עיתונות בינלאומית`
        : `global news, world archive, ${dateString}, daily summaries, international journalism`;

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
                'en': `https://www.thehear.org/en/global/history/${year}/${month}/${day}`,
                'he': `https://www.thehear.org/heb/global/history/${year}/${month}/${day}`,
                'x-default': `https://www.thehear.org/en/global/history/${year}/${month}/${day}`
            }
        }
    };
}

export function LdJson({ locale, year, month, day, currentDate, dailySummaries, headlines }) {
    const dateString = currentDate.toLocaleDateString(
        locale === 'heb' ? 'he' : 'en', 
        { day: 'numeric', month: 'long', year: 'numeric' }
    );

    const isHebrew = locale === 'heb';
    const url = `https://www.thehear.org/${locale}/global/history/${year}/${month}/${day}`;
    
    const title = isHebrew 
        ? `ארכיון חדשות עולמי - ${dateString} | The Hear`
        : `Global News Archive - ${dateString} | The Hear`;
    
    const description = isHebrew
        ? `דף זה מתעד את הכותרות החדשות העיקריות מתאריך ה-${dateString}. הכותרות היומיות והסקירות, שנועדו לשמש כתיעוד בזמן אמת של כותרות חדשות, נכתבו על ידי בינה מלאכותית. בחר מדינה כדי לראות את הכותרות כפי שהתרחשו, ללא עריכה.`
        : `This page chronicles the main stories that unfolded across the world on ${dateString}. The daily titles and overviews, meant to function as a real time, micro-history record of global news headlines, were written by an AI. View headlines from all countries on a single day.`;

    const image = 'https://www.thehear.org/logo192.png';
    
    // Create abstracts from daily summaries
    const abstracts = [];
    if (dailySummaries && Array.isArray(dailySummaries) && dailySummaries.length > 0) {
        dailySummaries.forEach((summary, index) => {
            const summaryContent = getSummaryContent(summary, locale);
            const countryName = locale === 'heb' ? countries[summary.country]?.hebrew : countries[summary.country]?.english;
            
            if (summaryContent && summaryContent.trim() && summaryContent.length > 20) {
                abstracts.push({
                    '@type': 'CreativeWork',
                    'abstract': summaryContent.trim(),
                    'dateCreated': currentDate.toISOString(),
                    'creator': {
                        '@type': 'NewsMediaOrganization',
                        'name': 'The Hear - AI Overviews'
                    },
                    'about': `Daily news summary for ${countryName} - ${dateString}`,
                    'url': `https://www.thehear.org/${locale}/${summary.country}/${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}`
                });
            }
        });
    }
    
    // Create ItemList elements for all headlines across all countries
    const itemListElements = [];
    if (headlines && headlines.length > 0) {
        // Sort headlines by timestamp (newest first)
        const sortedHeadlines = [...headlines].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        sortedHeadlines.forEach((h, index) => {
            // Find which country this headline belongs to
            const countrySummary = dailySummaries.find(summary => 
                summary.headlines && summary.headlines.some(headline => headline.id === h.id)
            );
            const country = countrySummary?.country;
            
            const sourceData = country ? getSourceData(country, h.website_id) : null;
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
                'name': isHebrew ? 'תצוגה עולמית' : 'Global View',
                'item': `https://www.thehear.org/${locale}/global`
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': isHebrew ? 'ארכיון' : 'Archive',
                'item': `https://www.thehear.org/${locale}/global/history`
            },
            {
                '@type': 'ListItem',
                'position': 4,
                'name': year,
                'item': `https://www.thehear.org/${locale}/global/history/${year}`
            },
            {
                '@type': 'ListItem',
                'position': 5,
                'name': `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
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
                'datePublished': currentDate.toISOString(),
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
                    'name': `Global News Archive`,
                    'description': `Historical news archive covering global headlines on ${dateString}`
                }
            },
            breadcrumbList,
            {
                '@type': 'ItemList',
                '@id': `${url}#archive`,
                'name': `Global News Archive - ${dateString}`,
                'description': `Complete archive of daily news summaries and headlines from all countries for ${dateString}`,
                'numberOfItems': itemListElements.length,
                'itemListElement': itemListElements
            }
        ]
    };
    
    return (
        <script 
            id={`jsonld-global-archive-${locale}-${year}-${month}-${day}`}
            type="application/ld+json" 
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
        />
    )
}