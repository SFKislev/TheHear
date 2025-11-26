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
    const url = `https://www.thehear.org/${locale}/global`;
    
    // Create description for global overview page
    const description = locale === 'heb'
        ? `סקירה גלובלית של כותרות העיתונים מכל העולם; דוכן חדשות בין־לאומי המעדכן בזמן אמת.`
        : `Global overview of live headlines from around the world; an international newsstand updating in real time.`;
    
    const image = 'https://www.thehear.org/logo192.png';
    const title = locale === 'heb'
        ? `🌍 סקירה גלובלית | The Hear`
        : `🌍 Global Overview | The news as they evolve | The Hear`;
    
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
                        '@type': 'NewsArticle',
                        'headline': headlineContent.trim(),
                        'abstract': summaryContent ? summaryContent.trim() : '',
                        'datePublished': summary.timestamp ? new Date(summary.timestamp).toISOString() : new Date().toISOString(),
                        'publisher': {
                            '@type': 'NewsMediaOrganization',
                            'name': 'The Hear',
                            'url': 'https://www.thehear.org'
                        },
                        'about': `Live news from ${countryName}`,
                        'url': `https://www.thehear.org/${locale}/${country}`
                    });
                }
            }
        });
    }

    // Add global overview as main abstract
    if (globalOverview) {
        const overviewData = locale === 'heb' ? globalOverview.hebrew : globalOverview.english;
        if (overviewData && overviewData.overview && overviewData.headline) {
            abstracts.unshift({
                '@type': 'CreativeWork',
                'name': overviewData.headline.trim(),
                'abstract': overviewData.overview.trim(),
                'dateCreated': globalOverview.timestamp ? new Date(globalOverview.timestamp).toISOString() : new Date().toISOString(),
                'creator': {
                    '@type': 'NewsMediaOrganization',
                    'name': 'The Hear AI Global Overviews'
                },
                'about': locale === 'heb' ? 'ניתוח חדשות גלובלי' : 'Global news analysis'
            });
        }
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': title,
        'description': description,
        'url': url,
        'image': image,
        'dateModified': new Date().toISOString(),
        'publisher': {
            '@type': 'NewsMediaOrganization',
            'name': 'The Hear AI overviews',
            'url': 'https://www.thehear.org',
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
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {
                    '@type': 'ListItem',
                    'position': 1,
                    'name': 'Home',
                    'item': 'https://www.thehear.org'
                },
                {
                    '@type': 'ListItem',
                    'position': 2,
                    'name': locale === 'heb' ? 'סקירה גלובלית' : 'Global Overview',
                    'item': url
                }
            ]
        }
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