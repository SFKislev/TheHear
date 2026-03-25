import { add, format, isValid, parse, startOfDay, sub } from "date-fns";
import { fetchDailySnapshot } from "@/utils/database/fetchDailySnapshot";
import { getCountryDayHeadlines, getCountryDayHeadlinesFromMetadata } from "@/utils/database/countryData";
import { getWebsiteName } from "@/utils/sources/getCountryData";
import { getMixSourceDescriptor, getSelectionKey } from "@/utils/mix/config";

function enrichHeadline(country, headline) {
    return {
        ...headline,
        id: `${country}:${headline.id}`,
        sourceCountry: country,
        sourceKey: getWebsiteName(country, headline.website_id),
    };
}

function mergeHeadlines(items) {
    const deduped = new Map();

    for (const item of items) {
        if (!item?.id) continue;
        deduped.set(item.id, item);
    }

    return Array.from(deduped.values()).sort((a, b) => b.timestamp - a.timestamp);
}

async function getLiveCountryHeadlines(country) {
    const today = new Date();
    const yesterday = sub(today, { days: 1 });

    const [todayMetadata, yesterdayMetadata, yesterdaySnapshot] = await Promise.all([
        getCountryDayHeadlinesFromMetadata(country, today),
        getCountryDayHeadlinesFromMetadata(country, yesterday),
        fetchDailySnapshot(country, yesterday),
    ]);

    let headlines = [];

    if (todayMetadata || yesterdayMetadata) {
        headlines = [...(todayMetadata || []), ...(yesterdayMetadata || [])];
    } else {
        headlines = await getCountryDayHeadlines(country, today, 1);
    }

    if (yesterdaySnapshot?.headlines) {
        headlines = mergeHeadlines([
            ...headlines.map((headline) => enrichHeadline(country, headline)),
            ...yesterdaySnapshot.headlines.map((headline) => enrichHeadline(country, headline)),
        ]);
    } else {
        headlines = headlines.map((headline) => enrichHeadline(country, headline));
    }

    return headlines;
}

async function getDateCountryHeadlines(country, pageDate) {
    const previousDay = sub(pageDate, { days: 1 });
    const nextDay = add(pageDate, { days: 1 });

    const [previousSnapshot, currentSnapshot, nextSnapshot] = await Promise.all([
        fetchDailySnapshot(country, previousDay),
        fetchDailySnapshot(country, pageDate),
        fetchDailySnapshot(country, nextDay),
    ]);

    let headlines = [
        ...(previousSnapshot?.headlines || []),
        ...(currentSnapshot?.headlines || []),
        ...(nextSnapshot?.headlines || []),
    ];

    if (!currentSnapshot) {
        const [currentMetadata, nextMetadata] = await Promise.all([
            getCountryDayHeadlinesFromMetadata(country, pageDate),
            getCountryDayHeadlinesFromMetadata(country, nextDay),
        ]);

        if (currentMetadata?.length || nextMetadata?.length) {
            headlines = [...headlines, ...(currentMetadata || []), ...(nextMetadata || [])];
        } else {
            const [currentFirestore, nextFirestore] = await Promise.all([
                getCountryDayHeadlines(country, pageDate, 1),
                getCountryDayHeadlines(country, nextDay, 1),
            ]);
            headlines = [...headlines, ...currentFirestore, ...nextFirestore];
        }
    }

    return mergeHeadlines(headlines.map((headline) => enrichHeadline(country, headline)));
}

export async function getMixInitialSources(selections, pageDate) {
    const normalizedSelections = selections || [];
    const countryNames = [...new Set(normalizedSelections.map(({ country }) => country))];

    const countryHeadlineEntries = await Promise.all(
        countryNames.map(async (country) => {
            const headlines = pageDate
                ? await getDateCountryHeadlines(country, pageDate)
                : await getLiveCountryHeadlines(country);

            return [country, headlines];
        })
    );

    const headlinesByCountry = Object.fromEntries(countryHeadlineEntries);
    const sources = {};

    for (const selection of normalizedSelections) {
        const descriptor = getMixSourceDescriptor(selection.country, selection.source);
        if (!descriptor) continue;

        const key = getSelectionKey(selection);
        const headlines = (headlinesByCountry[selection.country] || [])
            .filter((headline) => headline.sourceKey === selection.source)
            .sort((a, b) => b.timestamp - a.timestamp);

        sources[key] = {
            ...descriptor,
            headlines,
        };
    }

    return sources;
}

export function parseMixDateParam(dateParam) {
    const parsed = parse(dateParam, "dd-MM-yyyy", new Date(2000, 0, 1));
    if (!isValid(parsed) || format(parsed, "dd-MM-yyyy") !== dateParam) {
        return null;
    }

    const requestedDay = startOfDay(parsed);
    const today = startOfDay(new Date());
    if (requestedDay >= today) {
        return null;
    }

    const pageDate = new Date(parsed);
    pageDate.setHours(12, 0, 0, 0);
    return pageDate;
}
