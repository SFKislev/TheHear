'use client'

import { useTime, useTranslate } from '@/utils/store';
import { createDateString } from '@/utils/utils';
import { redirect, usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';
import CustomTooltip from '@/components/CustomTooltip';
import { trackTimeExploration } from '@/utils/analytics';

// Helper function to clean summary text by removing everything after language markers
const cleanSummaryText = (text) => {
    if (!text) return '';
    
    // Find the index of language markers and truncate at the first one found
    const markers = ['HEBREWSUMMARY:', 'LOCALSUMMARY:', 'SUMMARY:'];
    let cleanText = text;
    
    for (const marker of markers) {
        const markerIndex = text.indexOf(marker);
        if (markerIndex !== -1) {
            cleanText = text.substring(0, markerIndex).trim();
            break; // Stop at the first marker found
        }
    }
    
    return cleanText;
};

export default function Summary({ summary, country, active, locale, yesterday }) {
    const useLocalLanguage = useTranslate(state => state.useLocalLanguage)
    const setManualDate = useTime(state => state.setManualDate);
    const summaryRef = useRef(null);
    const pathname = usePathname();

    // Detect if the current path matches /[locale]/[country]/[date] (date in dd-MM-yyyy)
    const isDatePage = /\/[^/]+\/[^/]+\/\d{2}-\d{2}-\d{4}$/.test(pathname);

    useEffect(() => {
        if (active && summaryRef.current) {
            setTimeout(() => {
                if (!summaryRef.current) return;
                summaryRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }, 50);
        }
    }, [active]);

    if (!summary) return null;

    let text = cleanSummaryText(summary.summary);
    let headline = cleanSummaryText(summary.englishHeadline);
    if (locale === 'heb') {
        text = cleanSummaryText(summary.hebrewSummary);
        headline = cleanSummaryText(summary.hebrewHeadline || summary.headline);
    } 
    if (useLocalLanguage) {
        text = summary ? cleanSummaryText(summary.translatedSummary) : '';
        headline = summary ? cleanSummaryText(summary.translatedHeadline || summary.headline) : '';
    }
    const timestamp = 
        (summary.timestamp.getHours() < 10 ? '0' : '') + summary.timestamp.getHours() + ':' + 
        (summary.timestamp.getMinutes() < 10 ? '0' : '') + summary.timestamp.getMinutes();

    const parts = text.split(/(\(.*?\))/g)

    const fontClass = locale === 'heb' ? 'frank-re' : 'font-["Geist"]';

    const clickHandler = () => {
        // Track time exploration when clicking on a summary
        trackTimeExploration('summary_click', {
            country,
            locale,
            is_date_page: isDatePage,
            is_yesterday: yesterday
        });

        setManualDate(summary.timestamp);
        if (yesterday) {
            const yesterdayDate = new Date(summary.timestamp);
            redirect(`/${locale}/${country}/${createDateString(yesterdayDate)}`);
        }
    }

    const disclaimer = locale === 'heb' ? 'סקירה זו נכתבה בידי בינה' : 'This overview was written by an AI';
    return (
        <div
            ref={summaryRef}
            className={`py-2 ${fontClass} leading-none font-normal cursor-pointer ${active ? '' : 'text-gray-200 hover:text-gray-500 transition-colors'} border-b border-dashed border-gray-200 pb-5 ${
                active ? (locale === 'heb' ? 'text-[16px]' : 'text-[14px]') : 'text-sm'
            }`}
            style={{
                color: active ? 'black' : '#e8e8e8',
                cursor: active ? 'text' : 'pointer',
                fontWeight: 400,
                lineHeight: active ? '1.5' : '1.5',
            }}
            onClick={clickHandler}
        >
            {active && !isDatePage ? (
                <h2 className={`text-blue mb-2 ${locale === 'heb' ? 'text-[17px]' : 'text-base'} font-medium`}
                    style={{ lineHeight: '1.5', marginTop: '0px', marginBottom: '10px' }}
                >
                    <span className={`font-mono ${locale === 'heb' ? 'text-sm' : 'text-sm'}`}>{timestamp}</span>
                    <span className="mx-1">{locale == 'heb' ? '⇠' : '⇢'}</span>
                    <span>{headline}</span>
                </h2>
            ) : (
                <h3 className={`${active && isDatePage ? 'underline underline-offset-4 decoration-gray-400 decoration-1' : ''} mb-2 ${locale === 'heb' ? 'text-[17px]' : 'text-base'} font-medium`}
                    style={{
                        lineHeight: active ? '1.5' : '1.4',
                        marginTop: active ? '0px' : '12px',
                        marginBottom: '10px',
                    }}
                >
                    <span className={`font-mono ${locale === 'heb' ? 'text-sm' : 'text-sm'}`}>{timestamp}</span>
                    <span className="mx-1">{locale == 'heb' ? '⇠' : '⇢'}</span>
                    <span>{headline}</span>
                </h3>
            )}
            <CustomTooltip title={disclaimer} placement={locale === 'heb' ? 'top' : 'right'}>
                <span className={`${locale === 'heb' ? 'pl-2' : 'pr-2'} align-middle cursor-help text-sm ${active ? 'text-gray-600' : 'text-gray-200'}`} tabIndex={0}>⌨</span>
            </CustomTooltip>
            {parts.map((part, i) => (
                <span key={i} className={
                    active ? (part.startsWith('(') ?
                        `text-gray-400 ${locale === 'heb' ? 'text-sm' : 'text-sm'}` :
                        '') : ''
                }>
                    {part}
                </span>
            ))}
        </div>
    );
}
