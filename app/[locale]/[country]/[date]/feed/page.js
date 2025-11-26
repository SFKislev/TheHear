import { getCountryDailySummary, getCountryDayHeadlines, getCountryDaySummaries, getCountryDayHeadlinesFromMetadata } from "@/utils/database/countryData";
import { fetchDailySnapshot } from "@/utils/database/fetchDailySnapshot";
import { filterToStrictDay } from "@/utils/database/filterDayData";
import { parse, sub } from "date-fns";
import { getWebsiteName, getSourceData } from "@/utils/sources/getCountryData";
import { redirect } from "next/navigation";
import { countries } from "@/utils/sources/countries";
import { isHebrewContentAvailable, getHeadline } from "@/utils/daily summary utils";
import FeedJsonLd from "./FeedJsonLd";
import FeedView from "./FeedView";
import FeedPopup from "./popup";
// TEMPORARILY DISABLED during initial crawl period (thehear.org migration)
// Re-enable after 2-3 months once indexing is stable
// import InactivityRedirect from "./InactivityRedirect";

// Feed pages are immutable historical content that never changes
// export const revalidate = false; // Disable ISR - these pages never change once created
// export const dynamic = 'error'; // Fail build if route tries to be dynamic - forces static generation

// Generate SEO metadata for feed view
export async function generateMetadata({ params }) {
    const { country, locale, date } = await params;
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew || country : countryData.english || country;
    const flagEmoji = {
        "israel": "🇮🇱", "china": "🇨🇳", "finland": "🇫🇮", "france": "🇫🇷",
        "germany": "🇩🇪", "india": "🇮🇳", "iran": "🇮🇷", "italy": "🇮🇹",
        "japan": "🇯🇵", "lebanon": "🇱🇧", "netherlands": "🇳🇱", "palestine": "🇵🇸",
        "poland": "🇵🇱", "russia": "🇷🇺", "spain": "🇪🇸", "turkey": "🇹🇷",
        "uk": "🇬🇧", "us": "🇺🇸", "ukraine": "🇺🇦", "uae": "🇦🇪"
    }[country] || '';

    const formattedDate = date.replace(/-/g, '.');
    const parsedDate = parse(date, 'dd-MM-yyyy', new Date(2000, 0, 1));
    parsedDate.setHours(12, 0, 0, 0);

    // Validate date - return fallback metadata for invalid dates
    if (isNaN(parsedDate.getTime())) {
        return {
            title: 'The Hear - News Headlines',
            description: 'Real-time news headlines and AI-powered analysis',
            robots: { index: false, follow: false }
        };
    }

    // Try to get the day's summary from JSON first (cheaper than Firestore for metadata)
    // Only query Firestore if JSON doesn't exist at all (not if JSON exists but dailySummary is missing)
    const jsonData = await fetchDailySnapshot(country, parsedDate);
    const daySummary = jsonData?.dailySummary ?? (jsonData ? null : await getCountryDailySummary(country, parsedDate));
    const currentHeadline = daySummary ? getHeadline(daySummary, locale) : null;

    const title = locale === 'heb'
        ? `${flagEmoji} ${countryName} | ${formattedDate} | ארכיון כותרות`
        : `${flagEmoji} ${countryName} | ${formattedDate} | Headline Archive`;

    const description = locale === 'heb'
        ? `${currentHeadline ? `${currentHeadline}. ` : ''}ארכיון מלא של כותרות חדשות מ-${countryName} ל-${formattedDate} - כל הכותרות כפי שהתפתחו במהלך היום עם סיכומי בינה מלאכותית בזמן אמת`
        : `An archive of news headlines from ${countryName} for ${formattedDate}; ${currentHeadline ? `${currentHeadline}. ` : ''}All headlines as they unfolded throughout the day, with real-time AI overviews`;

    const url = `https://www.thehear.org/${locale}/${country}/${date}/feed`;

    return {
        title,
        description,
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            title,
            description,
            url,
            siteName: 'The Hear',
            locale: locale === 'heb' ? 'he_IL' : 'en_US',
            type: 'article',
            publishedTime: parsedDate.toISOString(),
            modifiedTime: parsedDate.toISOString(),
            authors: ['The Hear'],
            section: 'News Archive',
            tags: [countryName, 'news', 'headlines', formattedDate, 'archive', 'chronological'],
            images: [{
                url: 'https://www.thehear.org/logo192.png',
                width: 192,
                height: 192,
                alt: 'The Hear logo',
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['https://www.thehear.org/logo512.png'],
            site: '@thehearnews',
            creator: '@thehearnews'
        },
        alternates: {
            canonical: url, // Self-canonical - this is the version that should be indexed
            languages: {
                'en': `https://www.thehear.org/en/${country}/${date}/feed`,
                'he': `https://www.thehear.org/heb/${country}/${date}/feed`,
                'x-default': `https://www.thehear.org/en/${country}/${date}/feed`
            }
        },
    };
}

export default async function FeedPage({ params }) {
    try {
        const { country, locale, date } = await params;

        // Date parsing (no current date comparison for static generation)
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
        // This handles timezone spillover in both directions (same as date page)
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

        // Filter to show ONLY the requested day's data (strict filtering, no continuity)
        // Feed pages are chronological archives and should only show items from that specific day
        const { headlines, initialSummaries } = filterToStrictDay(data, parsedDate);

        const daySummary = data.dailySummary;
        const yesterdaySummary = yesterdayData?.dailySummary ?? (yesterdayData ? null : await getCountryDailySummary(country, yesterday));

        // Hebrew content check - only check today's content (feed pages show single day)
        if (locale === 'heb') {
            const hasHebrewContent = initialSummaries.some(summary => isHebrewContentAvailable(summary)) ||
                (daySummary && isHebrewContentAvailable(daySummary));

            if (!hasHebrewContent) {
                redirect(`/en/${country}/${date}/feed`);
            }
        }

        // Prepare sources for JSON-LD
        const sources = {};
        headlines.forEach(headline => {
            const sourceName = getWebsiteName(country, headline.website_id);
            if (!sources[sourceName]) sources[sourceName] = { headlines: [], website_id: headline.website_id };
            sources[sourceName].headlines.push(headline);
        });

        return (
            <div className="min-h-screen bg-gray-50 pb-4">
                {/* JSON-LD structured data for feed page */}
                <FeedJsonLd
                    country={country}
                    locale={locale}
                    date={parsedDate}
                    daySummary={daySummary}
                    headlines={headlines}
                    initialSummaries={initialSummaries}
                />

                {/* Feed view with all content visible */}
                <FeedView
                    {...{
                        headlines,
                        initialSummaries,
                        daySummary,
                        yesterdaySummary,
                        locale,
                        country,
                        date: parsedDate,
                        countryTimezone: data.metadata?.timezone
                    }}
                />

                {/* Feed popup */}
                <FeedPopup
                    country={country}
                    locale={locale}
                    pageDate={parsedDate}
                />

                {/* TEMPORARILY DISABLED during initial crawl period (thehear.org migration) */}
                {/* Re-enable after 2-3 months once indexing is stable */}
                {/* Inactivity redirect to time machine */}
                {/* <InactivityRedirect
                    locale={locale}
                    country={country}
                    date={date}
                    timeoutSeconds={80}
                /> */}
            </div>
        );
    } catch (error) {
        // NEXT_REDIRECT is not an error - it's Next.js's redirect mechanism
        if (error.message === 'NEXT_REDIRECT') {
            throw error; // Re-throw to allow redirect to proceed
        }
        console.error('❌ [FEED-PAGE] FATAL ERROR:', error);
        return <div>ERROR: {error.message}</div>;
    }
}

