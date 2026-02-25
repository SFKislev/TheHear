'use client'

import { useState, useEffect } from 'react';
import CustomTooltip from "@/components/CustomTooltip";

// Helper function to clean summary text by removing everything after language markers
const cleanSummaryText = (text) => {
    if (!text) return '';
    
    const markers = ['HEBREWSUMMARY:', 'LOCALSUMMARY:', 'SUMMARY:'];
    let cleanText = text;
    
    for (const marker of markers) {
        const markerIndex = text.indexOf(marker);
        if (markerIndex !== -1) {
            cleanText = text.substring(0, markerIndex).trim();
            break;
        }
    }
    
    return cleanText;
};

export default function SummaryCard({ summary, locale, type, countryTimezone }) {
    const [hasPrevious, setHasPrevious] = useState(false);
    const [hasNext, setHasNext] = useState(false);

    const summaryContent = locale === 'heb'
        ? cleanSummaryText(summary.hebrewSummary || summary.summary || summary.translatedSummary)
        : cleanSummaryText(summary.summary || summary.translatedSummary || summary.hebrewSummary);

    // User's local time
    const userTimestamp = summary.timestamp ?
        (summary.timestamp.getHours() < 10 ? '0' : '') + summary.timestamp.getHours() + ':' +
        (summary.timestamp.getMinutes() < 10 ? '0' : '') + summary.timestamp.getMinutes()
        : '';

    // Country's local time
    let countryTimestamp = userTimestamp;
    if (summary.timestamp && countryTimezone) {
        try {
            countryTimestamp = new Intl.DateTimeFormat('en-US', {
                timeZone: countryTimezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(summary.timestamp);
        } catch (e) {
            countryTimestamp = userTimestamp;
        }
    }

    // Show both times if they're different
    const timestamp = countryTimestamp === userTimestamp
        ? countryTimestamp
        : `${countryTimestamp} (${userTimestamp})`;

    const fontClass = locale === 'heb' ? 'frank-re' : 'font-["Geist"]';
    const disclaimer = locale === 'heb' ? 'סקירה זו נכתבה בידי בינה' : 'This overview was written by an AI';
    const arrowIcon = locale === 'heb' ? '⇠' : '⇢';

    // Extract headline from summary data (matching Summary.js)
    let headline = cleanSummaryText(summary.englishHeadline);
    if (locale === 'heb') {
        headline = cleanSummaryText(summary.hebrewHeadline || summary.headline);
    }

    // Parse content for parenthesis text styling
    const parts = summaryContent.split(/(\(.*?\))/g);

    // Check for previous/next summaries after component mounts
    useEffect(() => {
        const checkNavigation = () => {
            const summaryCards = document.querySelectorAll('[data-summary-card]');
            const currentCard = document.querySelector(`[data-summary-id="${summary.timestamp?.getTime()}"]`);

            if (summaryCards.length > 1 && currentCard) {
                setHasPrevious(currentCard !== summaryCards[0]);
                setHasNext(currentCard !== summaryCards[summaryCards.length - 1]);
            }
        };

        // Check immediately and also after a short delay to ensure DOM is ready
        checkNavigation();
        const timeoutId = setTimeout(checkNavigation, 100);

        return () => clearTimeout(timeoutId);
    }, [summary.timestamp]);

    // Function to scroll to next summary card
    const scrollToNextSummary = () => {
        // Find all summary cards in the feed
        const summaryCards = document.querySelectorAll('[data-summary-card]');
        const currentCard = document.querySelector(`[data-summary-id="${summary.timestamp?.getTime()}"]`);

        if (currentCard && summaryCards.length > 0) {
            // Find current card index
            let currentIndex = -1;
            summaryCards.forEach((card, index) => {
                if (card === currentCard) {
                    currentIndex = index;
                }
            });

            // Scroll to next summary card (or first one if at the end)
            const nextIndex = currentIndex < summaryCards.length - 1 ? currentIndex + 1 : 0;
            const nextCard = summaryCards[nextIndex];

            if (nextCard) {
                nextCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    };

    // Function to scroll to previous summary card
    const scrollToPreviousSummary = () => {
        // Find all summary cards in the feed
        const summaryCards = document.querySelectorAll('[data-summary-card]');
        const currentCard = document.querySelector(`[data-summary-id="${summary.timestamp?.getTime()}"]`);

        if (currentCard && summaryCards.length > 0) {
            // Find current card index
            let currentIndex = -1;
            summaryCards.forEach((card, index) => {
                if (card === currentCard) {
                    currentIndex = index;
                }
            });

            // Scroll to previous summary card (or last one if at the beginning)
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : summaryCards.length - 1;
            const prevCard = summaryCards[prevIndex];

            if (prevCard) {
                prevCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    };
    
    return (
        <article
            className={`${fontClass} leading-none font-normal bg-white rounded-sm border border-gray-500 p-6 text-justify relative`}
            data-summary-card
            data-summary-id={summary.timestamp?.getTime()}
        >
            {/* Navigation chevron at top - only show if there are previous summaries */}
            {hasPrevious && (
                <div className="flex justify-center mb-2 -mt-2">
                    <button
                        onClick={scrollToPreviousSummary}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                        title={locale === 'heb' ? 'גלול לסיכום הקודם' : 'Scroll to previous summary'}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="18,15 12,9 6,15"></polyline>
                        </svg>
                    </button>
                </div>
            )}

            {/* Title with timestamp - h3 for SEO hierarchy */}
            <h3 className={`mb-2 ${locale === 'heb' ? 'text-[17px]' : 'text-base'} font-medium text-black`}
                style={{
                    lineHeight: '1.5',
                    marginBottom: '10px',
                    marginTop: 0,
                }}
            >
                <span className="font-mono text-sm">{timestamp}</span>
                <span className="mx-1">{arrowIcon}</span>
                <span>{headline}</span>
            </h3>

            {/* Summary content with inline disclaimer */}
            <div className={`${locale === 'heb' ? 'text-base' : 'text-sm'} text-gray-800`} style={{ lineHeight: '1.5' }}>
                <CustomTooltip title={disclaimer} placement={locale === 'heb' ? 'top' : 'right'}>
                    <span className={`${locale === 'heb' ? 'pl-2' : 'pr-2'} align-middle cursor-help text-sm text-gray-600`} tabIndex={0}>⌨</span>
                </CustomTooltip>
                {parts.map((part, i) => (
                    <span key={i} className={part.startsWith('(') ? `text-gray-400 ${locale === 'heb' ? 'text-xs' : 'text-xs'}` : ''}>
                        {part}
                    </span>
                ))}
            </div>

            {/* Navigation chevron at bottom - only show if there are next summaries */}
            {hasNext && (
                <div className="flex justify-center mt-2 -mb-2">
                    <button
                        onClick={scrollToNextSummary}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                        title={locale === 'heb' ? 'גלול לסיכום הבא' : 'Scroll to next summary'}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                    </button>
                </div>
            )}
        </article>
    );
}

