import { countries } from "@/utils/sources/countries";
import { getCountryDailySummariesForMonth } from "@/utils/database/countryData";
import { isHebrewContentAvailable } from "@/utils/daily summary utils";
import MonthlyArchiveGrid from "./MonthlyArchiveGrid";
import { createMetadata, LdJson } from "./metadata";
import { redirect } from "next/navigation";
import UniversalFooter from "@/components/UniversalFooter";

// Historical months are immutable - cache forever
// Current month updates daily
// Note: We'll check this at runtime in the page component
export const revalidate = false; // Cache historical months forever

export const dynamicParams = false;

export async function generateStaticParams() {
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

    const routes = [];
    const currentDate = new Date();
    const locales = ['en', 'heb'];

    Object.keys(countries).forEach(country => {
        const launchDate = countryLaunchDates[country];
        if (!launchDate) return;

        locales.forEach(locale => {
            // Generate all month/year combinations from launch date to current month
            let date = new Date(launchDate.getFullYear(), launchDate.getMonth(), 1);
            const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

            while (date <= currentMonthStart) {
                routes.push({
                    country,
                    locale,
                    year: date.getFullYear().toString(),
                    month: (date.getMonth() + 1).toString().padStart(2, '0')
                });

                // Move to next month
                date.setMonth(date.getMonth() + 1);
            }
        });
    });

    return routes;
}

export async function generateMetadata({ params }) {
    const { country, locale, year, month } = await params;
    return createMetadata({ country, locale, year, month });
}

export default async function MonthlyArchivePage({ params }) {
    const { country, locale, year, month } = await params;

    // Fetch all daily summaries for this month
    const dailySummaries = await getCountryDailySummariesForMonth(country, parseInt(year), parseInt(month));

    // Check if Hebrew content is available for Hebrew locale
    if (locale === 'heb' && dailySummaries.length > 0) {
        const hasHebrewContent = dailySummaries.some(summary => isHebrewContentAvailable(summary));

        // If no Hebrew content is available, redirect to English
        if (!hasHebrewContent) {
            redirect(`/en/${country}/history/${year}/${month}`);
        }
    }

    // Note: Sorting will be handled in the component for proper grid ordering

    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
        locale === 'heb' ? 'he' : 'en',
        { month: 'long', year: 'numeric' }
    );

    return (
        <>
            {/* JSON-LD structured data for SEO */}
            <LdJson
                country={country}
                locale={locale}
                year={year}
                month={month}
                dailySummaries={dailySummaries}
                headlines={dailySummaries.flatMap(summary => summary.headlines || [])}
            />

            {/* Client-side interactive UI */}
            <MonthlyArchiveGrid
                dailySummaries={dailySummaries}
                country={country}
                locale={locale}
                year={year}
                month={month}
                monthName={monthName}
            />

            <UniversalFooter
                locale={locale}
                pageType="monthly-archive"
                country={country}
                year={year}
                month={month}
            />
        </>
    );
}

