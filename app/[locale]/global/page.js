import { getAICountrySortServer, getAllCountriesLatestSummaries, getGlobalOverview } from "@/utils/database/globalData";
import GlobalPageContent from "./GlobalPageContent";
import { GlobalLdJson } from "./metadata";

export const revalidate = 900 // 15 minutes
export const dynamicParams = false

export async function generateStaticParams() {
    return [
        { locale: 'en' },
        { locale: 'heb' }
    ];
}

export async function generateMetadata({ params }) {
    const { locale } = await params;
    
    const title = locale === 'heb' ? 'סקירה גלובלית' : '🌍 Global Overview | The news as they evolve | The Hear';
    const description = locale === 'heb' 
        ? 'סקירה גלובלית של חדשות מכל העולם'
        : 'Global overview of news from around the world';
    
    return {
        title,
        description,
    };
}

export default async function GlobalPage({ params }) {
    const { locale } = await params;

    // Fetch data on server
    const [AICountrySort, rawCountrySummaries, rawGlobalOverview] = await Promise.all([
        getAICountrySortServer(),
        getAllCountriesLatestSummaries(),
        getGlobalOverview()
    ]);

    // Strip unused locale data to reduce HTML payload size
    // Only send English data for English pages, Hebrew data for Hebrew pages
    const countrySummaries = {};
    if (rawCountrySummaries) {
        Object.entries(rawCountrySummaries).forEach(([country, summary]) => {
            if (!summary) return;

            countrySummaries[country] = {
                id: summary.id,
                timestamp: summary.timestamp,
                relativeCohesion: summary.relativeCohesion,
                cohesion: summary.cohesion,
                // Only include the locale-specific fields
                ...(locale === 'heb' ? {
                    headline: summary.hebrewHeadline || summary.englishHeadline,
                    hebrewHeadline: summary.hebrewHeadline,
                    summary: summary.hebrewSummary || summary.summary,
                    hebrewSummary: summary.hebrewSummary
                } : {
                    headline: summary.englishHeadline || summary.headline,
                    englishHeadline: summary.englishHeadline,
                    summary: summary.summary,
                })
            };
        });
    }

    // Strip unused locale from global overview
    const globalOverview = rawGlobalOverview ? {
        timestamp: rawGlobalOverview.timestamp,
        // Only include the active locale
        [locale === 'heb' ? 'hebrew' : 'english']: rawGlobalOverview[locale === 'heb' ? 'hebrew' : 'english']
    } : null;

    return (
        <>
            {/* JSON-LD structured data for SEO */}
            <GlobalLdJson 
                locale={locale}
                countrySummaries={countrySummaries}
                globalOverview={globalOverview}
            />
            
            {/* Main page content */}
            <GlobalPageContent 
                locale={locale}
                AICountrySort={AICountrySort}
                countrySummaries={countrySummaries}
                globalOverview={globalOverview}
            />
        </>
    );
}