'use client'

import { useState, useMemo } from 'react';
import InnerLink from '@/components/InnerLink';
import { getTypographyOptions } from '@/utils/typography/typography';
import { choose, checkRTL } from '@/utils/utils';
import { useFont, useTranslate } from '@/utils/store';

const randomFontIndex = Math.floor(Math.random() * 100);

export default function GlobalTitleCard({ locale, year, month, day, currentDate, dateString }) {
    const translate = useTranslate((state) => state.translate);
    const storeFont = useFont((state) => state.font);
    const [expanded, setExpanded] = useState(false);
    
    // Dynamic typography logic from ArchiveCard
    const shouldTranslate = useMemo(() => translate.includes('ALL'), [translate]);
    
    // Create the proper date string for the title card (Hebrew uses mixed format, English uses dateString)
    const titleDateString = useMemo(() => {
        if (locale === 'heb') {
            return currentDate.toLocaleDateString('he', { day: 'numeric', month: 'long', year: 'numeric' });
        }
        return dateString;
    }, [locale, currentDate, dateString]);
    
    const isRTL = useMemo(() => checkRTL(titleDateString), [titleDateString]);
    
    const typography = useMemo(() => {
        let typo = storeFont;
        // Use locale to determine typography options instead of country
        const localeCountry = locale === 'heb' ? 'israel' : 'us';
        const options = getTypographyOptions(localeCountry).options;
        if (typeof storeFont === 'number') typo = options[storeFont % options.length];
        else if (storeFont == 'random') typo = choose(options);

        if ((typo.direction === 'rtl' && !isRTL) || (typo.direction === 'ltr' && isRTL)) {
            const otherOptions = getTypographyOptions(isRTL ? 'israel' : 'us').options;
            typo = otherOptions[randomFontIndex % otherOptions.length];
        }

        if (shouldTranslate) {
            const translatedOptions = getTypographyOptions(locale == 'heb' ? 'israel' : 'us').options;
            typo = translatedOptions[randomFontIndex % translatedOptions.length];
        }

        return typo;
    }, [storeFont, locale, isRTL, shouldTranslate]);

    return (
        <div className={`
            col-span-1 relative bg-white
            ${isRTL ? 'direction-rtl' : 'direction-ltr'}
        `}>
            <div className="flex flex-col h-full justify-center items-center p-4">
                <span 
                    className="text-lg whitespace-nowrap text-center"
                    style={{ 
                        ...typography, 
                        direction: isRTL ? 'rtl' : 'ltr',
                        display: 'inline'
                    }}
                >
                    {titleDateString}
                </span>
                
                {/* Expandable Description */}
                <div className="mt-2 text-center">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setExpanded(!expanded);
                            }
                        }}
                        aria-expanded={expanded}
                        aria-label={expanded
                            ? (locale === 'heb' ? 'הסתר תיאור' : 'Hide description')
                            : (locale === 'heb' ? 'הצג תיאור' : 'Show description')
                        }
                        className="text-gray-600 hover:text-gray-800 transition-colors mx-auto block"
                    >
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {expanded && (
                        <div 
                            className={`${locale === 'heb' ? "font-['Roboto']" : "font-['Geist']"} text-xs text-gray-600 mt-2 text-center max-w-xs`}
                            style={{
                                direction: isRTL ? 'rtl' : 'ltr',
                                textAlign: isRTL ? 'right' : 'left'
                            }}
                            dangerouslySetInnerHTML={{
                                __html: locale === 'heb'
                                    ? `עמוד זה מרכז את הסיפורים העיקריים שסופרו בכותרות הראשיות במדינות שונות ב-${titleDateString}.<br/><br/>הכותרות והסקירות היומיות, שנועדו לתעד את הכותרות הראשיות בזמן אמת, נכתבו על ידי בינה. בחרו מדינה כדי לראות את הכותרות עצמן, כפי שהתרחשו וללא עריכה.`
                                    : `This page chronicles the main stories that unfolded in the media across different countries on ${titleDateString}.<br/><br/>The daily titles and overviews, meant to function as a real time, micro-history <strong>record of news headlines</strong>, were written by an AI. Click a country to see the <strong>actual headlines</strong> as they played out, unedited.`
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}