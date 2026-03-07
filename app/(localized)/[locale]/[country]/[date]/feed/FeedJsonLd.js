import { getHeadline, getSummaryContent } from "@/utils/daily summary utils";
import { countries } from "@/utils/sources/countries";
import { format } from "date-fns";

const countryFlags = {
    israel: "ðŸ‡®ðŸ‡±",
    china: "ðŸ‡¨ðŸ‡³",
    finland: "ðŸ‡«ðŸ‡®",
    france: "ðŸ‡«ðŸ‡·",
    germany: "ðŸ‡©ðŸ‡ª",
    india: "ðŸ‡®ðŸ‡³",
    iran: "ðŸ‡®ðŸ‡·",
    italy: "ðŸ‡®ðŸ‡¹",
    japan: "ðŸ‡¯ðŸ‡µ",
    lebanon: "ðŸ‡±ðŸ‡§",
    netherlands: "ðŸ‡³ðŸ‡±",
    palestine: "ðŸ‡µðŸ‡¸",
    poland: "ðŸ‡µðŸ‡±",
    russia: "ðŸ‡·ðŸ‡º",
    spain: "ðŸ‡ªðŸ‡¸",
    turkey: "ðŸ‡¹ðŸ‡·",
    uk: "ðŸ‡¬ðŸ‡§",
    us: "ðŸ‡ºðŸ‡¸",
    ukraine: "ðŸ‡ºðŸ‡¦",
    uae: "ðŸ‡¦ðŸ‡ª"
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
    const separator = ": ";
    const prefix = `${cleanCountry}, ${hebrewDate}`;

    let useArchiveSuffix = true;

    const compose = () =>
        `${prefix}${cleanHeadline ? `${separator}${cleanHeadline}` : ""}${useArchiveSuffix ? HEBREW_ARCHIVE_SUFFIX : ""}`.trim();

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

function stripHtmlBreaks(text) {
    return (text || "")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function buildDatedHeadline(dateValue, timezone, headline) {
    if (!headline) return "";

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        month: "short",
        day: "numeric",
        year: "numeric"
    }).formatToParts(dateValue);

    const month = parts.find((part) => part.type === "month")?.value || "";
    const day = parts.find((part) => part.type === "day")?.value || "";
    const year = parts.find((part) => part.type === "year")?.value || "";

    return `${month} ${day} ${year} - ${headline}`.trim();
}

export default function FeedJsonLd({ country, locale, date, daySummary, headlines, initialSummaries = [] }) {
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
    const totalHeadlines = headlines?.length || 0;
    const pageDateIso = dateValue.toISOString();
    const pageDescription = locale === "heb"
        ? `ארכיון מלא של כותרות חדשות מ-${countryName} ל-${formattedDateDisplay}, כולל סקירת יום וסיכומי התפתחות שוטפים לאורך היום.`
        : `Complete chronological archive of news headlines from ${countryName} for ${formattedDateDisplay}, including a daily overview and ongoing AI-written summaries as the story evolved.`;
    const publisher = buildPublisher();
    const dailySummaryText = stripHtmlBreaks(daySummary ? getSummaryContent(daySummary, locale) : "");
    const datedHeadline = buildDatedHeadline(dateValue, timezone, dailyHeadline) || seoTitle;
    const ongoingSummaries = initialSummaries
        .filter((summary) => summary && (summary.englishHeadline || summary.hebrewHeadline || summary.headline))
        .map((summary, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "AnalysisNewsArticle",
                headline: locale === "heb"
                    ? (summary.hebrewHeadline || summary.headline || summary.englishHeadline)
                    : (summary.englishHeadline || summary.headline || summary.hebrewHeadline),
                datePublished: summary.timestamp
            }
        }));

    const collectionPage = {
        "@type": "CollectionPage",
        url: pageUrl,
        name: seoTitle,
        headline: datedHeadline,
        description: pageDescription,
        inLanguage: locale === "heb" ? "he" : "en",
        datePublished: pageDateIso,
        dateModified: pageDateIso,
        publisher,
        mainEntityOfPage: {
            "@type": "ItemList",
            name: `${countryName} headline timeline`,
            numberOfItems: totalHeadlines
        },
        about: {
            "@type": "Thing",
            name: `${countryName} News Archive`,
            description: `Historical news archive from ${countryName} for ${formattedDateDisplay}`
        },
        isPartOf: {
            "@type": "CreativeWorkSeries",
            name: `${countryName} News Archive`,
            url: `https://www.thehear.org/${locale}/${country}/history`
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

    if (dailySummaryText && dailyHeadline) {
        collectionPage.mainEntity = {
            "@type": "AnalysisNewsArticle",
            headline: datedHeadline,
            description: dailySummaryText,
            datePublished: pageDateIso,
            inLanguage: locale === "heb" ? "he" : "en",
            author: {
                "@type": "Organization",
                name: "The Hear AI Analysis",
                url: "https://www.thehear.org"
            },
            publisher,
            about: {
                "@type": "Thing",
                name: `Daily news summary for ${countryName}`
            }
        };
    }

    if (ongoingSummaries.length > 0) {
        collectionPage.hasPart = {
            "@type": "ItemList",
            name: locale === "heb"
                ? `סיכומי התפתחות שוטפים עבור ${countryName} בתאריך ${formattedDateDisplay}`
                : `Ongoing AI overviews for ${countryName} headlines on ${englishDate}`,
            numberOfItems: ongoingSummaries.length,
            itemListElement: ongoingSummaries
        };
    }

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
