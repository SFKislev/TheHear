import { getHeadline } from "@/utils/daily summary utils";
import { countries } from "@/utils/sources/countries";
import { getSourceData, getWebsiteName } from "@/utils/sources/getCountryData";
import { format } from "date-fns";

const countryFlags = {
    israel: "\uD83C\uDDEE\uD83C\uDDF1",
    china: "\uD83C\uDDE8\uD83C\uDDF3",
    finland: "\uD83C\uDDEB\uD83C\uDDEE",
    france: "\uD83C\uDDEB\uD83C\uDDF7",
    germany: "\uD83C\uDDE9\uD83C\uDDEA",
    india: "\uD83C\uDDEE\uD83C\uDDF3",
    iran: "\uD83C\uDDEE\uD83C\uDDF7",
    italy: "\uD83C\uDDEE\uD83C\uDDF9",
    japan: "\uD83C\uDDEF\uD83C\uDDF5",
    lebanon: "\uD83C\uDDF1\uD83C\uDDE7",
    netherlands: "\uD83C\uDDF3\uD83C\uDDF1",
    palestine: "\uD83C\uDDF5\uD83C\uDDF8",
    poland: "\uD83C\uDDF5\uD83C\uDDF1",
    russia: "\uD83C\uDDF7\uD83C\uDDFA",
    spain: "\uD83C\uDDEA\uD83C\uDDF8",
    turkey: "\uD83C\uDDF9\uD83C\uDDF7",
    uk: "\uD83C\uDDEC\uD83C\uDDE7",
    us: "\uD83C\uDDFA\uD83C\uDDF8",
    ukraine: "\uD83C\uDDFA\uD83C\uDDE6",
    uae: "\uD83C\uDDE6\uD83C\uDDEA"
};

const TITLE_MAX_CHARS = 72;
const TITLE_SUFFIX = " | The Hear";
const HEBREW_ARCHIVE_SUFFIX = " | \u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05DB\u05D5\u05EA\u05E8\u05D5\u05EA";

function buildSeoTitle({ flagEmoji, corePrefix, headline }) {
    const cleanFlag = (flagEmoji || "").trim();
    const cleanPrefix = (corePrefix || "").replace(/\s+/g, " ").trim();
    const cleanHeadline = (headline || "").replace(/\s+/g, " ").trim();
    const separator = ": ";

    let useSuffix = true;
    let useFlag = !!cleanFlag;

    const getPrefix = () => (useFlag ? `${cleanFlag} ${cleanPrefix}` : cleanPrefix);
    const compose = () =>
        `${getPrefix()}${cleanHeadline ? `${separator}${cleanHeadline}` : ""}${useSuffix ? TITLE_SUFFIX : ""}`.trim();

    let candidate = compose();
    if (candidate.length <= TITLE_MAX_CHARS) return candidate;

    useSuffix = false;
    candidate = compose();
    if (candidate.length <= TITLE_MAX_CHARS) return candidate;

    useFlag = false;
    candidate = compose();
    if (candidate.length <= TITLE_MAX_CHARS) return candidate;

    return candidate;
}

function buildHebrewSeoTitle({ countryName, hebrewDate, headline }) {
    const cleanCountry = (countryName || "").replace(/\s+/g, " ").trim();
    const cleanDate = (hebrewDate || "").replace(/\s+/g, " ").trim();
    const cleanHeadline = (headline || "").replace(/\s+/g, " ").trim();
    const prefix = `${cleanCountry}, ${cleanDate}`;

    let useArchiveSuffix = true;

    const compose = () =>
        `${prefix}${cleanHeadline ? `: ${cleanHeadline}` : ""}${useArchiveSuffix ? HEBREW_ARCHIVE_SUFFIX : ""}`.trim();

    let candidate = compose();
    if (candidate.length <= TITLE_MAX_CHARS) return candidate;

    useArchiveSuffix = false;
    candidate = compose();
    if (candidate.length <= TITLE_MAX_CHARS) return candidate;

    return candidate;
}

function buildPublisher() {
    return {
        "@type": "NewsMediaOrganization",
        name: "The Hear",
        url: "https://www.thehear.org",
        logo: {
            "@type": "ImageObject",
            url: "https://www.thehear.org/logo192.png"
        },
        publishingPrinciples: "https://www.thehear.org/methodology",
        masthead: "https://www.thehear.org/about"
    };
}

function getHeadlineSourceName(country, headline) {
    if (!headline?.website_id) return "";

    try {
        const normalizedWebsiteId = getWebsiteName(country, headline.website_id);
        const sourceData = getSourceData(country, normalizedWebsiteId);
        return sourceData?.name || headline.website_id;
    } catch (error) {
        return headline.website_id;
    }
}

