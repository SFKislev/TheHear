export function createMetadata() {
    const url = "https://www.thehear.org/contact";
    const title = "Contact | The Hear";
    const description = "Contact The Hear team.";

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
            siteName: "The Hear",
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
    const url = "https://www.thehear.org/contact";

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "ContactPage",
                "@id": url,
                name: "Contact | The Hear",
                url,
                description: "Contact The Hear team.",
                inLanguage: "en",
                breadcrumb: { "@id": `${url}#breadcrumb` },
                publisher: {
                    "@type": "NewsMediaOrganization",
                    name: "The Hear",
                    url: "https://www.thehear.org",
                    logo: {
                        "@type": "ImageObject",
                        url: "https://www.thehear.org/logo192.png",
                    },
                },
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${url}#breadcrumb`,
                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        name: "The Hear",
                        item: "https://www.thehear.org",
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: "Contact",
                        item: url,
                    },
                ],
            },
        ],
    };

    return (
        <script
            id="jsonld-contact"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

