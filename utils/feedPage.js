import { getCountryDailySummary, getCountryDayHeadlines, getCountryDayHeadlinesFromMetadata, getCountryDaySummaries } from "@/utils/database/countryData";
import { fetchDailySnapshot } from "@/utils/database/fetchDailySnapshot";
import { filterToStrictDay } from "@/utils/database/filterDayData";
import { getHeadline } from "@/utils/daily summary utils";
import { getSummaryContent } from "@/utils/daily summary utils";
import { getCountryLaunchDate } from "@/utils/launchDates";
import { countries } from "@/utils/sources/countries";
import { format, isValid, parse, startOfDay, sub } from "date-fns";

export const FEED_REVALIDATE_SECONDS = 604800;

const TITLE_MAX_CHARS = 72;
const TITLE_SUFFIX = " | The Hear";
const HEBREW_ARCHIVE_SUFFIX = " | ארכיון כותרות";

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

export function buildFeedMetadata({ locale, country, date, daySummary }) {
    const countryData = countries[country] || {};
    const countryName = locale === "heb" ? countryData.hebrew || country : countryData.english || country;
    const flagEmoji = {
        israel: "🇮🇱",
        china: "🇨🇳",
        finland: "🇫🇮",
        france: "🇫🇷",
        germany: "🇩🇪",
        india: "🇮🇳",
        iran: "🇮🇷",
        italy: "🇮🇹",
        japan: "🇯🇵",
        lebanon: "🇱🇧",
        netherlands: "🇳🇱",
        palestine: "🇵🇸",
        poland: "🇵🇱",
        russia: "🇷🇺",
        spain: "🇪🇸",
        turkey: "🇹🇷",
        uk: "🇬🇧",
        us: "🇺🇸",
        ukraine: "🇺🇦",
        uae: "🇦🇪"
    }[country] || "";

    const parsedDate = parse(date, "dd-MM-yyyy", new Date(2000, 0, 1));
    parsedDate.setHours(12, 0, 0, 0);

    if (Number.isNaN(parsedDate.getTime())) {
        return {
            title: "The Hear - News Headlines",
            description: "Real-time news headlines and AI-powered analysis",
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
    const description = locale === "heb"
        ? `${currentHeadline ? `${currentHeadline}. ` : ""}ארכיון מלא של כותרות חדשות מ-${countryName} ל-${formattedDate} - כל הכותרות כפי שהתפתחו במהלך היום עם סיכומי בינה מלאכותית בזמן אמת`
        : `An archive of news headlines from ${countryInDescription} for ${formattedDate}; ${currentHeadline ? `${currentHeadline}. ` : ""}All headlines as they unfolded throughout the day, with real-time AI overviews`;
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

    return serialize({
        locale,
        country,
        date,
        parsedDate: parsedDate.toISOString(),
        headlines,
        initialSummaries: normalizedSummaries,
        daySummary,
        countryTimezone: data.metadata?.timezone || null
    });
}
