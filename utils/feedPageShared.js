import { getHeadline } from "@/utils/daily summary utils";
import { countries } from "@/utils/sources/countries";
import { format, parse } from "date-fns";

export const FEED_REVALIDATE_SECONDS = 604800;

const TITLE_MAX_CHARS = 72;
const TITLE_SUFFIX = " | The Hear";
const HEBREW_ARCHIVE_SUFFIX = " | ארכיון כותרות";

const COUNTRY_FLAGS = {
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
    const prefix = `${cleanCountry}, ${cleanDate}`;

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

export function getFeedUrl(locale, country, date) {
    return `https://www.thehear.org/${locale}/${country}/${date}/feed`;
}

export function buildFeedMetadata({ locale, country, date, daySummary, archiveInsights }) {
    const countryData = countries[country] || {};
    const countryName = locale === "heb" ? countryData.hebrew || country : countryData.english || country;
    const flagEmoji = COUNTRY_FLAGS[country] || "";

    const parsedDate = parse(date, "dd-MM-yyyy", new Date(2000, 0, 1));
    parsedDate.setHours(12, 0, 0, 0);

    if (Number.isNaN(parsedDate.getTime())) {
        return {
            title: "The Hear - News Headlines",
            description: "News headline archive",
            robots: { index: false, follow: false }
        };
    }

    const currentHeadline = daySummary ? getHeadline(daySummary, locale) : null;
    const englishDate = format(parsedDate, "d MMM yyyy");
    const hebrewDate = new Intl.DateTimeFormat("he-IL", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(parsedDate);
    const titlePrefix = `${countryName} headlines, ${englishDate}`;
    const title = locale === "heb"
        ? buildHebrewSeoTitle({ countryName, hebrewDate, headline: currentHeadline })
        : buildSeoTitle({ flagEmoji, corePrefix: titlePrefix, headline: currentHeadline });
    const formattedDate = date.replace(/-/g, ".");
    const countryInDescription = (country === "us" || country === "uk") ? `the ${countryName}` : countryName;
    const headlineCount = archiveInsights?.headlineCount || 0;
    const sourceCount = archiveInsights?.sourceCount || 0;
    const topSources = archiveInsights?.topSources?.length ? archiveInsights.topSources.join(", ") : "";
    const description = locale === "heb"
        ? `${currentHeadline ? `${currentHeadline}. ` : ""}ארכיון כותרות מ-${countryName} ל-${formattedDate}${headlineCount ? `, עם ${headlineCount} כותרות` : ""}${sourceCount ? ` מ-${sourceCount} מקורות` : ""}${topSources ? `. מקורות בולטים: ${topSources}` : ""}.`
        : `Archive of ${headlineCount || "daily"} headlines from ${countryInDescription} for ${formattedDate}${sourceCount ? ` across ${sourceCount} sources` : ""}${topSources ? `, including ${topSources}` : ""}.${currentHeadline ? ` Lead story: ${currentHeadline}.` : ""}`;
    const url = getFeedUrl(locale, country, date);

    return {
        title,
        description,
        url,
        locale,
        country,
        parsedDate
    };
}
