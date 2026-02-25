'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { Search, ListFilter } from 'lucide-react';
import { CircularProgress } from '@mui/material';
import { getTypographyOptions } from '@/utils/typography/typography';
import { checkRTL } from '@/utils/utils';
import { useFont, useTranslate } from '@/utils/store';
import DateFilterMenu from './DateFilterMenu';
import CustomTooltip from '@/components/CustomTooltip';
import SearchResultItem from './SearchResultItem';
import { 
    generateSearchParamsKey, 
    getDatePresets, 
    generateAvailableMonths, 
    getDefaultSelectedMonths 
} from './SearchUtilities';

export default function SearchComponent({ locale, country }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [currentSearchTerm, setCurrentSearchTerm] = useState('');
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingPage, setIsLoadingPage] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedMonths, setSelectedMonths] = useState(() => getDefaultSelectedMonths());
    const [selectedContentTypes, setSelectedContentTypes] = useState(new Set(['headlines', 'summaries', 'dailysummaries']));
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [isUsingAdvancedFilter, setIsUsingAdvancedFilter] = useState(false);

    // Typography and translation hooks
    const translate = useTranslate((state) => state.translate);
    const font = useFont((state) => state.font);

    // Store consistent random fonts for each result
    const [resultFonts, setResultFonts] = useState({});
    
    // Client-side search results cache using ref to avoid dependency issues
    const searchCacheRef = useRef(new Map());

    // Date preset options for quick selection
    const datePresets = getDatePresets(locale);

    // Generate stable search parameters key for caching
    const searchParamsKey = useMemo(() => {
        return generateSearchParamsKey(searchTerm, selectedMonths, startDate, endDate, selectedContentTypes);
    }, [searchTerm, selectedMonths, startDate, endDate, selectedContentTypes]);

    // Archive search function with pagination
    const performSearch = useCallback(async (pageNum = 1) => {
        if (!searchParamsKey) return; // Early exit if no valid search key
        
        const term = searchTerm.trim();
        
        if (!term || term.length < 2) {
            setResults([]);
            setHasSearched(false);
            setCurrentPage(1);
            setPagination(null);
            setResultFonts({}); // Reset fonts for new search
            return;
        }

        if (pageNum === 1) {
            setIsLoading(true);
            setHasSearched(true);
            setResultFonts({}); // Reset fonts for new search
            setResults([]); // Clear previous results for new search
            setPagination(null); // Clear previous pagination
            setPageInput(''); // Clear page input field
        } else {
            setIsLoadingPage(true);
        }
        
        setError('');

        try {
            // Check cache first for this search
            const cacheKey = `${searchParamsKey}-page-${pageNum}`;
            const cachedResult = searchCacheRef.current.get(cacheKey);
            
            if (cachedResult) {
                console.log(`📋 Using cached results for page ${pageNum}`);
                
                // Use cached data
                setResults(cachedResult.results);
                setPagination(cachedResult.pagination);
                setCurrentPage(pageNum);
                setCurrentSearchTerm(term);
                
                // Restore fonts if page 1
                if (pageNum === 1 && cachedResult.resultFonts) {
                    setResultFonts(cachedResult.resultFonts);
                }
                
                return;
            }

            // Use monthly search with pagination (unified search)
            let searchUrl = `/api/search-monthly/${country}?q=${encodeURIComponent(term)}&searchIn=all&page=${pageNum}`;
            
            // Use month selection or date range
            if (startDate && endDate) {
                searchUrl += `&startDate=${startDate}&endDate=${endDate}`;
            } else if (selectedMonths.size > 0) {
                // Send specific months list instead of date range
                const monthsArray = Array.from(selectedMonths).sort();
                searchUrl += `&months=${encodeURIComponent(monthsArray.join(','))}`;
            }
            
            // Add content type filtering
            if (selectedContentTypes.size > 0 && selectedContentTypes.size < 3) {
                const contentTypesArray = Array.from(selectedContentTypes).sort();
                searchUrl += `&types=${encodeURIComponent(contentTypesArray.join(','))}`;
            }
            
            const response = await fetch(searchUrl);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Search failed');
            }

            const monthsInfo = startDate && endDate ? ` (${startDate} to ${endDate})` : 
                               selectedMonths.size > 0 ? ` (${selectedMonths.size} months selected)` : 
                               ' (recent 2 months default)';
            console.log(`Monthly search: Page ${pageNum}/${data.pagination?.totalPages || 1} - ${data.results.length} results for "${term}" in ${country}/all${monthsInfo} - scanned ${data.docsScanned || 0} docs`);

            // Initialize fonts variable for caching
            let newResultFonts = null;

            // Generate random fonts for each result (only for page 1 or if fonts don't exist)
            if (pageNum === 1) {
                newResultFonts = {};
                const localeCountry = locale === 'heb' ? 'israel' : 'us';
                const options = getTypographyOptions(localeCountry).options;
                
                data.results.forEach((result, index) => {
                    const searchKey = `${term}-${result.type}-${result.id}-${index}`;
                    
                    // Generate random fonts for this result
                    const randomIndex = Math.floor(Math.random() * options.length);
                    newResultFonts[searchKey] = options[randomIndex];
                    
                    // Handle direction mismatch
                    const headline = result.headline || result.title || '';
                    const isRTL = checkRTL(headline);
                    const typo = options[randomIndex];
                    
                    if ((typo.direction === 'rtl' && !isRTL) || (typo.direction === 'ltr' && isRTL)) {
                        const otherOptions = getTypographyOptions(isRTL ? 'israel' : 'us').options;
                        const dirKey = `${searchKey}-dir`;
                        const dirIndex = Math.floor(Math.random() * otherOptions.length);
                        newResultFonts[dirKey] = otherOptions[dirIndex];
                    }
                });

                setResultFonts(newResultFonts);
                setResults(data.results);
            } else {
                // For subsequent pages, append results (or replace if you prefer)
                setResults(data.results);
            }
            
            setCurrentSearchTerm(term);
            setPagination(data.pagination);
            setCurrentPage(pageNum);
            
            // Cache the result
            const cacheData = {
                results: data.results,
                pagination: data.pagination,
                resultFonts: newResultFonts // Will be null for pages other than 1
            };
            
            // Cache the result
            searchCacheRef.current.set(cacheKey, cacheData);
        } catch (err) {
            setError(err.message);
            setResults([]);
            setPagination(null);
        } finally {
            setIsLoading(false);
            setIsLoadingPage(false);
        }
    }, [searchParamsKey, country, locale, searchTerm, selectedMonths, startDate, endDate, selectedContentTypes]); // Include all dependencies

    // Function to handle page changes
    const handlePageChange = useCallback((newPage) => {
        if (newPage !== currentPage && !isLoadingPage) {
            performSearch(newPage);
        }
    }, [currentPage, isLoadingPage, performSearch]);

    // Date preset handler
    const handleDatePreset = useCallback((preset) => {
        const dates = preset.getValue();
        setStartDate(dates.start);
        setEndDate(dates.end);
    }, []);

    const clearDates = useCallback(() => {
        setStartDate('');
        setEndDate('');
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            performSearch(1);
        }
    }, [performSearch]);

    // Handle page input change
    const handlePageInputChange = useCallback((e) => {
        setPageInput(e.target.value);
    }, []);

    // Handle page input submission
    const handlePageInputSubmit = useCallback((e) => {
        e.preventDefault();
        const pageNum = parseInt(pageInput);
        if (pageNum && pageNum >= 1 && pageNum <= (pagination?.totalPages || 1)) {
            handlePageChange(pageNum);
            setPageInput(''); // Clear input after successful navigation
        }
    }, [pageInput, pagination?.totalPages, handlePageChange]);

    // Handle page input key press
    const handlePageInputKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handlePageInputSubmit(e);
        }
    }, [handlePageInputSubmit]);





    return (
        <div className="space-y-4">
            {/* Search Title */}
            <div className="text-sm underline underline-offset-4 font-bold mb-4 font-['Geist'] flex justify-start items-start">
                Search
            </div>

            {/* Search Input */}
            <div className="space-y-3">
                {/* Search Filter - moved above search box */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between overflow-x-auto">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 whitespace-nowrap">
                                {startDate && endDate ? (
                                    <div className="flex items-center gap-1">
                                        <span className={`text-xs px-2 py-1 rounded bg-gray-100 ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'}`}>
                                            {startDate} → {endDate}
                                        </span>
                                        <button
                                            onClick={() => {setStartDate(''); setEndDate('');}}
                                            className="text-xs text-gray-600 hover:text-black"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    (() => {
                                        // Generate all available months using utility function
                                        const allMonths = generateAvailableMonths(country);
                                        
                                        // Only show selected months if using advanced filter popover
                                        if (isUsingAdvancedFilter) {
                                            // Get the selected months data
                                            const selectedMonthsData = allMonths.filter(month => selectedMonths.has(month.key));
                                            
                                            return (
                                                <>
                                                    {selectedMonthsData.map(month => (
                                                        <button
                                                            key={month.key}
                                                            onClick={() => {
                                                                const newSelection = new Set(selectedMonths);
                                                                if (newSelection.has(month.key)) {
                                                                    newSelection.delete(month.key);
                                                                } else {
                                                                    newSelection.add(month.key);
                                                                }
                                                                setSelectedMonths(newSelection);
                                                            }}
                                                            className={`text-xs px-2 py-1 rounded font-mono ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'} ${
                                                                selectedMonths.has(month.key) 
                                                                    ? 'text-black bg-white' 
                                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                                            }`}
                                                        >
                                                            {month.month.toString().padStart(2, '0')}/{month.year.toString().slice(2)} ({month.monthName})
                                                        </button>
                                                    ))}
                                                </>
                                            );
                                        } else {
                                            // Show responsive number of months based on screen size
                                            // 7 for screens larger than 1920px (fhd), 6 for 1920px (xl), 4 for smaller screens
                                            const visibleMonths = allMonths.slice(0, 7);
                                            
                                            return (
                                                <>
                                                    {visibleMonths.map((month, index) => (
                                                        <button
                                                            key={month.key}
                                                            onClick={() => {
                                                                const newSelection = new Set(selectedMonths);
                                                                if (newSelection.has(month.key)) {
                                                                    newSelection.delete(month.key);
                                                                } else {
                                                                    newSelection.add(month.key);
                                                                }
                                                                setSelectedMonths(newSelection);
                                                            }}
                                                            className={`text-xs px-2 py-1 rounded font-mono ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'} ${
                                                                selectedMonths.has(month.key) 
                                                                    ? 'text-blue bg-white' 
                                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                                                            } ${
                                                                // Show progressively more months: 4 on small, 6 on xl (1920px), 8 on fhd (larger than 1920px)
                                                                index >= 4 ? 'hidden xl:inline-block' : ''
                                                            } ${
                                                                // Show months 6-7 only on fhd screens (1920px+)
                                                                index >= 6 ? 'hidden fhd:inline-block' : ''
                                                            }`}
                                                        >
                                                            {month.month.toString().padStart(2, '0')}/{month.year.toString().slice(2)} ({month.monthName})
                                                        </button>
                                                    ))}
                                                </>
                                            );
                                        }
                                    })()
                                )}
                                
                                {selectedMonths.size === 0 && !startDate && !endDate && (
                                    <span className={`text-xs text-black bg-red-50 px-2 py-1 rounded ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}>
                                        {locale === 'heb' ? 'לא נבחרו חודשים' : 'choose a range'}
                                    </span>
                                )}
                                
                                {/* Content type indicators */}
                                {selectedContentTypes.size < 3 && (
                                    <div className="flex items-center gap-1">
                                        <span className={`text-xs text-gray-600 ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}>
                                            {(() => {
                                                const contentLabels = {
                                                    'headlines': locale === 'heb' ? 'כותרות' : 'Headlines',
                                                    'summaries': locale === 'heb' ? 'סקירות' : 'Overviews',
                                                    'dailysummaries': locale === 'heb' ? 'יומיים' : 'Days'
                                                };
                                                const selectedLabels = Array.from(selectedContentTypes).map(key => contentLabels[key]).join(', ');
                                                return selectedLabels;
                                            })()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <CustomTooltip title="Filter search">
                            <button
                                onClick={() => setShowDateFilter(true)}
                                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                            >
                                <ListFilter size={14} />
                            </button>
                        </CustomTooltip>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyPress={handleKeyPress}
                            placeholder={locale === 'heb' ? 'הקלידו מילות חיפוש...' : 'Type search terms...'}
                            className={`w-full pl-10 mb-4 shadow-lg text-sm pr-4 py-3 rounded-sm ${locale === 'heb' ? 'text-right frank-re' : 'font-["Geist"]'}`}
                            dir={locale === 'heb' ? 'rtl' : 'ltr'}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={() => performSearch(1)}
                        disabled={isLoading || searchTerm.trim().length < 2}
                        className={`px-6 py-3 bg-gray-600 text-white mb-4 rounded-xs text-sm hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'} flex items-center gap-2`}
                    >
                        {isLoading ? (
                            <>
                                <CircularProgress size={16} sx={{ color: 'white' }} />
                                {locale === 'heb' ? 'מחפש...' : 'Searching...'}
                            </>
                        ) : (
                            <>
                                <Search size={16} />
                                {locale === 'heb' ? 'חפש' : 'search'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="text-center py-4 text-gray-600 text-xs">
                    <p className={locale === 'heb' ? 'frank-re' : 'font-mono'}>
                        {locale === 'heb' ? 'שגיאה בחיפוש' : 'Search error'}: {error}
                    </p>
                </div>
            )}

            {/* No Results */}
            {hasSearched && !isLoading && !error && results.length === 0 && searchTerm.trim().length >= 2 && (
                <div>
                    <div className="text-center text-xs pt-2 text-gray-500">
                        <p className={locale === 'heb' ? 'frank-re' : 'font-mono'}>
                            {locale === 'heb' 
                                ? `לא נמצאו תוצאות עבור "${searchTerm}"`
                                : `No results found for "${searchTerm}"`
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-4">
                    {/* Results header with count and pagination info */}
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <p className={`text-xs text-gray-600 ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}>
                            {pagination ? (
                                locale === 'heb' 
                                    ? `${pagination.totalResults.toLocaleString()} תוצאות • עמוד ${pagination.page}/${pagination.totalPages}`
                                    : `${pagination.totalResults.toLocaleString()} results • Page ${pagination.page}/${pagination.totalPages}`
                            ) : (
                                locale === 'heb' 
                                    ? `נמצאו ${results.length} תוצאות`
                                    : `Found ${results.length} results`
                            )}
                        </p>
                        
                        {/* Pagination controls */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!pagination.hasPrevPage || isLoadingPage}
                                    className={`px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}
                                >
                                    {locale === 'heb' ? 'הקודם' : 'Previous'}
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={pageInput}
                                        onChange={handlePageInputChange}
                                        onKeyPress={handlePageInputKeyPress}
                                        placeholder={currentPage.toString()}
                                        min="1"
                                        max={pagination.totalPages}
                                        className={`w-12 px-2 py-1 text-xs text-center border border-gray-300 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}
                                        disabled={isLoadingPage}
                                    />
                                    <span className={`text-xs text-gray-500 ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}>
                                        / {pagination.totalPages}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination.hasNextPage || isLoadingPage}
                                    className={`px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}
                                >
                                    {isLoadingPage ? (
                                        <CircularProgress size={12} sx={{ color: 'gray' }} />
                                    ) : (
                                        locale === 'heb' ? 'הבא' : 'Next'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Results list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.map((result, index) => (
                            <SearchResultItem
                                key={`${result.type}-${result.id}-${index}`}
                                result={result}
                                index={index}
                                locale={locale}
                                country={country}
                                currentSearchTerm={currentSearchTerm}
                                resultFonts={resultFonts}
                            />
                        ))}
                    </div>

                    {/* Bottom pagination controls for convenience */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-end items-center pt-2">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!pagination.hasPrevPage || isLoadingPage}
                                    className={`px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}
                                >
                                    {locale === 'heb' ? 'הקודם' : 'Previous'}
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={pageInput}
                                        onChange={handlePageInputChange}
                                        onKeyPress={handlePageInputKeyPress}
                                        placeholder={currentPage.toString()}
                                        min="1"
                                        max={pagination.totalPages}
                                        className={`w-12 px-2 py-1 text-xs text-center border border-gray-300 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}
                                        disabled={isLoadingPage}
                                    />
                                    <span className={`text-xs text-gray-500 ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}>
                                        / {pagination.totalPages}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination.hasNextPage || isLoadingPage}
                                    className={`px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${locale === 'heb' ? 'frank-re' : 'font-mono'}`}
                                >
                                    {isLoadingPage ? (
                                        <CircularProgress size={12} sx={{ color: 'gray' }} />
                                    ) : (
                                        locale === 'heb' ? 'הבא' : 'Next'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Date Filter Menu */}
            <DateFilterMenu
                open={showDateFilter}
                close={() => setShowDateFilter(false)}
                locale={locale}
                country={country}
                selectedMonths={selectedMonths}
                setSelectedMonths={(months) => {
                    setSelectedMonths(months);
                    setIsUsingAdvancedFilter(true);
                }}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                selectedContentTypes={selectedContentTypes}
                setSelectedContentTypes={setSelectedContentTypes}
            />
        </div>
    );
}