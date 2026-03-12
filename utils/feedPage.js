import {
    getCountryDailySummary,
    getCountryDayHeadlines,
    getCountryDayHeadlinesFromMetadata,
    getCountryDaySummaries
} from "@/utils/database/countryData";
import { fetchDailySnapshot } from "@/utils/database/fetchDailySnapshot";
import { filterToStrictDay } from "@/utils/database/filterDayData";
import { getHeadline, getSummaryContent } from "@/utils/daily summary utils";
import { getCountryLaunchDate } from "@/utils/launchDates";
import { countries } from "@/utils/sources/countries";
import { getSourceData, getWebsiteName } from "@/utils/sources/getCountryData";
import { format, isValid, parse, startOfDay, sub } from "date-fns";

export const FEED_REVALIDATE_SECONDS = 604800;

const TITLE_MAX_CHARS = 72;
const TITLE_SUFFIX = " | The Hear";
const HEBREW_ARCHIVE_SUFFIX = " | \u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05DB\u05D5\u05EA\u05E8\u05D5\u05EA";

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

function serialize(value) {
    return JSON.parse(JSON.stringify(value));
}

function truncateText(text, maxLength = 120) {
    const normalized = (text || "").replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength - 3).trim()}...`;
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

function buildArchiveInsights({ headlines = [], initialSummaries = [], country }) {
    if (!headlines.length) {
        return {
            headlineCount: 0,
            summaryCount: initialSummaries.length,
            sourceCount: 0,
            topSources: [],
            firstHeadline: null,
            lastHeadline: null
        };
    }

    const chronologicalHeadlines = [...headlines].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    const sourceCounts = new Map();

    chronologicalHeadlines.forEach((headline) => {
        const sourceName = getHeadlineSourceName(country, headline);
        if (!sourceName) return;
        sourceCounts.set(sourceName, (sourceCounts.get(sourceName) || 0) + 1);
    });

    const topSources = [...sourceCounts.entries()]
        .sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1];
            return a[0].localeCompare(b[0]);
        })
        .slice(0, 3)
        .map(([sourceName]) => sourceName);

    const firstHeadline = chronologicalHeadlines[0];
    const lastHeadline = chronologicalHeadlines[chronologicalHeadlines.length - 1];

    return {
        headlineCount: chronologicalHeadlines.length,
        summaryCount: initialSummaries.length,
        sourceCount: sourceCounts.size,
        topSources,
        firstHeadline: firstHeadline ? {
            headline: truncateText(firstHeadline.headline, 140),
            sourceName: getHeadlineSourceName(country, firstHeadline),
            timestamp: firstHeadline.timestamp || null
        } : null,
        lastHeadline: lastHeadline ? {
            headline: truncateText(lastHeadline.headline, 140),
            sourceName: getHeadlineSourceName(country, lastHeadline),
            timestamp: lastHeadline.timestamp || null
        } : null
    };
}

function normalizeFeedDailySummary(summary) {
    if (!summary) return null;

    const normalized = {
        date: summary.date || null,
        headline: getHeadline(summary, "en"),
        summaryEnglish: getSummaryContent(summary, "en")
    };

    const hebrewHeadline = getHeadline(summary, "heb");
    const hebrewSummary = getSummaryContent(summary, "heb");

    if (hebrewHeadline) {
        normalized.headlineHebrew = hebrewHeadline;
    }

    if (hebrewSummary) {
        normalized.summaryHebrew = hebrewSummary;
    }

    return normalized;
}

function normalizeFeedSummary(summary, locale) {
    if (!summary) return null;

    const normalized = {
        id: summary.id || null,
        summary: summary.summary || null,
        timestamp: summary.timestamp || null
    };

    if (summary.englishHeadline) {
        normalized.englishHeadline = summary.englishHeadline;
    }

    if (locale !== "en" && summary.hebrewHeadline) {
        normalized.hebrewHeadline = summary.hebrewHeadline;
    }

    if (locale !== "en" && summary.hebrewSummary) {
        normalized.hebrewSummary = summary.hebrewSummary;
    }

    if (summary.headline) {
        normalized.headline = summary.headline;
    }

    return normalized;
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
        ? `${currentHeadline ? `${currentHeadline}. ` : ""}\u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05DB\u05D5\u05EA\u05E8\u05D5\u05EA \u05DE-${countryName} \u05DC-${formattedDate}${headlineCount ? `, \u05E2\u05DD ${headlineCount} \u05DB\u05D5\u05EA\u05E8\u05D5\u05EA` : ""}${sourceCount ? ` \u05DE-${sourceCount} \u05DE\u05E7\u05D5\u05E8\u05D5\u05EA` : ""}${topSources ? `. \u05DE\u05E7\u05D5\u05E8\u05D5\u05EA \u05D1\u05D5\u05DC\u05D8\u05D9\u05DD: ${topSources}` : ""}.`
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

export async function getFeedPageData({ locale, country, date }) {
    const parsedDate = parse(date, "dd-MM-yyyy", new Date(2000, 0, 1));
    const isValidRequestedDate = isValid(parsedDate) && format(parsedDate, "dd-MM-yyyy") === date;
    if (!isValidRequestedDate) {
        return { redirect: `/${locale}/${country}` };
    }

    const requestedDay = startOfDay(parsedDate);
    const today = startOfDay(new Date());
    if (requestedDay >= today) {
        return { redirect: `/${locale}/${country}` };
    }

    const launchDate = getCountryLaunchDate(country);
    if (launchDate && requestedDay < startOfDay(launchDate)) {
        return { redirect: `/${locale}/${country}` };
    }

    parsedDate.setHours(12, 0, 0, 0);

    const yesterday = sub(parsedDate, { days: 1 });
    const tomorrow = new Date(parsedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [yesterdayData, todayJsonData, tomorrowData] = await Promise.all([
        fetchDailySnapshot(country, yesterday),
        fetchDailySnapshot(country, parsedDate),
        fetchDailySnapshot(country, tomorrow)
    ]);

    let data = todayJsonData;
    if (!data) {
        const headlines = await getCountryDayHeadlines(country, parsedDate, 1);
        const summaries = await getCountryDaySummaries(country, parsedDate, 1);
        const dailySummary = await getCountryDailySummary(country, parsedDate);
        data = { headlines, summaries, dailySummary };
    }

    if (yesterdayData) {
        data.headlines = [...(data.headlines || []), ...(yesterdayData.headlines || [])];
        data.summaries = [...(data.summaries || []), ...(yesterdayData.summaries || [])];
    }

    if (tomorrowData) {
        data.headlines = [...(data.headlines || []), ...(tomorrowData.headlines || [])];
        data.summaries = [...(data.summaries || []), ...(tomorrowData.summaries || [])];
    } else {
        const tomorrowHeadlines = await getCountryDayHeadlinesFromMetadata(country, tomorrow);
        if (tomorrowHeadlines) {
            data.headlines = [...(data.headlines || []), ...tomorrowHeadlines];
            const tomorrowSummaries = await getCountryDaySummaries(country, tomorrow, 1);
            if (tomorrowSummaries.length > 0) {
                data.summaries = [...(data.summaries || []), ...tomorrowSummaries];
            }
        } else {
            const tomorrowHeadlinesFirestore = await getCountryDayHeadlines(country, tomorrow, 1);
            const tomorrowSummariesFirestore = await getCountryDaySummaries(country, tomorrow, 1);
            if (tomorrowHeadlinesFirestore.length > 0 || tomorrowSummariesFirestore.length > 0) {
                data.headlines = [...(data.headlines || []), ...tomorrowHeadlinesFirestore];
                data.summaries = [...(data.summaries || []), ...tomorrowSummariesFirestore];
            }
        }
    }

    const { headlines, initialSummaries } = filterToStrictDay(data, parsedDate);
    const daySummary = normalizeFeedDailySummary(data.dailySummary);
    const normalizedSummaries = initialSummaries
        .map((summary) => normalizeFeedSummary(summary, locale))
        .filter(Boolean);
    const archiveInsights = buildArchiveInsights({
        headlines,
        initialSummaries: normalizedSummaries,
        country
    });

    return serialize({
        locale,
        country,
        date,
        parsedDate: parsedDate.toISOString(),
        headlines,
        initialSummaries: normalizedSummaries,
        daySummary,
        archiveInsights,
        countryTimezone: data.metadata?.timezone || null
    });
}
