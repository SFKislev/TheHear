import { getCountryDailySummary, getCountryDayHeadlines, getCountryDaySummaries, getCountryDayHeadlinesFromMetadata } from "@/utils/database/countryData";
import { fetchDailySnapshot } from "@/utils/database/fetchDailySnapshot";
import { filterToDayWithContinuity } from "@/utils/database/filterDayData";
import { isSameDay, isToday, parse, sub, differenceInDays } from "date-fns";
import CountryPageContent from "../CountryPage_content";
import { getWebsiteName } from "@/utils/sources/getCountryData";
import { redirect } from "next/navigation";
import { createMetadata, LdJson } from "./metadata";
import { countries } from "@/utils/sources/countries";
import ArchiveLinksData from "../TopBar/settings/ArchiveLinksData";
import CountryLinksData from "../TopBar/CountryLinksData";
import DateLinksData from "../TopBar/DateLinksData";
import { isHebrewContentAvailable } from "@/utils/daily summary utils";

// Archive pages are immutable historical content that never changes
// export const revalidate = 31536000; // 1 year in seconds
// export const dynamic = 'force-static'; // Ensure static generation

// Generate SEO metadata for a specific day
export async function generateMetadata({ params }) {
    try {
        const { country, locale, date } = await params;
        const metadata = await createMetadata({ country, locale, date });

        // Point canonical to feed version - that's the version that should be indexed
        const feedUrl = `https://www.thehear.org/${locale}/${country}/${date}/feed`;
        metadata.alternates = {
            ...metadata.alternates,
            canonical: feedUrl
        };

        return metadata;
    } catch (error) {
        // Don't log NEXT_REDIRECT as an error - it's expected behavior
        if (error.message !== 'NEXT_REDIRECT') {
            console.error('❌ [DATE-META] ERROR in generateMetadata:', error);
        }
        throw error;
    }
}