function buildHeadlineExamples(headlines, country, timezone) {
    return (headlines || [])
        .slice(0, 5)
        .map((headline, index) => {
            const headlineDate = new Date(headline.timestamp);
            const sourceName = getHeadlineSourceName(country, headline);
            const timeLabel = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).format(headlineDate);

            return {
                "@type": "ListItem",
                position: index + 1,
                item: {
                    "@type": "CreativeWork",
                    name: sourceName ? `${sourceName}: ${headline.headline}` : headline.headline,
                    datePublished: headlineDate.toISOString(),
                    description: `${timeLabel}${sourceName ? ` - ${sourceName}` : ""}`
                }
            };
        });
}

export default function FeedJsonLd({ country, locale, date, daySummary, headlines, archiveInsights }) {
    const countryData = countries[country] || {};
    const countryName = locale === "heb" ? countryData.hebrew || country : countryData.english || country;
    const flagEmoji = countryFlags[country] || "";
    const timezone = countryData.timezone || "UTC";
    const dateValue = date instanceof Date ? date : new Date(date);
    const formattedDate = typeof date === "string"
        ? date
        : `${String(dateValue.getDate()).padStart(2, "0")}-${String(dateValue.getMonth() + 1).padStart(2, "0")}-${dateValue.getFullYear()}`;
    const formattedDateDisplay = formattedDate.replace(/-/g, ".");
    const dailyHeadline = daySummary ? getHeadline(daySummary, locale) : "";
    const englishDate = format(dateValue, "d MMM yyyy");
    const hebrewDate = new Intl.DateTimeFormat("he-IL", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: timezone
    }).format(dateValue);
    const seoTitle = locale === "heb"
        ? buildHebrewSeoTitle({ countryName, hebrewDate, headline: dailyHeadline })
        : buildSeoTitle({ flagEmoji, corePrefix: `${countryName} headlines, ${englishDate}`, headline: dailyHeadline });
    const pageUrl = `https://www.thehear.org/${locale}/${country}/${formattedDate}/feed`;
    const headlineCount = archiveInsights?.headlineCount || headlines?.length || 0;
    const sourceCount = archiveInsights?.sourceCount || 0;
    const topSourcesText = archiveInsights?.topSources?.length ? archiveInsights.topSources.join(", ") : "";
    const pageDateIso = dateValue.toISOString();
    const pageDescription = locale === "heb"
        ? `\u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05DB\u05D5\u05EA\u05E8\u05D5\u05EA \u05DE-${countryName} \u05DC-${formattedDateDisplay}${headlineCount ? `, \u05E2\u05DD ${headlineCount} \u05DB\u05D5\u05EA\u05E8\u05D5\u05EA` : ""}${sourceCount ? ` \u05DE-${sourceCount} \u05DE\u05E7\u05D5\u05E8\u05D5\u05EA` : ""}${topSourcesText ? `. \u05DE\u05E7\u05D5\u05E8\u05D5\u05EA \u05D1\u05D5\u05DC\u05D8\u05D9\u05DD: ${topSourcesText}` : ""}.`
        : `Chronological archive of ${headlineCount || "daily"} headlines from ${countryName} for ${formattedDateDisplay}${sourceCount ? ` across ${sourceCount} sources` : ""}${topSourcesText ? `, including ${topSourcesText}` : ""}.`;
    const publisher = buildPublisher();

    const collectionPage = {
        "@type": "CollectionPage",
        url: pageUrl,
        name: seoTitle,
        description: pageDescription,
        inLanguage: locale === "heb" ? "he" : "en",
        datePublished: pageDateIso,
        dateModified: archiveInsights?.lastHeadline?.timestamp || pageDateIso,
        publisher,
        about: {
            "@type": "Thing",
            name: `${countryName} news archive`,
            description: `Historical headline archive from ${countryName} for ${formattedDateDisplay}`
        },
        isPartOf: {
            "@type": "CreativeWorkSeries",
            name: `${countryName} News Archive`,
            url: `https://www.thehear.org/${locale}/${country}/history`
        },
        mainEntity: {
            "@type": "ItemList",
            name: `${countryName} headline timeline`,
            numberOfItems: headlineCount,
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            itemListElement: buildHeadlineExamples(
                [...(headlines || [])]
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
                country,
                timezone
            )
        },
        breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://www.thehear.org/"
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
                    name: `${formattedDateDisplay} Feed`,
                    item: pageUrl
                }
            ]
        }
    };

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [collectionPage]
    };

    return (
        <script
            id={`jsonld-feed-${country}-${locale}-${formattedDate}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
