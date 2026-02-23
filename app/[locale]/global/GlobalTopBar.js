'use client';

import Clock from "@/components/Clock";
import { useEffect, useRef, useState } from 'react';
import { useGlobalSort } from "@/utils/store";
import CustomTooltip from "@/components/CustomTooltip";
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterCountries from './FilterCountries';
import useMobile from "@/components/useMobile";

export default function GlobalTopBar({ locale }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [expandAll, setExpandAll] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const sortDropdownRef = useRef(null);
    const { globalSort, setGlobalSort, setAllExpanded, filteredCountries } = useGlobalSort();
    const { isMobile } = useMobile();

    const sortOptions = [
        { label: "AI", value: "ai", title: "An AI reads and sorts the headlines, acting as a live editor" },
        { label: "Cohesion", value: "cohesion", title: "Sorts headlines by the degree the different sources agree on what the main story is" },
        { label: "Recency", value: "recency", title: "Sorts countries by most recent headline activity" },
        { label: "Population", value: "population", title: "Sorts countries by population size" },
        { label: "Soft Power", value: "softPower", title: "Sorts countries according to Brand Finance's 'Soft Power Index'" },
        { label: "Press Freedom", value: "pressFreedom", title: "Sorts countries according to the World Press Freedom Index by RSF" },
    ];

    const handleSortChange = (sortType) => {
        setGlobalSort(sortType);
        setDropdownOpen(false);
    };

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!sortDropdownRef.current) return;
            if (!sortDropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    const toggleExpandAll = () => {
        const newExpandState = !expandAll;
        setExpandAll(newExpandState);
        setAllExpanded(newExpandState);
    };

    return (
        <>
            <nav className="sticky top-0 w-full bg-white z-50 border-b border-gray-200 py-1 direction-ltr">
                <div className="w-full mx-auto px-5">
                    <div className="flex items-center h-10 relative">
                        {/* Site Title with Geist font */}
                        <div className="flex-1">
                            <div className="text-sm font-medium cursor-default hover:text-blue transition-colors font-['Geist']">The Hear</div>
                        </div>

                        {/* Center: Clock - absolutely positioned for perfect centering */}
                        <div className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${locale === 'heb' ? 'ml-[10px]' : 'ml-[-10px]'}`}>
                            <Clock locale={locale} />
                        </div>

                        {/* Sorting Options Dropdown */}
                        <div className="flex-1 flex items-center justify-end gap-2">
                            <div className="relative" ref={sortDropdownRef}>
                                <button 
                                    type="button"
                                    className={`px-2 py-1 text-xs ${globalSort ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 hover:bg-gray-200'} rounded-md transition-colors font-['Geist'] flex items-center gap-1`}
                                    onClick={() => setDropdownOpen(prev => !prev)}
                                >
                                    <span className="mr-1">Sort by </span>
                                    <span className="font-medium">
                                        {sortOptions.find(option => option.value === globalSort)?.label || "SORT"}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-sm shadow-lg z-50">
                                        <div className="p-2">
                                            <div className="flex flex-col divide-y divide-gray-100">
                                                {sortOptions.map((sortOption) => (
                                                    <button
                                                        key={sortOption.value}
                                                        type="button"
                                                        onClick={() => handleSortChange(sortOption.value)}
                                                        className={`flex flex-col py-2 px-3 hover:bg-gray-50 cursor-pointer ${globalSort === sortOption.value ? 'bg-gray-100' : ''}`}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className="text-xs font-['Geist']">{sortOption.label}</span>
                                                            {globalSort === sortOption.value && (
                                                                <span className="h-2 w-2 rounded-full bg-blue"></span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 mt-1">{sortOption.title}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!isMobile && (
                                <>
                                    <CustomTooltip title={expandAll ? "Collapse all overviews" : "Expand all overviews"}>
                                        <button
                                            onClick={toggleExpandAll}
                                            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
                                        >
                                            {expandAll ?
                                                <UnfoldLessIcon style={{ fontSize: '1.1rem' }} /> :
                                                <UnfoldMoreIcon style={{ fontSize: '1.1rem' }} />
                                            }
                                        </button>
                                    </CustomTooltip>
                                    {/* Filter Button */}
                                    <CustomTooltip title="Filter countries">
                                        <button
                                            onClick={() => setFilterOpen(true)}
                                            className={`p-1 rounded-full text-gray-500 hover:bg-gray-100 relative ${filteredCountries.length > 0 ? 'text-blue-600' : ''}`}
                                        >
                                            <FilterListIcon style={{ fontSize: '1.1rem' }} />
                                            {filteredCountries.length > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                                    {filteredCountries.length}
                                                </span>
                                            )}
                                        </button>
                                    </CustomTooltip>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            
            {/* Filter Countries Modal */}
            <FilterCountries 
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                locale={locale}
            />
        </>
    );
}
