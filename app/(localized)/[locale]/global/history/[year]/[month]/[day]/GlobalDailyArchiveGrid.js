'use client'

import { useState } from 'react';
import { getGridColumnClasses } from '@/app/(localized)/[locale]/global/responsiveGrid';
import { countries } from '@/utils/sources/countries';
import InnerLink from '@/components/InnerLink';
import GlobalArchiveCard from './GlobalArchiveCard';
import GlobalTitleCard from './GlobalTitleCard';
import GlobalLiveCard from './GlobalLiveCard';
import { getTypographyOptions } from '@/utils/typography/typography';
import GlobalArchiveTopBar from './GlobalArchiveTopBar';

// Custom order for countries (non-alphabetical)
const customCountryOrder = [
    'us', 'israel', 'germany', 'france', 'lebanon', 'ukraine', 
    'palestine', 'uk', 'iran', 'russia', 'italy', 'japan', 
    'netherlands', 'india', 'poland', 'spain', 'turkey', 'china'
];

export default function GlobalDailyArchiveGrid({ 
    dailySummaries, 
    locale, 
    year, 
    month, 
    day,
    currentDate,
    dateString 
}) {
    const [isAlphabetical, setIsAlphabetical] = useState(false);

    // Use locale to determine typography and directionality
    const localeCountry = locale === 'heb' ? 'israel' : 'us';
    const typography = getTypographyOptions(localeCountry);

    const pageTitle = locale === 'heb' 
        ? `ארכיון חדשות עולמי - ${dateString}`
        : `Global News Archive - ${dateString}`;
    
    const pageDescription = locale === 'heb'
        ? `דף זה מתעד את כותרות החדשות העיקריות מתאריך ה-${dateString}. הכותרות והסקירות היומיות, שנועדו לתפקד כתיעוד בזמן אמת של החדשות מרחבי העולם, נכתבו על ידי בינה מלאכותית.`
        : `This page chronicles the main stories that unfolded across the world on ${dateString}. The daily titles and overviews, meant to function as a real time, micro-history record of global news headlines, were written by an AI. View headlines from all countries on a single day.`;

    // Sort function for daily summaries
    const sortDailySummaries = (summaries) => {
        if (isAlphabetical) {
            // Alphabetical sorting
            return summaries.sort((a, b) => {
                const nameA = locale === 'heb' ? countries[a.country]?.hebrew : countries[a.country]?.english;
                const nameB = locale === 'heb' ? countries[b.country]?.hebrew : countries[b.country]?.english;
                return (nameA || '').localeCompare(nameB || '');
            });
        } else {
            // Custom order sorting
            return summaries.sort((a, b) => {
                const indexA = customCountryOrder.indexOf(a.country);
                const indexB = customCountryOrder.indexOf(b.country);
                
                // If both countries are in the custom order, sort by their position
                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }
                
                // If only one is in custom order, prioritize it
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                
                // If neither is in custom order, sort alphabetically
                const nameA = locale === 'heb' ? countries[a.country]?.hebrew : countries[a.country]?.english;
                const nameB = locale === 'heb' ? countries[b.country]?.hebrew : countries[b.country]?.english;
                return (nameA || '').localeCompare(nameB || '');
            });
        }
    };

    if (!dailySummaries || dailySummaries.length === 0) {
        return (
            <>
                <typography.component />
                <GlobalArchiveTopBar 
                    {...{ locale, year, month, day, dateString, currentDate }} 
                    isAlphabetical={isAlphabetical}
                    setIsAlphabetical={setIsAlphabetical}
                />
                <div className="flex flex-1 min-h-[80vh] items-center justify-center">
                    <div className="text-center">
                        <p className={`text-gray-700 ${locale === 'heb' ? 'frank-re' : 'font-[\"Geist\"] text-sm'}`}>
                            {locale === 'heb' 
                                ? 'אין מה לראות כאן 👀' 
                                : '👀 Nothing to see here.'
                            }
                        </p>
                    </div>
                </div>
            </>
        );
    }

    const sortedDailySummaries = sortDailySummaries([...dailySummaries]);

    return (
        <>
            <typography.component />
            <GlobalArchiveTopBar 
                {...{ locale, year, month, day, dateString, currentDate }} 
                isAlphabetical={isAlphabetical}
                setIsAlphabetical={setIsAlphabetical}
            />
            <div style={{ paddingBottom: "var(--footer-offset, 3rem)" }} className={`custom-scrollbar 
                        gap-4 p-4
                        flex flex-col sm:grid 
                        sm:grid-cols-1 
                        md:grid-cols-2 
                        lg:grid-cols-3 
                        fhd:grid-cols-4 
                        qhd:grid-cols-6 
                        direction-${locale === 'heb' ? 'rtl' : 'ltr'}
                        `}>
                {/* Title Card - Always First */}
                <GlobalTitleCard 
                    locale={locale}
                    year={year}
                    month={month}
                    day={day}
                    currentDate={currentDate}
                    dateString={dateString}
                />
                
                {/* Country Summary Cards - sorted by custom order or alphabetically */}
                {sortedDailySummaries.map((dailySummary) => (
                    <GlobalArchiveCard 
                        key={dailySummary.country}
                        dailySummary={dailySummary}
                        locale={locale}
                        currentDate={currentDate}
                    />
                ))}
                
                {/* Live Card - Links to global live page (Last) */}
                <GlobalLiveCard 
                    locale={locale}
                />
            </div>
        </>
    );
}
