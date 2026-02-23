import { getCountryDailySummary, getCountryDayHeadlines, getCountryDaySummaries, getCountryDayHeadlinesFromMetadata } from "@/utils/database/countryData";
import { fetchDailySnapshot } from "@/utils/database/fetchDailySnapshot";
import { filterToStrictDay } from "@/utils/database/filterDayData";
import { format, isValid, parse, startOfDay, sub } from "date-fns";
import { getWebsiteName, getSourceData } from "@/utils/sources/getCountryData";
import { redirect } from "next/navigation";
import { countries } from "@/utils/sources/countries";
import { getHeadline } from "@/utils/daily summary utils";
import FeedJsonLd from "./FeedJsonLd";
import FeedView from "./FeedView";
import FeedFooter from "./FeedFooter";
import FeedPopup from "./popup";
import FeedFonts from "./FeedFonts";
import { getCountryLaunchDate } from "@/utils/launchDates";
// Do not import request-bound APIs (headers/cookies) here.
// TEMPORARILY DISABLED during initial crawl period (thehear.org migration)
// Re-enable after 2-3 months once indexing is stable
// import InactivityRedirect from "./InactivityRedirect";

// Feed pages are immutable historical content that rarely changes
// Cache for 1 week - balances CDN caching with ability to deploy fixes
export const revalidate = 604800; // 7 days in seconds
// Enforce static generation; build should fail if route becomes dynamic again.
export const dynamic = 'error';

const TITLE_MAX_CHARS = 72;
const TITLE_SUFFIX = ' | The Hear';
const HEBREW_ARCHIVE_SUFFIX = ' | \u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05DB\u05D5\u05EA\u05E8\u05D5\u05EA';

function truncateForTitle(text, maxChars) {
    if (!text) return '';
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxChars) return normalized;
    if (maxChars <= 3) return '';
    return `${normalized.slice(0, maxChars - 3).trim()}...`;
}

function buildSeoTitle({ flagEmoji, corePrefix, headline }) {
    const cleanFlag = (flagEmoji || '').trim();
    const cleanPrefix = (corePrefix || '').replace(/\s+/g, ' ').trim();
    const cleanHeadline = (headline || '').replace(/\s+/g, ' ').trim();
    const separator = ': ';

    let useSuffix = true;
    let useFlag = !!cleanFlag;
    let activeHeadline = cleanHeadline;

    const getPrefix = () => (useFlag ? `${cleanFlag} ${cleanPrefix}` : cleanPrefix);
    const compose = (withHeadline = true) =>
        `${getPrefix()}${withHeadline && activeHeadline ? `${separator}${activeHeadline}` : ''}${useSuffix ? TITLE_SUFFIX : ''}`.trim();

    // 1) Try full title first.
    let candidate = compose(true);
    if (candidate.length <= TITLE_MAX_CHARS) return candidate;

    // 2) Remove brand suffix first.
    useSuffix = false;
    candidate = compose(true);
    if (candidate.length <= TITLE_MAX_CHARS) return candidate;

    // 3) Remove flag next.
    useFlag = false;
    candidate = compose(true);
    if (candidate.length <= TITLE_MAX_CHARS) return candidate;

    // 4) Keep full headline; if still long, let Google truncate in SERP.
    return candidate;
}

