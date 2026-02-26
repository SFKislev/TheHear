export function createMetadata() {
    const url = "https://www.thehear.org/legal";
    const title = "Legal | The Hear";
    const description = "Terms of Use and Privacy information for The Hear.";
    const siteName = "The Hear";

    return {
        title,
        description,
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
            },
        },
        openGraph: {
            title,
            description,
            url,
            siteName,
            type: "website",
            locale: "en_US",
            images: [
                {
                    url: "https://www.thehear.org/logo192.png",
                    width: 192,
                    height: 192,
                    alt: "The Hear logo",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["https://www.thehear.org/logo512.png"],
        },
        alternates: {
            canonical: url,
        },
    };
}

export function LdJson() {
    const url = "https://www.thehear.org/legal";

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": url,
                "name": "Legal | The Hear",
                "url": url,
                "description": "Terms of Use and Privacy information for The Hear.",
                "inLanguage": "en",
                "breadcrumb": {
                    "@id": `${url}#breadcrumb`,
                },
                "publisher": {
                    "@type": "NewsMediaOrganization",
                    "name": "The Hear",
                    "url": "https://www.thehear.org",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://www.thehear.org/logo192.png",
                    },
                },
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${url}#breadcrumb`,
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "The Hear",
                        "item": "https://www.thehear.org",
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Legal",
                        "item": url,
                    },
                ],
            },
        ],
    };

    return (
        <script
            id="jsonld-legal"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

