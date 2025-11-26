import { countries } from "@/utils/sources/countries";

export function createMetadata({ country, locale }) {
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew || country : countryData.english || country;
    const isHebrew = locale === 'heb';
    const url = `https://www.thehear.org/${locale}/${country}/search`;
    const siteName = 'The Hear';
    
    const title = isHebrew 
        ? `חיפוש ארכיון חדשות ${countryName} | The Hear`
        : `Search ${countryName} News Archive | The Hear`;
    
    const description = isHebrew
        ? `חיפוש וגלישה בארכיון החדשות המלא של ${countryName}. כותרות היסטוריות, סקירות יומיות וסיכומי חדשות מתאריך התחלת המעקב. גישה לכל הנתונים ההיסטוריים שנאספו על ידי The Hear.`
        : `Search the main headlines news archive for ${countryName}. Find historical headlines, daily summaries, and news overviews since tracking began. Access all historical data collected by The Hear.`;

    const keywords = isHebrew
        ? `${countryName}, חיפוש חדשות, ארכיון חדשות, כותרות היסטוריות, סקירות יומיות, עיתונות`
        : `${countryName}, news search, news archive, historical headlines, daily summaries, journalism, media history`;

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
            canonical: `https://www.thehear.org/en/${country}/search`, // Always canonical to English
            languages: {
                'en': `https://www.thehear.org/en/${country}/search`,
                'x-default': `https://www.thehear.org/en/${country}/search`
                // Removed Hebrew alternate since heb/search routes redirect to en/search
            }
        }
    };
}

// JSON-LD structured data for search page
export function SearchLdJson({ country, locale }) {
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew : countryData.english;
    const isHebrew = locale === 'heb';
    const url = `https://www.thehear.org/${locale}/${country}/search`;
    
    const title = isHebrew 
        ? `חיפוש ארכיון חדשות ${countryName} | The Hear`
        : `Search ${countryName} News Archive | The Hear`;
    
    const description = isHebrew
        ? `חיפוש וגלישה בארכיון החדשות המלא של ${countryName}. כותרות היסטוריות, סקירות יומיות וסיכומי חדשות מתאריך התחלת המעקב.`
        : `Search and explore the complete news archive for ${countryName}. Find historical headlines, daily summaries, and news overviews since tracking began.`;

    // Create breadcrumb navigation
    const breadcrumbList = {
        '@type': 'BreadcrumbList',
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
                'name': isHebrew ? 'חיפוש ארכיון' : 'Archive Search',
                'item': url
            }
        ]
    };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SearchResultsPage',
                '@id': url,
                'name': title,
                'description': description,
                'url': url,
                'inLanguage': locale === 'heb' ? 'he' : 'en',
                'dateModified': new Date().toISOString(),
                'breadcrumb': {
                    '@id': `${url}#breadcrumb`
                },
                'mainEntity': {
                    '@type': 'WebSite',
                    'name': 'The Hear',
                    'url': 'https://www.thehear.org',
                    'potentialAction': {
                        '@type': 'SearchAction',
                        'target': {
                            '@type': 'EntryPoint',
                            'urlTemplate': `${url}?q={search_term_string}`
                        },
                        'query-input': 'required name=search_term_string'
                    }
                },
                'publisher': {
                    '@type': 'NewsMediaOrganization',
                    'name': 'The Hear',
                    'logo': {
                        '@type': 'ImageObject',
                        'url': 'https://www.thehear.org/logo192.png'
                    },
                    'url': 'https://www.thehear.org'
                },
                'about': {
                    '@type': 'Thing',
                    'name': `${countryName} News Archive Search`,
                    'description': `Searchable archive interface for ${countryName} news and headlines`
                }
            },
            breadcrumbList
        ]
    };
    
    return (
        <script 
            id={`jsonld-search-${country}-${locale}`}
            type="application/ld+json" 
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
        />
    );
}