import { countries } from "@/utils/sources/countries";

function countryWithArticle(countryCode, countryName) {
    return (countryCode === "us" || countryCode === "uk") ? `the ${countryName}` : countryName;
}

export function createMetadata({ country, locale }) {
    const countryData = countries[country];
    if (!countryData) {
        return {
            title: "Country not found",
            description: "The requested country could not be found."
        };
    }

    const countryName = locale === "heb" ? countryData.hebrew : countryData.english;
    const isHebrew = locale === "heb";
    const url = `https://www.thehear.org/${locale}/${country}/history`;
    const title = isHebrew
        ? `\u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05D7\u05D3\u05E9\u05D5\u05EA ${countryName} | The Hear`
        : `${countryName} News Archive | The Hear`;
    const description = isHebrew
        ? `\u05D3\u05E3 \u05D6\u05D4 \u05DE\u05E8\u05DB\u05D6 \u05D0\u05EA \u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05D4\u05DB\u05D5\u05EA\u05E8\u05D5\u05EA \u05E9\u05DC ${countryName}, \u05E2\u05DD \u05E7\u05D9\u05E9\u05D5\u05E8\u05D9\u05DD \u05DC\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD \u05D1\u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05D5\u05DC\u05D3\u05E4\u05D9 \u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05D9\u05D5\u05DE\u05D9\u05D9\u05DD.`
        : `The Hear archives ${countryName}'s main headlines by month. Open each month to reach its daily archive pages.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: "The Hear",
            type: "website",
            locale: isHebrew ? "he_IL" : "en_US",
            images: [
                {
                    url: "https://www.thehear.org/logo192.png",
                    width: 192,
                    height: 192,
                    alt: "The Hear logo"
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["https://www.thehear.org/logo512.png"]
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true
            }
        },
        alternates: {
            canonical: url,
            languages: {
                en: `https://www.thehear.org/en/${country}/history`,
                he: `https://www.thehear.org/heb/${country}/history`,
                "x-default": `https://www.thehear.org/en/${country}/history`
            }
        }
    };
}

export function LdJson({ country, locale, featuredDays }) {
    const countryData = countries[country];
    if (!countryData) return null;

    const countryName = locale === "heb" ? countryData.hebrew : countryData.english;
    const isHebrew = locale === "heb";
    const url = `https://www.thehear.org/${locale}/${country}/history`;
    const title = isHebrew
        ? `\u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05D7\u05D3\u05E9\u05D5\u05EA ${countryName} | The Hear`
        : `${countryName} News Archive | The Hear`;
    const description = isHebrew
        ? `\u05D3\u05E3 \u05D6\u05D4 \u05DE\u05E8\u05DB\u05D6 \u05D0\u05EA \u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05D4\u05DB\u05D5\u05EA\u05E8\u05D5\u05EA \u05E9\u05DC ${countryName}, \u05E2\u05DD \u05E7\u05D9\u05E9\u05D5\u05E8\u05D9\u05DD \u05DC\u05D7\u05D5\u05D3\u05E9\u05D9\u05DD \u05D1\u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05D5\u05DC\u05D3\u05E4\u05D9 \u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05D9\u05D5\u05DE\u05D9\u05D9\u05DD.`
        : `The Hear archives ${countryName}'s main headlines by month. Open each month to reach its daily archive pages.`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": url,
                name: title,
                description,
                url,
                inLanguage: isHebrew ? "he" : "en",
                publisher: {
                    "@type": "NewsMediaOrganization",
                    name: "The Hear",
                    logo: {
                        "@type": "ImageObject",
                        url: "https://www.thehear.org/logo192.png"
                    },
                    url: "https://www.thehear.org"
                },
                about: {
                    "@type": "Thing",
                    name: `${countryName} News Archive`,
                    description: `Historical archive hub for ${countryName}`
                },
                breadcrumb: {
                    "@type": "BreadcrumbList",
                    itemListElement: [
                        {
                            "@type": "ListItem",
                            position: 1,
                            name: "The Hear",
                            item: "https://www.thehear.org"
                        },
                        {
                            "@type": "ListItem",
                            position: 2,
                            name: countryName,
                            item: `https://www.thehear.org/${locale}/${country}`
                        },
                        {
                            "@type": "ListItem",
                            position: 3,
                            name: isHebrew ? "\u05D0\u05E8\u05DB\u05D9\u05D5\u05DF" : "Archive",
                            item: url
                        }
                    ]
                }
            }
        ]
    };

    return (
        <script
            id={`jsonld-country-history-${country}-${locale}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
