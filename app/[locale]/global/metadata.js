import { countries } from "@/utils/sources/countries";

function getFlagEmoji(countryKey) {
    // Map countryKey to ISO alpha-2 code
    const mapping = {
        israel: 'IL', china: 'CN', finland: 'FI', france: 'FR', germany: 'DE', india: 'IN', iran: 'IR', italy: 'IT',
        japan: 'JP', lebanon: 'LB', netherlands: 'NL', palestine: 'PS', poland: 'PL', russia: 'RU', spain: 'ES',
        turkey: 'TR', uk: 'GB', us: 'US', ukraine: 'UA', uae: 'AE'
    };
    const code = mapping[countryKey];
    if (!code) return '';
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

export function GlobalLdJson({ locale, countrySummaries, globalOverview }) {
    const baseUrl = 'https://thehear.org';
    const url = `${baseUrl}/${locale}/global`;

    // Create description for global overview page
    const description = locale === 'heb'
        ? `סקירה גלובלית של כותרות העיתונים מכל העולם; דוכן חדשות בין־לאומי המעדכן בזמן אמת.`
        : `Global overview of live headlines from around the world; an international newsstand updating in real time.`;

    const image = `${baseUrl}/logo192.png`;
    const title = locale === 'heb'
        ? `חדשות גלובליות בזמן אמת`
        : `Live global newsstand - the headlines as they evolve`;
    
    // Prepare country summaries as abstracts
    const abstracts = [];
    if (countrySummaries && Object.keys(countrySummaries).length > 0) {
        Object.entries(countrySummaries).forEach(([country, summary]) => {
            if (summary) {
                const countryData = countries[country] || {};
                const countryName = locale === 'heb' ? countryData.hebrew || country : countryData.english || country;
                const flagEmoji = getFlagEmoji(country);
                
                let summaryContent = '';
                let headlineContent = '';
                
                if (locale === 'heb') {
                    summaryContent = summary.hebrewSummary || summary.summary;
                    headlineContent = summary.hebrewHeadline || summary.englishHeadline || summary.headline;
                } else {
                    summaryContent = summary.summary || summary.hebrewSummary;
                    headlineContent = summary.englishHeadline || summary.headline || summary.hebrewHeadline;
                }
                
                if (headlineContent && headlineContent.trim()) {
                    abstracts.push({
                        '@type': 'AnalysisNewsArticle',
                        'headline': headlineContent.trim(),
                        'articleBody': summaryContent ? summaryContent.trim() : '',
                        'description': locale === 'heb'
                            ? `ניתוח AI של הסיקור התקשורתי ב${countryName}`
                            : `AI-generated analysis of media coverage in ${countryName}`,
                        'datePublished': summary.timestamp ? new Date(summary.timestamp).toISOString() : new Date().toISOString(),
                        'author': {
                            '@type': 'Organization',
                            'name': 'The Hear AI',
                            'url': baseUrl
                        },
                        'publisher': {
                            '@type': 'NewsMediaOrganization',
                            'name': 'The Hear',
                            'url': baseUrl
                        },
                        'genre': locale === 'heb' ? 'ניתוח חדשות' : 'News Analysis',
                        'about': locale === 'heb' ? `חדשות מ${countryName}` : `News from ${countryName}`,
                        'url': `${baseUrl}/${locale}/${country}`,
                        'inLanguage': locale === 'heb' ? 'he' : 'en'
                    });
                }
            }
        });
    }

    // Add global overview as main abstract - using AnalysisNewsArticle to emphasize unique AI-generated content
    if (globalOverview) {
        const overviewData = locale === 'heb' ? globalOverview.hebrew : globalOverview.english;
        if (overviewData && overviewData.overview && overviewData.headline) {
            abstracts.unshift({
                '@type': 'AnalysisNewsArticle',
                'headline': overviewData.headline.trim(),
                'articleBody': overviewData.overview.trim(),
                'description': locale === 'heb'
                    ? 'ניתוח שנוצר על ידי בינה מלאכותית של סיקור תקשורתי גלובלי בזמן אמת'
                    : 'AI-generated analysis of global media coverage in real time',
                'datePublished': globalOverview.timestamp ? new Date(globalOverview.timestamp).toISOString() : new Date().toISOString(),
                'author': {
                    '@type': 'Organization',
                    'name': 'The Hear AI',
                    'url': baseUrl
                },
                'publisher': {
                    '@type': 'NewsMediaOrganization',
                    'name': 'The Hear',
                    'url': baseUrl,
                    'logo': {
                        '@type': 'ImageObject',
                        'url': image
                    }
                },
                'genre': locale === 'heb' ? 'ניתוח חדשות' : 'News Analysis',
                'about': locale === 'heb' ? 'ניתוח חדשות גלובלי' : 'Global news analysis',
                'inLanguage': locale === 'heb' ? 'he' : 'en'
            });
        }
    }

    // Create breadcrumb navigation
    const breadcrumbList = {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': baseUrl
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': locale === 'heb' ? 'סקירה גלובלית' : 'Global Overview',
                'item': url
            }
        ]
    };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                'name': title,
                'description': description,
                'url': url,
                'image': image,
                'dateModified': new Date().toISOString(),
                'publisher': {
                    '@type': 'NewsMediaOrganization',
                    'name': 'The Hear AI overviews',
                    'url': baseUrl,
                    'logo': {
                        '@type': 'ImageObject',
                        'url': image
                    }
                },
                'mainEntity': {
                    '@type': 'ItemList',
                    'name': locale === 'heb' ? 'כותרות גלובליות' : 'Global Headlines',
                    'description': description,
                    'numberOfItems': abstracts.length,
                    'itemListElement': abstracts.map((abstract, index) => ({
                        '@type': 'ListItem',
                        'position': index + 1,
                        'item': abstract
                    }))
                },
                'breadcrumb': {
                    '@id': `${url}#breadcrumb`
                }
            },
            breadcrumbList
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(jsonLd, null, 2),
            }}
        />
    );
}
