'use client'

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@mui/material';
import useGlobalOverviews from '@/utils/database/useGlobalOverview';
import CustomTooltip from '@/components/CustomTooltip';

export default function GlobalOverview({ locale, initialOverview }) {
    const coerceDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value?.toDate === 'function') return value.toDate();
        if (typeof value === 'string' || typeof value === 'number') {
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        return null;
    };
    // Initialize with data for SSR
    const initialData = initialOverview && (locale === 'en'
        ? { ...initialOverview.english, timestamp: initialOverview.timestamp }
        : { ...initialOverview.hebrew, timestamp: initialOverview.timestamp });

    const [overview, setOverview] = useState(initialData || null);
    const [mounted, setMounted] = useState(false);
    const clientOverview = useGlobalOverviews(locale);

    useEffect(() => {
        setMounted(true);
        if (initialOverview && !overview) {
            const localizedOverview = locale === 'en'
                ? { ...initialOverview.english, timestamp: initialOverview.timestamp }
                : { ...initialOverview.hebrew, timestamp: initialOverview.timestamp };
            setOverview(localizedOverview);
        }
    }, [initialOverview, locale, overview]);

    // Update with client data when available
    useEffect(() => {
        if (mounted && clientOverview) {
            setOverview(clientOverview);
        }
    }, [mounted, clientOverview]);

    // For SSR, use initialOverview if available
    const displayOverview = overview || (initialOverview && (locale === 'en' 
        ? { ...initialOverview.english, timestamp: initialOverview.timestamp }
        : { ...initialOverview.hebrew, timestamp: initialOverview.timestamp }));

    if (!displayOverview) {
        return (
            <div className="mb-2">
                <Skeleton variant="text" width="90%" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="85%" height={24} />
                <Skeleton variant="text" width="80%" height={24} />
            </div>
        );
    }

    // Format timestamp
    const timestampDate = coerceDate(displayOverview.timestamp);
    const formattedTime = timestampDate ? timestampDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }) : '—';

    const formatText = (text) => {
        // Split text by HTML break tags and parenthetical content
        const parts = text.split(/(<\/?br\s*\/?>|\(.*?\))/g).filter(Boolean);

        const formatTitleSection = (text) => {
            // Match pattern: start of string or after line break, followed by "WORD WORD: "
            const titleMatch = text.match(/^([^:]+):\s(.+)/);
            if (titleMatch) {
                return (
                    <>
                        <div className={`inline ${locale === 'heb' ? 'frank-re text-base underline underline-offset-4' : 'font-["Geist"] text-sm font-bold'}`}>
                            {locale === 'heb' ? '⇠' : '⇢'} {titleMatch[1]}:
                        </div>
                        {" " + titleMatch[2]}
                    </>
                );
            }
            return text;
        };

        return parts.map((part, index) => {
            if (part.match(/<\/?br\s*\/?>/)) {
                // Get the next part and handle title if present
                const nextPart = parts[index + 1];
                if (nextPart) {
                    parts[index + 1] = nextPart.replace(/^\s+/, '');
                }
                return <div key={`break-${index}`} className="mb-2" />;
            }

            if (part.startsWith('(') && part.endsWith(')')) {
                return (
                    <div
                        key={`parenthesis-${index}`}
                        className={`text-gray-500 inline ${locale === 'heb' ? 'text-sm' : 'text-xs'}`}
                    >
                        {part}
                    </div>
                );
            }

            // Check if this is the first part or follows a line break
            if (index === 0 || parts[index - 1].match(/<\/?br\s*\/?>/)) {
                return <React.Fragment key={`text-${index}`}>
                    {formatTitleSection(part)}
                </React.Fragment>;
            }

            return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
        });
    };

    const disclaimer = locale === 'heb' ? 'כל הסקירות בעמוד נכתבו על ידי בינה' : 'All overviews on this page were written by an AI';

    return (
        <div className="mb-2 custom-scrollbar overflow-auto">
            <div className={`text-blue mb-5 ${locale === 'heb' ? 'frank-re text-lg' : 'font-["Geist"] text-base'}`}
                 style={locale === 'heb' ? { lineHeight: '1.4' } : {}}>
                <span className="font-mono font-normal text-base">{formattedTime}</span> {locale === 'heb' ? '⇠' : '⇢'} <span className={`${locale === 'heb' ? 'text-lg' : 'font-semibold text-base'}`}>{displayOverview.headline}</span>
                <CustomTooltip title={disclaimer} placement={locale === 'heb' ? 'top' : 'right'}>
                    <span className={`${locale === 'heb' ? 'mr-2' : 'ml-2'} align-middle cursor-help text-sm text-gray-400`} tabIndex={0}>⌨</span>
                </CustomTooltip>
            </div>

            {/* Gentle divider */}
            {/* <div className="w-[80%] mb-3 border-b border-gray-300" style={{height: '1px'}} /> */}

            {/* Overview Text */}
            <div className={`${locale == 'heb' ? 'frank-re text-base' : 'font-["Geist"] text-sm'} font-normal text-black whitespace-pre-wrap`} 
                 style={locale === 'heb' ? { lineHeight: '1.4' } : {lineHeight: '1.5'}}>
                {formatText(displayOverview.overview)}
            </div>
        </div>
    );
};
