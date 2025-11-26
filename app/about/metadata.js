export function createMetadata() {
    const url = 'https://www.thehear.org/about';
    const siteName = 'The Hear';
    
    const title = 'About The Hear | News Observatory & Headlines Archive';
    const description = 'The Hear is a news observatory and headlines archive. It displays main headlines from newspapers side by side in real time, creating a constantly changing newsstand that lets you monitor news as it evolves across countries and sources.';
    const keywords = 'news aggregator, headlines archive, news observatory, media landscape, journalism, news monitoring, real time news, global news, news analysis';

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
            locale: 'en_US',
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
            canonical: url
        }
    };
}

export function LdJson() {
    const url = 'https://www.thehear.org/about';
    const title = 'About The Hear | News Observatory & Headlines Archive';
    const description = 'The Hear is a news observatory and headlines archive. It displays main headlines from newspapers side by side in real time, creating a constantly changing newsstand that lets you monitor news as it evolves across countries and sources.';
    const image = 'https://www.thehear.org/logo192.png';
    
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
                'name': 'About',
                'item': url
            }
        ]
    };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'AboutPage',
                '@id': url,
                'name': title,
                'description': description,
                'url': url,
                'inLanguage': 'en',
                'datePublished': '2024-07-04T00:00:00Z',
                'dateModified': new Date().toISOString(),
                'breadcrumb': {
                    '@id': `${url}#breadcrumb`
                },
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
                    '@type': 'NewsMediaOrganization',
                    'name': 'The Hear',
                    'description': 'News observatory and headlines archive tracking main headlines from newspapers worldwide in real time',
                    'foundingDate': '2024-07-04',
                    'url': 'https://www.thehear.org',
                    'logo': {
                        '@type': 'ImageObject',
                        'url': image
                    },
                    'sameAs': [
                        'https://www.thehear.org'
                    ]
                }
            },
            breadcrumbList
        ]
    };
    
    return (
        <script 
            id="jsonld-about"
            type="application/ld+json" 
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
        />
    );
}
