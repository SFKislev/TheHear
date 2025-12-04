'use client';

import { countries } from "@/utils/sources/countries";
import { getSourceData } from "@/utils/sources/getCountryData";
import { getHeadline, getSummaryContent } from "@/utils/daily summary utils";
import Link from "next/link";
import InnerLink from "@/components/InnerLink";
import { getTypographyOptions } from "@/utils/typography/typography";
import HeadlineCard from "./FeedHeadlineCard";
import SummaryCard from "./FeedSummaryCard";
import FeedTopbar from "./FeedTopbar";
import FeedFooter from "./FeedFooter";
import FeedDailySummary from "./feedDailySummary";
import LogoSmall from "@/components/Logo-small";

export default function FeedView({ headlines, initialSummaries, daySummary, yesterdaySummary, locale, country, date, countryTimezone, isMobile }) {
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew || country : countryData.english || country;
    const isRTL = locale === 'heb';
    const dateString = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;

    // Helper function to format time in country's timezone
    const formatInCountryTimezone = (timestamp) => {
        if (!countryTimezone) return null;

        try {
            // Use Intl.DateTimeFormat to format in the country's timezone
            return new Intl.DateTimeFormat('en-US', {
                timeZone: countryTimezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(timestamp);
        } catch (e) {
            return null;
        }
    };
    
    // Combine headlines and summaries into timeline items, sorted chronologically
    const timelineItems = [];

    // Add all headlines
    headlines.forEach(headline => {
        timelineItems.push({
            type: 'headline',
            timestamp: new Date(headline.timestamp),
            data: headline
        });
    });
    
    // Add hourly summaries
    initialSummaries.forEach(summary => {
        timelineItems.push({
            type: 'hourly-summary',
            timestamp: new Date(summary.timestamp),
            data: summary
        });
    });
    
    // Sort by timestamp - OLDEST FIRST (chronological order)
    timelineItems.sort((a, b) => a.timestamp - b.timestamp);
    
    return (
        <>
            <div className={`min-h-screen ${isRTL ? 'direction-rtl' : 'direction-ltr'}`}>
                <FeedTopbar locale={locale} country={country} daySummary={daySummary} date={date} />

                {/* Logo */}
                <div className="py-2">
                    <LogoSmall locale={locale} showDivider={false} />
                </div>

                {/* Intro text as h2 for SEO */}
                <div className="max-w-lg mx-auto px-4 py-2">
                    <h2 className={`${locale === 'heb' ? 'text-base text-gray-800 frank-re' : 'text-sm text-gray-700 font-["Geist"]'} text-center leading-relaxed`} style={{ margin: 0, fontWeight: 'inherit' }}>
                        {locale === 'heb' ? (
                            <>
                                זהו ארכיון כותרות ראשיות מ<u>{countryName}</u> מתאריך ה־{dateString}.<br /><br />
                                בעמוד מוצגות <u>{headlines.length} כותרות</u> ממקורות רבים, לפי סדר כרונולוגי, כפי שהופיעו ונעלמו לאורך היום.
                            </>
                        ) : (
                            <>
                                This page is an <strong>archive of main headlines</strong> from {(country === 'us' || country === 'uk') ? 'the ' : ''}
                                <strong>{countryName}</strong> for <strong>{dateString}</strong>.<br /><br />
                                It displays <strong>{headlines.length} headlines</strong> from many sources chronologically, as they appeared throughout the day, accompanied by AI overviews that were written in real time.
                            </>
                        )}
                    </h2>
                </div>

                {/* Daily Summary - displayed prominently at the top */}
                {daySummary && (
                    <div className="max-w-xl mx-auto px-4 py-4">
                        <FeedDailySummary locale={locale} daySummary={daySummary} />
                    </div>
                )}

                {/* Timeline - Desktop vs Mobile */}
                <div className={`${isMobile ? 'max-w-lg' : 'max-w-5xl'} mx-auto px-4 py-8 pb-48 relative`}>
                    {isMobile ? (
                        /* Mobile: Single column layout */
                        <div className="space-y-8">
                            {timelineItems.map((item, index) => {
                                const isSummary = item.type === 'hourly-summary' || item.type === 'daily-summary';

                                // Format timestamp for display
                                const timeString = item.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                });
                                const countryTimeString = formatInCountryTimezone(item.timestamp);

                                return (
                                    <div key={`${item.type}-${index}`} className={`${isSummary ? 'my-12' : 'my-4'}`}>
                                        {/* Timestamp for mobile - show country time */}
                                        <div className="text-center mb-2">
                                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                                {countryTimeString || timeString}
                                            </span>
                                        </div>

                                        {/* Content card - centered */}
                                        <div className="flex justify-center">
                                            <div className="w-full max-w-md">
                                                {item.type === 'headline' && (
                                                    <HeadlineCard headline={item.data} country={country} locale={locale} countryTimezone={countryTimezone} />
                                                )}
                                                {item.type === 'hourly-summary' && (
                                                    <SummaryCard summary={item.data} locale={locale} type="hourly" countryTimezone={countryTimezone} />
                                                )}
                                                {item.type === 'daily-summary' && (
                                                    <SummaryCard summary={item.data} locale={locale} type="daily" countryTimezone={countryTimezone} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Desktop: Original timeline layout */
                        <div className="relative pt-8">
                            {/* Current date at top of timeline */}
                            {locale !== 'heb' && (
                                <div className={`absolute ${isRTL ? 'right-1/2' : 'left-1/2'} top-0 transform -translate-x-1/2 -translate-y-6 z-20`}>
                                    <div className="text-[0.7em] text-gray-400 font-mono whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                                        {dateString}
                                    </div>
                                </div>
                            )}

                            {/* Vertical timeline line */}
                            <div className={`absolute ${isRTL ? 'right-1/2' : 'left-1/2'} top-0 bottom-0 w-px bg-gray-500`} />

                            {/* Next day link at bottom of timeline */}
                            {locale !== 'heb' && (
                                <div className={`absolute ${isRTL ? 'right-1/2' : 'left-1/2'} bottom-0 transform -translate-x-1/2 translate-y-16 z-30`}>
                                    <InnerLink
                                        href={`/${locale}/${country}/${(date.getDate() + 1).toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}/feed`}
                                        locale={locale}
                                    >
                                        <div className="flex flex-col items-center text-gray-400 hover:text-gray-600">
                                            <div className="text-[0.7em] font-mono whitespace-nowrap px-2 rounded">
                                                {String(date.getDate() + 1).padStart(2, '0')}.{String(date.getMonth() + 1).padStart(2, '0')}.{date.getFullYear()}
                                            </div>
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="mb-4"
                                            >
                                                <polyline points="6,9 12,15 18,9"></polyline>
                                            </svg>
                                        </div>
                                    </InnerLink>
                                </div>
                            )}

                            {timelineItems.map((item, index) => {
                                 // Only count headlines for side alternation, skip summaries
                                 const headlineCountBeforeThis = timelineItems.slice(0, index).filter(i => i.type === 'headline').length;
                                 const side = headlineCountBeforeThis % 2 === 0 ? 'left' : 'right';
                                 const isLeft = isRTL ? side === 'right' : side === 'left';
                                 const isSummary = item.type === 'hourly-summary' || item.type === 'daily-summary';

                                 // Format timestamp for display
                                 const timeString = item.timestamp.toLocaleTimeString([], {
                                     hour: '2-digit',
                                     minute: '2-digit',
                                     hour12: false
                                 });
                                 const countryTimeString = formatInCountryTimezone(item.timestamp);

                                 return (
                                     <div key={`${item.type}-${index}`} className={`relative ${isSummary ? 'mb-8 mt-24' : '-mb-16'}`}>
                                         {/* Only show dot and lines for headlines, not summaries */}
                                         {!isSummary && (
                                             <>
                                                 {/* Timeline dot - smaller and properly aligned */}
                                                 {locale !== 'heb' && (
                                                     <div className={`absolute ${isRTL ? 'right-1/2' : 'left-1/2'} top-1 w-2 h-2 rounded-full bg-white transform -translate-x-1/3 z-10`} />
                                                 )}

                                                 {/* Timestamp opposite to the line - show country time */}
                                                 <div className={`text-[0.7em] text-gray-400 font-mono whitespace-nowrap`} style={{
                                                     position: 'absolute',
                                                     top: '0',
                                                     [isLeft ? (isRTL ? 'right' : 'left') : (isRTL ? 'left' : 'right')]: 'calc(50% + 1rem)'
                                                 }}>
                                                     {countryTimeString || timeString}
                                                 </div>

                                                 {/* Horizontal connector line from center to card */}
                                                 {isLeft ? (
                                                     <div className={`absolute top-1.5 ${isRTL ? 'left-1/2' : 'right-1/2'} h-px bg-gray-500 z-0`} style={{ width: 'calc(8%)' }} />
                                                 ) : (
                                                     <div className={`absolute top-1.5 ${isRTL ? 'right-1/2' : 'left-1/2'} h-px bg-gray-500 z-0`} style={{ width: 'calc(8%)' }} />
                                                 )}
                                             </>
                                         )}

                                         {/* Content card - centered for summaries, alternating for headlines */}
                                         <div className={`flex ${isSummary ? 'justify-center' : (isLeft ? 'justify-start pr-1/2' : 'justify-end pl-1/2')}`}>
                                             <div className={isSummary ? 'w-2/4' : 'w-5/12'}>
                                                {item.type === 'headline' && (
                                                    <HeadlineCard headline={item.data} country={country} locale={locale} countryTimezone={countryTimezone} />
                                                )}
                                                {item.type === 'hourly-summary' && (
                                                    <SummaryCard summary={item.data} locale={locale} type="hourly" countryTimezone={countryTimezone} />
                                                )}
                                                {item.type === 'daily-summary' && (
                                                    <SummaryCard summary={item.data} locale={locale} type="daily" countryTimezone={countryTimezone} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <FeedFooter locale={locale} country={country} daySummary={daySummary} date={date} />
            </div>
        </>
    );
}

