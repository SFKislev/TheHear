/**
 * SearchUtilities.js
 * Pure utility functions for search functionality
 * - Date formatting functions
 * - Text processing (highlighting, snippets)
 * - Search parameter generation
 * - Date presets and month logic
 */

import React from 'react';
import { getCountryLaunchDate } from '@/utils/launchDates';

// Date formatting functions
export const formatDate = (timestamp, locale) => {
    if (!timestamp) return '';
    
    // Handle different timestamp formats
    let date;
    if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
    } else if (timestamp.seconds) {
        // Firestore timestamp format
        date = new Date(timestamp.seconds * 1000);
    } else {
        return 'Invalid Date';
    }
    
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    
    return locale === 'heb' 
        ? date.toLocaleDateString('he-IL')
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (timestamp, locale) => {
    if (!timestamp) return '';
    
    // Handle different timestamp formats
    let date;
    if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
    } else if (timestamp.seconds) {
        // Firestore timestamp format
        date = new Date(timestamp.seconds * 1000);
    } else {
        return 'Invalid Date';
    }
    
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    
    const dateStr = locale === 'heb' 
        ? date.toLocaleDateString('he-IL')
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
    const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    
    return `${dateStr} ${timeStr}`;
};

export const formatDailyOverviewDate = (timestamp, locale) => {
    if (!timestamp) return '';
    
    // Handle different timestamp formats
    let date;
    if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
    } else if (timestamp.seconds) {
        // Firestore timestamp format
        date = new Date(timestamp.seconds * 1000);
    } else {
        return 'Invalid Date';
    }
    
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    
    // Subtract one day for daily overviews (they cover the day before they were saved)
    const dayBefore = new Date(date);
    dayBefore.setDate(dayBefore.getDate() - 1);
    
    // Return only date, no time
    return locale === 'heb' 
        ? dayBefore.toLocaleDateString('he-IL')
        : dayBefore.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const getRelativeTime = (timestamp, locale) => {
    if (!timestamp) return '';
    
    // Handle different timestamp formats
    let date;
    if (timestamp instanceof Date) {
        date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
    } else if (timestamp.seconds) {
        // Firestore timestamp format
        date = new Date(timestamp.seconds * 1000);
    } else {
        return '';
    }
    
    if (isNaN(date.getTime())) {
        return '';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return locale === 'heb' ? 'היום' : 'today';
    } else if (diffDays === 1) {
        return locale === 'heb' ? 'אתמול' : '1 day ago';
    } else {
        return locale === 'heb' ? `${diffDays} ימים` : `${diffDays} days ago`;
    }
};

// Text processing functions
export const highlightSearchTerms = (text, searchTerm) => {
    if (!text || !searchTerm) return text;
    
    // Split search term into words and escape special regex characters
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
    
    if (searchWords.length === 0) return text;
    
    // Create regex pattern that matches any of the search words (case insensitive)
    const escapedWords = searchWords.map(word => 
        word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    
    // Split text by the pattern and wrap matches in highlight spans
    const parts = text.split(pattern);
    
    return parts.map((part, index) => {
        if (pattern.test(part)) {
            return (
                <mark key={index} className="bg-gray-300 rounded">
                    {part}
                </mark>
            );
        }
        return part;
    });
};

export const createContextSnippet = (text, searchTerm, maxLength = 150) => {
    if (!text || !searchTerm) return text;
    
    // Split search term into words
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
    
    if (searchWords.length === 0) return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
    
    // Find the first occurrence of any search word
    let firstMatchIndex = -1;
    let firstMatchWord = '';
    
    for (const word of searchWords) {
        const index = text.toLowerCase().indexOf(word.toLowerCase());
        if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
            firstMatchIndex = index;
            firstMatchWord = word;
        }
    }
    
    if (firstMatchIndex === -1) {
        // No match found, return beginning of text
        return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
    
    // Calculate the start and end positions for the snippet
    const wordLength = firstMatchWord.length;
    const halfLength = Math.floor(maxLength / 2);
    
    let start = Math.max(0, firstMatchIndex - halfLength);
    let end = Math.min(text.length, firstMatchIndex + wordLength + halfLength);
    
    // Adjust if we're near the beginning or end
    if (start === 0) {
        end = Math.min(text.length, maxLength);
    } else if (end === text.length) {
        start = Math.max(0, text.length - maxLength);
    }
    
    // Extract the snippet
    let snippet = text.slice(start, end);
    
    // Add ellipsis if needed
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
};

// Search parameter generation
export const generateSearchParamsKey = (searchTerm, selectedMonths, startDate, endDate, selectedContentTypes) => {
    const term = searchTerm.trim();
    if (!term || term.length < 2) return null;
    
    const monthsKey = selectedMonths.size > 0 ? Array.from(selectedMonths).sort().join(',') : '';
    const dateKey = startDate && endDate ? `${startDate}-${endDate}` : '';
    const contentTypesKey = selectedContentTypes && selectedContentTypes.size > 0 && selectedContentTypes.size < 3 ? Array.from(selectedContentTypes).sort().join(',') : '';
    
    return `${term}|${monthsKey}|${dateKey}|${contentTypesKey}`;
};

// Date preset options
export const getDatePresets = (locale) => [
    { 
        label: locale === 'heb' ? 'השבוע האחרון' : 'Last Week',
        getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 7);
            return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
        }
    },
    { 
        label: locale === 'heb' ? 'החודש האחרון' : 'Last Month',
        getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
        }
    },
    { 
        label: locale === 'heb' ? '3 חודשים אחרונים' : 'Last 3 Months',
        getValue: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 90);
            return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
        }
    }
];

// Country launch dates for month generation
// Generate available months for a country
export const generateAvailableMonths = (country) => {
    const launchDate = getCountryLaunchDate(country);
    const now = new Date();
    
    const months = [];
    let currentDate = new Date(launchDate.getFullYear(), launchDate.getMonth(), 1);
    const endOfAvailableMonths = new Date(now.getFullYear(), now.getMonth(), 1);
    
    while (currentDate <= endOfAvailableMonths) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        months.push({
            key: monthKey,
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            monthName: currentDate.toLocaleDateString('en', { month: 'short' })
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months.reverse();
};

// Initialize default selected months (recent 2 months)
export const getDefaultSelectedMonths = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    return new Set([currentMonth, lastMonthKey]);
};
