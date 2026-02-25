/**
 * SearchResultItem.js
 * Component for rendering individual search result items
 * - Result content processing
 * - Typography and styling logic
 * - Source information display
 * - Link generation
 */

import Link from 'next/link';
import { Calendar, ExternalLink } from 'lucide-react';
import { createDateString } from '@/utils/utils';
import { getWebsiteName, getSourceData } from '@/utils/sources/getCountryData';
import { getHeadline } from '@/utils/daily summary utils';
import { getTypographyOptions } from '@/utils/typography/typography';
import { checkRTL } from '@/utils/utils';
import { formatDate, formatDateTime, formatDailyOverviewDate, getRelativeTime, highlightSearchTerms, createContextSnippet } from './SearchUtilities';

// Get result content based on type
export const getResultContent = (result, locale, currentSearchTerm) => {
    // For headlines, show headline and subtitle
    if (result.type === 'headlines') {
        return {
            title: result.headline || '',
            subtitle: result.searchContext || result.subtitle || '',
            link: result.link
        };
    }
    
    // For daily summaries, show proper daily title using getHeadline utility
    if (result.type === 'dailysummaries' || result.type === 'daily') {
        const headline = getHeadline(result, locale);
        
        return {
            title: headline || (locale === 'heb' ? 'סקירת יום' : 'Daily Overview'),
            subtitle: result.searchContext || (result.summary ? createContextSnippet(result.summary, currentSearchTerm) : ''),
            link: null
        };
    }
    
    // For regular summaries, show appropriate headline based on locale
    let headline = '';
    if (locale === 'heb' && result.hebrewHeadline) {
        headline = result.hebrewHeadline;
    } else if (result.englishHeadline) {
        headline = result.englishHeadline;
    } else if (result.translatedHeadline) {
        headline = result.translatedHeadline;
    }
    
    return {
        title: headline || (locale === 'heb' ? 'סקירה' : 'Summary'),
        subtitle: result.searchContext || (result.summary ? createContextSnippet(result.summary, currentSearchTerm) : ''),
        link: null
    };
};

// Get source name for headlines
export const getSourceName = (result, country) => {
    if (result.type === 'headlines' && result.website_id) {
        const sourceName = getWebsiteName(country, result.website_id);
        const sourceData = getSourceData(country, sourceName);
        return sourceData ? sourceData.name : sourceName;
    }
    return null;
};

// Get source domain for favicons
export const getSourceDomain = (result) => {
    if (result.type === 'headlines' && result.link) {
        try {
            if (result.link && typeof result.link === 'string' && 
                (result.link.startsWith('http://') || result.link.startsWith('https://'))) {
                return new URL(result.link).hostname.replace('www.', '');
            }
        } catch (error) {
            console.error('Invalid URL:', result.link);
        }
    }
    return null;
};

// Get result type label
export const getResultTypeLabel = (type, locale) => {
    if (locale === 'heb') {
        switch (type) {
            case 'headlines': return 'כותרת';
            case 'summaries': return 'סקירה';
            case 'dailysummaries': 
            case 'daily': return 'סיכום יומי';
            default: return `תוצאה (${type})`;
        }
    }
    
    switch (type) {
        case 'headlines': return 'Headline';
        case 'summaries': return 'The Hear Overview';
        case 'dailysummaries':
        case 'daily': return 'The Hear Daily Overview';
        default: return `Result (${type})`;
    }
};

// Generate result link
export const getResultLink = (result, locale, country) => {
    // Helper function to safely create a Date object
    const createDateFromTimestamp = (timestamp) => {
        if (!timestamp) return null;
        
        try {
            if (timestamp instanceof Date) {
                return new Date(timestamp);
            } else if (timestamp.seconds) {
                // Firestore timestamp format
                return new Date(timestamp.seconds * 1000);
            } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
                return new Date(timestamp);
            }
        } catch (error) {
            console.error('Error parsing timestamp:', timestamp, error);
        }
        return null;
    };

    // For headlines, use the timestamp directly
    if (result.type === 'headlines') {
        const date = createDateFromTimestamp(result.timestamp);
        if (date && !isNaN(date.getTime())) {
            return `/${locale}/${country}/${createDateString(date)}`;
        }
    }
    
    // For daily summaries/overviews, use the actual date (not day before)
    if (result.type === 'dailysummaries' || result.type === 'daily') {
        let date = null;
        
        // Try different date fields
        if (result.date) {
            date = createDateFromTimestamp(result.date);
        } else if (result.timestamp) {
            date = createDateFromTimestamp(result.timestamp);
        }
        
        if (date && !isNaN(date.getTime())) {
            // Use the actual date, not day before
            return `/${locale}/${country}/${createDateString(date)}`;
        }
    }
    
    // For ongoing summaries, link to the date they were created
    if (result.type === 'summaries') {
        const date = createDateFromTimestamp(result.timestamp);
        if (date && !isNaN(date.getTime())) {
            return `/${locale}/${country}/${createDateString(date)}`;
        }
    }
    
    // Fallback to main page
    return `/${locale}/${country}`;
};