function buildHebrewSeoTitle({ countryName, hebrewDate, headline }) {
    const cleanCountry = (countryName || '').replace(/\s+/g, ' ').trim();
    const cleanDate = (hebrewDate || '').replace(/\s+/g, ' ').trim();
    const cleanHeadline = (headline || '').replace(/\s+/g, ' ').trim();
    const separator = ': ';
    const prefix = `${cleanCountry}, ${cleanDate}`;

    let useArchiveSuffix = true;
    let activeHeadline = cleanHeadline;

    const compose = (withHeadline = true) =>
        `${prefix}${withHeadline && activeHeadline ? `${separator}${activeHeadline}` : ''}${useArchiveSuffix ? HEBREW_ARCHIVE_SUFFIX : ''}`.trim();

    // 1) Full Hebrew title format
    let candidate = compose(true);
    if (candidate.length <= TITLE_MAX_CHARS) return candidate;

    // 2) Remove archive suffix first
    useArchiveSuffix = false;
    candidate = compose(true);
    if (candidate.length <= TITLE_MAX_CHARS) return candidate;

    // 3) Keep full headline; if still long, let Google truncate in SERP.
    return candidate;
}

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

    const englishDate = format(parsedDate, 'd MMM yyyy');
    const hebrewDate = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsedDate);
    const titlePrefix = `${countryName} headlines, ${englishDate}`;
    const title = locale === 'heb'
        ? buildHebrewSeoTitle({ countryName, hebrewDate, headline: currentHeadline })
        : buildSeoTitle({ flagEmoji, corePrefix: titlePrefix, headline: currentHeadline });

    const countryInDescription = (country === 'us' || country === 'uk') ? `the ${countryName}` : countryName;
    const description = locale === 'heb'
        ? `${currentHeadline ? `${currentHeadline}. ` : ''}ארכיון מלא של כותרות חדשות מ-${countryName} ל-${formattedDate} - כל הכותרות כפי שהתפתחו במהלך היום עם סיכומי בינה מלאכותית בזמן אמת`
        : `An archive of news headlines from ${countryInDescription} for ${formattedDate}; ${currentHeadline ? `${currentHeadline}. ` : ''}All headlines as they unfolded throughout the day, with real-time AI overviews`;

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

        // Avoid request-bound APIs to keep this route static/ISR.
        // If mobile behavior is needed, handle it client-side in FeedView.
        const isMobile = false;

        // Strict date validation (including non-existent dates like 31-02-2026)
        const parsedDate = parse(date, 'dd-MM-yyyy', new Date(2000, 0, 1));
        const isValidRequestedDate = isValid(parsedDate) && format(parsedDate, 'dd-MM-yyyy') === date;
        if (!isValidRequestedDate) {
            redirect(`/${locale}/${country}`);
        }
        const requestedDay = startOfDay(parsedDate);
        const today = startOfDay(new Date());

        // Today's and future dates belong to the live page.
        if (requestedDay >= today) {
            redirect(`/${locale}/${country}`);
        }
        parsedDate.setHours(12, 0, 0, 0);

        // Check if date is before country launch - fail fast before expensive Firestore queries
        const launchDate = getCountryLaunchDate(country);
        if (launchDate && requestedDay < startOfDay(launchDate)) {
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

        // Hebrew feed URLs remain first-class localized pages.
        // Do not redirect to English; locale-specific canonical/hreflang handles localization.

        // Prepare sources for JSON-LD
        const sources = {};
        headlines.forEach(headline => {
            const sourceName = getWebsiteName(country, headline.website_id);
            if (!sources[sourceName]) sources[sourceName] = { headlines: [], website_id: headline.website_id };
            sources[sourceName].headlines.push(headline);
        });

        return (
            <div className="min-h-screen bg-gray-50 pb-4">
                {/* Load country-specific fonts dynamically */}
                <FeedFonts country={country} />

                {/* JSON-LD structured data for feed page */}
                <FeedJsonLd
                    country={country}
                    locale={locale}
                    date={parsedDate}
                    daySummary={daySummary}
                    headlines={headlines}
                    initialSummaries={initialSummaries}
                />

                {/* Feed view with all content visible - footer passed as server component for SSR links */}
                <FeedView
                    {...{
                        headlines,
                        initialSummaries,
                        daySummary,
                        yesterdaySummary,
                        locale,
                        country,
                        date: parsedDate,
                        countryTimezone: data.metadata?.timezone,
                        isMobile,
                        footer: <FeedFooter locale={locale} country={country} date={parsedDate} />
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
