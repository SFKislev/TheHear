import { getCountryDailySummary, getCountryDayHeadlines, getCountryDaySummaries, getCountryDayHeadlinesFromMetadata } from "@/utils/database/countryData";
import { fetchDailySnapshot } from "@/utils/database/fetchDailySnapshot";
import { sub } from "date-fns";
import { countries } from "@/utils/sources/countries";
import CountryPageContent from "./CountryPage_content";
import { getWebsiteName } from "@/utils/sources/getCountryData";
import { createMetadata, LdJson } from "./metadata";
import ArchiveLinksData from "./TopBar/settings/ArchiveLinksData";
import CountryLinksData from "./TopBar/CountryLinksData";
import DateLinksData from "./TopBar/DateLinksData";
import CountryFonts from "@/components/CountryFonts";
import { isHebrewContentAvailable } from "@/utils/daily summary utils";
import { redirect } from "next/navigation";

export const revalidate = 900 // 15 minutes
export const dynamicParams = false

export async function generateStaticParams() {
    const countryNames = Object.keys(countries);

    const routes = countryNames.flatMap(country => [
        { country, locale: 'en' },
        { country, locale: 'heb' }
    ]);
    return routes;
}

export async function generateMetadata({ params }) {
    return createMetadata(params);
}

export default async function Page({ params }) {
    const { country, locale } = await params;
    // Avoid request-bound headers to keep this route ISR-friendly.
    const userCountry = null;

    const today = new Date();
    const yesterday = sub(today, { days: 1 });

    // Get yesterday's data from JSON (fast & cheap)
    const yesterdayData = await fetchDailySnapshot(country, yesterday);
    const yesterdaySummary = yesterdayData?.dailySummary ?? (yesterdayData ? null : await getCountryDailySummary(country, yesterday));

    // Get today's headlines - try metadata first (1-2 reads), fallback to collection (200+ reads)
    // Fetch both today and yesterday metadata to handle timezone spillover
    const [todayMetadata, yesterdayMetadata] = await Promise.all([
        getCountryDayHeadlinesFromMetadata(country, today),
        getCountryDayHeadlinesFromMetadata(country, yesterday)
    ]);

    let headlines = [];

    if (todayMetadata || yesterdayMetadata) {
        // Merge today's and yesterday's metadata for complete timezone coverage
        headlines = [
            ...(todayMetadata || []),
            ...(yesterdayMetadata || [])
        ];
    } else {
        // Fallback to collection if no metadata available
        headlines = await getCountryDayHeadlines(country, today, 1);
    }

    // Get today's summaries from Firestore
    const initialSummaries = await getCountryDaySummaries(country, today, 1);

    // Merge yesterday's data from JSON snapshot (with deduplication to avoid overlap with metadata)
    if (yesterdayData?.headlines) {
        const existingIds = new Set(headlines.map(h => h.id));
        const uniqueYesterdayHeadlines = yesterdayData.headlines.filter(h => !existingIds.has(h.id));
        headlines.push(...uniqueYesterdayHeadlines);
    }
    if (yesterdayData?.summaries) {
        const existingIds = new Set(initialSummaries.map(s => s.id));
        const uniqueYesterdaySummaries = yesterdayData.summaries.filter(s => !existingIds.has(s.id));
        initialSummaries.push(...uniqueYesterdaySummaries);
    }

    // Check if Hebrew content is available for Hebrew locale
    if (locale === 'heb') {
        const hasHebrewContent = initialSummaries.some(summary => isHebrewContentAvailable(summary)) ||
            (yesterdaySummary && isHebrewContentAvailable(yesterdaySummary));

        // If no Hebrew content is available, redirect to English
        if (!hasHebrewContent) {
            redirect(`/en/${country}`);
        }
    }

    const sources = {};
    headlines.forEach(headline => {
        const sourceName = getWebsiteName(country, headline.website_id);
        if (!sources[sourceName]) sources[sourceName] = { headlines: [], website_id: headline.website_id };
        sources[sourceName].headlines.push(headline);
    });

    if (initialSummaries.length === 0) {
        return 'no summaries found';
    }

    const countryName = locale === 'heb' ? countries[country].hebrew || country : countries[country].english || country;

    return (
        <>
            {/* Load country-specific fonts dynamically */}
            <CountryFonts country={country} />

            {/* This correctly handles all your SEO needs for the entire collection */}
            <LdJson {...{ country, locale, headlines, initialSummaries, sources, yesterdaySummary }} />

            {/* Navigation links for crawlers */}
            <ArchiveLinksData locale={locale} country={country} />
            <CountryLinksData locale={locale} currentCountry={country} />
            <DateLinksData locale={locale} country={country} />

            {/* This is the interactive UI for your users */}
            <CountryPageContent
                {...{
                    sources,
                    initialSummaries,
                    yesterdaySummary,
                    locale,
                    country,
                    userCountry
                }}
            />
        </>
    );
}