// Get typography for result with pre-generated fonts
export const getTypographyForResult = (result, index, currentSearchTerm, resultFonts, locale) => {
    const content = getResultContent(result, locale, currentSearchTerm);
    const headline = content.title;
    const isRTL = checkRTL(headline);
    
    // Use locale to determine typography options instead of country
    const localeCountry = locale === 'heb' ? 'israel' : 'us';
    const options = getTypographyOptions(localeCountry).options;
    
    // Create the search key to retrieve the pre-generated font
    const searchKey = `${currentSearchTerm}-${result.type}-${result.id}-${index}`;
    
    let typo = resultFonts[searchKey];
    
    // Fallback in case font wasn't pre-generated
    if (!typo) {
        const randomIndex = Math.floor(Math.random() * options.length);
        typo = options[randomIndex];
    }
    
    // Check for direction mismatch
    const dirKey = `${searchKey}-dir`;
    if (resultFonts[dirKey]) {
        typo = resultFonts[dirKey];
    }

    // Scale down font size to 0.8 of original
    const scaledTypography = {
        ...typo,
        fontSize: typo.fontSize ? `calc(${typo.fontSize} * 0.8)` : '1.75rem'
    };

    return scaledTypography;
};

// Main SearchResultItem component
export default function SearchResultItem({ 
    result, 
    index, 
    locale, 
    country, 
    currentSearchTerm, 
    resultFonts 
}) {
    const content = getResultContent(result, locale, currentSearchTerm);
    const resultLink = getResultLink(result, locale, country);
    const sourceName = getSourceName(result, country);
    const sourceDomain = getSourceDomain(result);
    
    return (
        <div key={`${result.type}-${result.id}-${index}`} className={`border border-gray-100 shadow-lg rounded-xs p-4 hover:bg-white flex flex-col h-full ${
            result.type === 'dailysummaries' || result.type === 'daily' 
                ? 'bg-off-white hover:shadow-xl' 
                : result.type === 'summaries' 
                    ? 'bg-gray-200 hover:shadow-xl border-gray-200' 
                    : ''
        }`}>
            <div className="flex-1 min-w-0">
                {/* Result type, source, and date */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {result.type !== 'headlines' && (
                        <span className={`text-xs px-2 py-1 rounded font-mono ${
                            result.type === 'dailysummaries' || result.type === 'daily' 
                                ? 'bg-amber-100 text-yellow-800' 
                                : result.type === 'summaries' 
                                    ? 'bg-gray-100 text-blue' 
                                    : 'bg-gray-100'
                        }`}>
                            {getResultTypeLabel(result.type, locale)}
                        </span>
                    )}
                    {sourceName && (
                        <>
                            {result.type !== 'headlines' && <span className="text-xs text-gray-400">•</span>}
                            <div className={`flex items-center gap-1 text-xs bg-blue-100 text-blue-800 py-1 rounded font-mono ${result.type === 'headlines' ? 'pl-0' : 'px-2'}`}>
                                {sourceDomain && (
                                    <img
                                        src={`https://www.google.com/s2/favicons?sz=64&domain=${sourceDomain}`}
                                        width={12}
                                        height={12}
                                        alt=""
                                        style={{ verticalAlign: 'middle' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                        onLoad={(e) => {
                                            e.target.style.display = 'inline';
                                        }}
                                    />
                                )}
                                {sourceName}
                            </div>
                        </>
                    )}
                    {result.timestamp && (
                        <>
                            <span className={`text-xs text-gray-400 ${result.type === 'headlines' ? 'ml-1' : ''}`}>•</span>
                            <span className={`text-xs text-gray-500 font-mono ${locale === 'heb' ? '' : ''}`}>
                                {(result.type === 'dailysummaries' || result.type === 'daily') 
                                    ? formatDailyOverviewDate(result.timestamp, locale)
                                    : formatDateTime(result.timestamp, locale)
                                }
                                <span className="text-gray-500 ml-1">
                                    • {getRelativeTime(result.timestamp, locale)}
                                </span>
                            </span>
                        </>
                    )}
                </div>
                    
                {/* Result title */}
                {content.title && (
                    <Link href={resultLink}>
                        <h3 
                            className="font-medium text-black hover:text-blue-600 cursor-pointer mb-2 text-base mt-4 line-clamp-4"
                            style={{ 
                                ...getTypographyForResult(result, index, currentSearchTerm, resultFonts, locale), 
                                width: '100%', 
                                direction: checkRTL(content.title) ? 'rtl' : 'ltr'
                            }}
                        >
                            {highlightSearchTerms(content.title, currentSearchTerm)}
                        </h3>
                    </Link>
                )}
                
                {/* Result subtitle/summary */}
                {content.subtitle && (
                    <p className={`text-gray-600 mb-4 ${locale === 'heb' ? 'frank-re text-sm' : 'font-["Geist"] text-xs'}`}>
                        {highlightSearchTerms(content.subtitle, currentSearchTerm)}
                    </p>
                )}
            </div>
            
            {/* Action links footer */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <Link 
                    href={resultLink}
                    className={`inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}
                >
                    <Calendar size={12} />
                    {locale === 'heb' ? 'צפה בדף' : 'Archived Page'}
                </Link>
                
                {/* External link for headlines */}
                {result.type === 'headlines' && content.link && (
                    <a 
                        href={content.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}
                    >
                        <ExternalLink size={12} />
                        {locale === 'heb' ? 'מקור מקורי' : 'Source'}
                    </a>
                )}
            </div>
        </div>
    );
}
