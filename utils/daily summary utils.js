// Helper function to clean summary text by removing everything after language markers (exported for live summary headline in SEO)
export const cleanSummaryText = (text) => {
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

// Helper function to check if Hebrew content is available and valid
export const isHebrewContentAvailable = (dailySummary) => {
    if (!dailySummary) return false;
    
    const headlineHebrew = dailySummary.headlineHebrew;
    const summaryHebrew = dailySummary.summaryHebrew;
    
    // Check if Hebrew content exists and is not "Not applicable"
    const hasValidHeadline = headlineHebrew && 
        headlineHebrew.trim() !== '' && 
        !headlineHebrew.toLowerCase().includes('not applicable');
    
    const hasValidSummary = summaryHebrew && 
        summaryHebrew.trim() !== '' && 
        !summaryHebrew.toLowerCase().includes('not applicable');
    
    return hasValidHeadline || hasValidSummary;
};

export const getHeadline = (dailySummary, locale) => {
    let selectedHeadline;

    if (!dailySummary) {
        return '';
    }

    if (locale === 'heb') {
        selectedHeadline = dailySummary.headlineHebrew?.split('\n')[0] ||
            dailySummary.headline_option_1?.split('\n')[0] ||
            dailySummary.headline?.split('\n')[0] ||  // Final fallback
            dailySummary.hebrewHeadline?.split('\n')[0]; // Additional fallback
    } else if (locale === 'translated') {
        selectedHeadline = dailySummary.headlineLocal;
    } else {
        selectedHeadline = dailySummary.headline?.split('\n')[0];
    }

    // Clean the headline to remove language markers and everything after them
    return cleanSummaryText(selectedHeadline);
};

export const getSummaryContent = (dailySummary, locale) => {
    let rawContent;
    
    if (locale === 'heb') {
        rawContent = dailySummary.summaryHebrew ||
            dailySummary.summary ||
            dailySummary.summaryEnglish ||  // Final fallback
            dailySummary.hebrewSummary; // Additional fallback
    } else if (locale === 'translated') {
        rawContent = dailySummary.summary;
    } else {
        rawContent = dailySummary.summaryEnglish;
    }
    
    // Clean the content to remove language markers and everything after them
    return cleanSummaryText(rawContent);
};