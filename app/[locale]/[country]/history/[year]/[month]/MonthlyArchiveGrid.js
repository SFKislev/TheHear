'use client'

import { getGridColumnClasses } from '@/app/[locale]/global/responsiveGrid';
import { countries } from '@/utils/sources/countries';
import InnerLink from '@/components/InnerLink';
import ArchiveCard from './ArchiveCard';
import TitleCard from './TitleCard';
import LiveCard from './LiveCard';
import { getTypographyOptions } from '@/utils/typography/typography';
import ArchiveTopBar from './ArchiveTopBar';



export default function MonthlyArchiveGrid({ 
    dailySummaries, 
    country, 
    locale, 
    year, 
    month, 
    monthName 
}) {
    // Use locale to determine typography and directionality instead of country
    const localeCountry = locale === 'heb' ? 'israel' : 'us';
    const typography = getTypographyOptions(localeCountry);

    const countryName = locale === 'heb' ? countries[country].hebrew : countries[country].english;
    const pageTitle = locale === 'heb' 
        ? `ארכיון חדשות ${countryName} - ${monthName}`
        : `${countryName} News Archive - ${monthName}`;
    
    const pageDescription = locale === 'heb'
        ? `דף זה מתעד את הכותרות העיקריות מחדשות ${countryName} ב-${monthName}. הכותרות היומיות והסקירות, שנועדו לשמש כתיעוד בזמן אמת של כותרות חדשות, נכתבו על ידי בינה מלאכותית. בחר תאריך כדי לראות את הכותרות כפי שהתרחשו, ללא עריכה.`
        : `This page chronicles the main stories of ${country === 'us' || country === 'uk' ? 'the ' : ''}${countryName} during ${monthName}. Pick a date to view the actual headlines as they appeared, unedited.`;

    if (!dailySummaries || dailySummaries.length === 0) {
        return (
            <>
                <typography.component />
                <ArchiveTopBar {...{ country, locale, year, month, monthName }} />
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

    return (
        <>
            <typography.component />
            <ArchiveTopBar {...{ country, locale, year, month, monthName }} />
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
                <TitleCard 
                    country={country}
                    locale={locale}
                    year={year}
                    month={month}
                />
                
                {/* Daily Summary Cards */}
                {dailySummaries
                    .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort ascending (first day first)
                    .map((dailySummary) => (
                        <ArchiveCard 
                            key={dailySummary.date}
                            dailySummary={dailySummary}
                            country={country}
                            locale={locale}
                        />
                    ))}
                
                {/* Live Card - Links to current country page (Last) */}
                <LiveCard 
                    country={country}
                    locale={locale}
                />
            </div>
        </>
    );
}