export default async function Page({ params }) {
    try {
        // Step 1: Params
        const { country, locale, date } = await params;

        // Step 2: Date parsing (no current date comparison for static generation)
        const parsedDate = parse(date, 'dd-MM-yyyy', new Date(2000, 0, 1));
        parsedDate.setHours(12, 0, 0, 0);

        // Skip date validation for static generation - handle redirects client-side if needed
        // Archive pages are historical and won't be "today" after they're built
        if (isNaN(parsedDate.getTime())) {
            redirect(`/${locale}/${country}`);
        }

        // Per-country launch dates - reject requests for dates before data exists
        const countryLaunchDates = {
            'israel': new Date('2024-07-04'),
            'germany': new Date('2024-07-28'),
            'us': new Date('2024-07-31'),
            'italy': new Date('2024-08-28'),
            'russia': new Date('2024-08-29'),
            'iran': new Date('2024-08-29'),
            'france': new Date('2024-08-29'),
            'lebanon': new Date('2024-08-29'),
            'poland': new Date('2024-08-30'),
            'uk': new Date('2024-09-05'),
            'india': new Date('2024-09-05'),
            'ukraine': new Date('2024-09-05'),
            'spain': new Date('2024-09-05'),
            'netherlands': new Date('2024-09-05'),
            'china': new Date('2024-09-06'),
            'japan': new Date('2024-09-07'),
            'turkey': new Date('2024-09-07'),
            'uae': new Date('2024-09-08'),
            'palestine': new Date('2024-09-10'),
            'finland': new Date('2025-02-20')
        };

        // Check if date is before country launch - fail fast before expensive Firestore queries
        const launchDate = countryLaunchDates[country];
        if (launchDate && parsedDate < launchDate) {
            redirect(`/${locale}/${country}`);
        }

        // Fetch 3-day window: previous, current, and next day
        // This handles timezone spillover in both directions
        const yesterday = sub(parsedDate, { days: 1 });
        const tomorrow = new Date(parsedDate);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [yesterdayData, todayJsonData, tomorrowData] = await Promise.all([
            fetchDailySnapshot(country, yesterday),
            fetchDailySnapshot(country, parsedDate),
            fetchDailySnapshot(country, tomorrow)
        ]);

        // Use JSON if available, otherwise fallback to Firestore
        let data = todayJsonData;
        if (!data) {
            const headlines = await getCountryDayHeadlines(country, parsedDate, 1);
            const summaries = await getCountryDaySummaries(country, parsedDate, 1);
            const dailySummary = await getCountryDailySummary(country, parsedDate);
            data = { headlines, summaries, dailySummary };
        }

        // Merge yesterday's data
        if (yesterdayData) {
            data.headlines = [...(data.headlines || []), ...(yesterdayData.headlines || [])];
            data.summaries = [...(data.summaries || []), ...(yesterdayData.summaries || [])];
        }

        // Handle next day's data with fallback chain: JSON → Metadata → Firestore
        if (tomorrowData) {
            data.headlines = [...(data.headlines || []), ...(tomorrowData.headlines || [])];
            data.summaries = [...(data.summaries || []), ...(tomorrowData.summaries || [])];
        } else {
            // No JSON for tomorrow, try metadata document
            const tomorrowHeadlines = await getCountryDayHeadlinesFromMetadata(country, tomorrow);

            if (tomorrowHeadlines) {
                data.headlines = [...(data.headlines || []), ...tomorrowHeadlines];
                // Fetch tomorrow's summaries from Firestore
                const tomorrowSummaries = await getCountryDaySummaries(country, tomorrow, 1);
                if (tomorrowSummaries.length > 0) {
                    data.summaries = [...(data.summaries || []), ...tomorrowSummaries];
                }
            } else {
                // No metadata, fall back to Firestore collection
                const tomorrowHeadlinesFirestore = await getCountryDayHeadlines(country, tomorrow, 1);
                const tomorrowSummariesFirestore = await getCountryDaySummaries(country, tomorrow, 1);

                if (tomorrowHeadlinesFirestore.length > 0 || tomorrowSummariesFirestore.length > 0) {
                    data.headlines = [...(data.headlines || []), ...tomorrowHeadlinesFirestore];
                    data.summaries = [...(data.summaries || []), ...tomorrowSummariesFirestore];
                }
            }
        }

        // Filter to show only the requested day's data + continuity items
        // (see filterToDayWithContinuity JSDoc for detailed explanation)
        const { headlines, initialSummaries } = filterToDayWithContinuity(data, parsedDate);

        const daySummary = data.dailySummary;
        // Use yesterday's daily summary from JSON if available (saves 1 Firestore read)
        // Only query Firestore if yesterdayData doesn't exist at all (not if it exists but dailySummary is missing)
        const yesterdaySummary = yesterdayData?.dailySummary ?? (yesterdayData ? null : await getCountryDailySummary(country, sub(parsedDate, { days: 1 })));

        // Check if Hebrew content is available for Hebrew locale
        if (locale === 'heb') {
            const hasHebrewContent = initialSummaries.some(summary => isHebrewContentAvailable(summary)) ||
                (daySummary && isHebrewContentAvailable(daySummary)) ||
                (yesterdaySummary && isHebrewContentAvailable(yesterdaySummary));

            // If no Hebrew content is available, redirect to English
            if (!hasHebrewContent) {
                redirect(`/en/${country}/${date}`);
            }
        }

        const sources = {};
        headlines.forEach(headline => {
            const sourceName = getWebsiteName(country, headline.website_id);
            if (!sources[sourceName]) sources[sourceName] = { headlines: [], website_id: headline.website_id };
            sources[sourceName].headlines.push(headline);
        });


        return (
            <>
                {/* This correctly handles all your SEO needs for the entire collection */}
                <LdJson {...{ country, locale, daySummary, headlines, initialSummaries, sources }} date={parsedDate} />

                {/* Navigation links for crawlers */}
                <ArchiveLinksData locale={locale} country={country} />
                <CountryLinksData locale={locale} currentCountry={country} />
                <DateLinksData locale={locale} country={country} currentDate={parsedDate} />

                {/* This is the interactive UI for your users */}
                <CountryPageContent
                    {...{
                        sources,
                        initialSummaries,
                        daySummary,
                        yesterdaySummary,
                        locale,
                        country,
                        pageDate: parsedDate
                    }}
                />
            </>
        );
    } catch (error) {
        // NEXT_REDIRECT is not an error - it's Next.js's redirect mechanism
        if (error.message === 'NEXT_REDIRECT') {
            throw error; // Re-throw to allow redirect to proceed
        }
        console.error('❌ [DATE-PAGE] FATAL ERROR:', error);
        return <div>ERROR: {error.message}</div>;
    }
}
