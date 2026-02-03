import { countries } from "@/utils/sources/countries";
import { getCountryDailySummariesForMonth } from "@/utils/database/countryData";
import { isHebrewContentAvailable } from "@/utils/daily summary utils";
import MonthlyArchiveGrid from "./MonthlyArchiveGrid";
import { createMetadata, LdJson } from "./metadata";
import { redirect } from "next/navigation";
import UniversalFooter from "@/components/UniversalFooter";
import { COUNTRY_LAUNCH_DATES } from "@/utils/launchDates";

// Historical months are immutable - cache forever
// Current month updates daily
// Note: We'll check this at runtime in the page component
export const revalidate = false; // Cache historical months forever

export const dynamicParams = false;

export async function generateStaticParams() {
    const routes = [];
    const currentDate = new Date();
    const locales = ['en', 'heb'];

    Object.keys(countries).forEach(country => {
        const launchDate = COUNTRY_LAUNCH_DATES[country];
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
