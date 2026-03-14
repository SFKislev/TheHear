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
import { getSourceData, getWebsiteName } from "@/utils/sources/getCountryData";
import { format, isValid, parse, startOfDay, sub } from "date-fns";

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
