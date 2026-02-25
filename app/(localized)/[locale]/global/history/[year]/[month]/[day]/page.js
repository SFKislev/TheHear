import { getGlobalDailySummariesForDate } from "@/utils/database/countryData";
import { isHebrewContentAvailable } from "@/utils/daily summary utils";
import GlobalDailyArchiveGrid from "./GlobalDailyArchiveGrid";
import { createMetadata, LdJson } from "./metadata";
import { redirect, notFound } from "next/navigation";
import UniversalFooter from "@/components/UniversalFooter";

// Historical dates cached forever, current date updates daily
export const revalidate = 86400; // 24 hours - will be optimized at edge for historical dates

export const dynamicParams = true;

export async function generateStaticParams() {
    const routes = [];
    const currentDate = new Date();
    const locales = ['en', 'heb'];

    // Global archive starts from September 14, 2024
    const globalStartDate = new Date('2024-09-14');

    locales.forEach(locale => {
        // Generate all date combinations from global start date to current date
        let date = new Date(globalStartDate);
        
        while (date <= currentDate) {
            routes.push({
                locale,
                year: date.getFullYear().toString(),
                month: String(date.getMonth() + 1).padStart(2, '0'),
                day: String(date.getDate()).padStart(2, '0')
            });
            
            // Move to next day
            date.setDate(date.getDate() + 1);
        }
    });

    return routes;
}

export async function generateMetadata({ params }) {
    return createMetadata({ params });
}

export default async function GlobalDailyArchivePage({ params }) {
    const { locale, year, month, day } = await params;
    
    // Check if it's today or future date - redirect to live view
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    
    // Define minimum date (September 14, 2024)
    const minDate = new Date(2024, 8, 14); // Month is 0-indexed, so 8 = September
    
    // Check if date is before minimum date - return 404
    if (currentDate < minDate) {
        notFound();
    }
    
    if (currentDate >= today) {
        redirect(`/${locale}/global`);
    }
    
    // Fetch all daily summaries for this date across all countries
    const dailySummaries = await getGlobalDailySummariesForDate(parseInt(year), parseInt(month), parseInt(day));
    
    // Check if Hebrew content is available for Hebrew locale
    if (locale === 'heb' && dailySummaries.length > 0) {
        const hasHebrewContent = dailySummaries.some(summary => isHebrewContentAvailable(summary));
        
        // If no Hebrew content is available, redirect to English
        if (!hasHebrewContent) {
            redirect(`/en/global/history/${year}/${month}/${day}`);
        }
    }
    
    const dateString = locale === 'heb' 
        ? `${String(currentDate.getDate()).padStart(2, '0')}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${currentDate.getFullYear()}`
        : currentDate.toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <>
            {/* JSON-LD structured data for SEO */}
            <LdJson 
                locale={locale}
                year={year}
                month={month}
                day={day}
                currentDate={currentDate}
                dailySummaries={dailySummaries}
                headlines={dailySummaries.flatMap(summary => summary.headlines || [])}
            />
            
            {/* Client-side interactive UI */}
            <GlobalDailyArchiveGrid 
                dailySummaries={dailySummaries}
                locale={locale}
                year={year}
                month={month}
                day={day}
                currentDate={currentDate}
                dateString={dateString}
            />

            <UniversalFooter
                locale={locale}
                pageType="global-archive"
                year={year}
                month={month}
                day={day}
            />
        </>
    );
}
