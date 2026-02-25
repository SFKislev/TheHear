'use client'

import { useState, useEffect } from 'react';
import { countries } from "@/utils/sources/countries";
import { useGlobalSort, useGlobalCountryCohesion } from "@/utils/store";
import FlagIcon from "@/components/FlagIcon";
import useFirebase from "@/utils/database/useFirebase";
import CustomTooltip from "@/components/CustomTooltip";

export default function FilterCountries({ isOpen, onClose, locale }) {
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
    const { filteredCountries, toggleCountryFilter, setFilteredCountries } = useGlobalSort();
    const globalCountryCohesion = useGlobalCountryCohesion(state => state.globalCountryCohesion);
    const [countrySummaries, setCountrySummaries] = useState({});
    const [sortBy, setSortBy] = useState('country'); // 'country', 'cohesion', 'timestamp'
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'
    const firebase = useFirebase();

    // Helper function to get country display name - always English
    const getCountryDisplayName = (country) => {
        return countries[country].english;
    };

    // Helper function to get headline from summary - always English
    const getHeadlineFromSummary = (summary) => {
        if (!summary) return 'No recent headlines';
        return summary.englishHeadline || summary.headline || 'No recent headlines';
    };

    // Helper function to format cohesion value
    const formatCohesion = (cohesion) => {
        if (cohesion === undefined || cohesion === null) return '—';
        return (cohesion * 100).toFixed(0) + '%';
    };

    // Cohesion Progress Bar Component
    const CohesionBar = ({ cohesion, country }) => {
        if (cohesion === undefined || cohesion === null) {
            return <span className="text-xs text-gray-400">—</span>;
        }
        
        const percentage = Math.round(cohesion * 100);
        const barColor = percentage >= 70 ? 'bg-green-600' : percentage >= 40 ? 'bg-gray-500' : 'bg-gray-400';
        
        return (
            <CustomTooltip title="The share of sources that agree about the main story">
                <div className="flex items-center gap-2 cursor-help">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${barColor}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-gray-500 font-mono min-w-[28px]">
                        {percentage}%
                    </span>
                </div>
            </CustomTooltip>
        );
    };

    // Sorting function
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    // Sort countries based on current sort criteria
    const getSortedCountries = () => {
        const countryList = Object.keys(countries);
        
        return countryList.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'country':
                    aValue = getCountryDisplayName(a).toLowerCase();
                    bValue = getCountryDisplayName(b).toLowerCase();
                    break;
                case 'cohesion':
                    aValue = globalCountryCohesion[a] || 0;
                    bValue = globalCountryCohesion[b] || 0;
                    break;
                case 'timestamp':
                    aValue = coerceDate(countrySummaries[a]?.timestamp)?.getTime() || 0;
                    bValue = coerceDate(countrySummaries[b]?.timestamp)?.getTime() || 0;
                    break;
                default:
                    return 0;
            }
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Sort icon component
    const SortIcon = ({ column }) => {
        if (sortBy !== column) {
            return <span className="text-gray-300">↕</span>;
        }
        return <span className="text-gray-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
    };

    // Fetch summaries for all countries
    useEffect(() => {
        if (!firebase.db || !isOpen) return;

        const unsubscribers = [];
        const summaries = {};

        Object.keys(countries).forEach(country => {
            const unsubscribe = firebase.subscribeToSummaries(country, (newSummaries) => {
                if (newSummaries && newSummaries[0]) {
                    summaries[country] = newSummaries[0];
                    setCountrySummaries({ ...summaries });
                }
            });
            unsubscribers.push(unsubscribe);
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [firebase.db, isOpen]);

    // Save filtered countries to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('filteredCountries', JSON.stringify(filteredCountries));
    }, [filteredCountries]);

    const handleSelectAll = () => {
        const allCountries = Object.keys(countries);
        if (filteredCountries.length === 0) {
            // If none are filtered (all visible), hide all
            setFilteredCountries(allCountries);
        } else {
            // Show all countries
            setFilteredCountries([]);
        }
    };

    const allVisible = filteredCountries.length === 0;
    const someVisible = filteredCountries.length > 0 && filteredCountries.length < Object.keys(countries).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="bg-white rounded-xs max-w-xl w-full max-h-[40vh] mx-4 overflow-hidden shadow-xl border border-gray-300 direction-ltr"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="pt-2"></div>
                <div className="max-h-[calc(40vh-1rem)] overflow-y-auto px-2">
                    <table className="w-full">
                        <thead className="bg-white sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <CustomTooltip title={allVisible ? "Hide all countries" : "Show all countries"}>
                                        <input
                                            type="checkbox"
                                            checked={allVisible}
                                            ref={(el) => {
                                                if (el) el.indeterminate = someVisible;
                                            }}
                                            onChange={handleSelectAll}
                                            className="rounded cursor-pointer"
                                        />
                                    </CustomTooltip>
                                </th>
                                <th 
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Geist'] cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('country')}
                                >
                                    <div className="flex items-center gap-1">
                                        Country
                                        <SortIcon column="country" />
                                    </div>
                                </th>
                                <th 
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Geist'] cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('timestamp')}
                                >
                                    <div className="flex items-center gap-1">
                                        Current Headline
                                        <SortIcon column="timestamp" />
                                    </div>
                                </th>
                                <th 
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Geist'] cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('cohesion')}
                                >
                                    <CustomTooltip title="Measures to degree to which different sources in the country agree on what the main story is. Higher means more unified.">
                                        <div className="flex items-center gap-1 cursor-help">
                                            Cohesion
                                            <SortIcon column="cohesion" />
                                        </div>
                                    </CustomTooltip>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {getSortedCountries().map((country) => {
                                const isVisible = !filteredCountries.includes(country);
                                const summary = countrySummaries[country];
                                const headline = getHeadlineFromSummary(summary);
                                const cohesion = globalCountryCohesion[country];

                                return (
                                    <tr key={country} className={`hover:bg-gray-50 ${!isVisible ? 'opacity-50' : ''}`}>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <CustomTooltip title={isVisible ? `Hide ${getCountryDisplayName(country)}` : `Show ${getCountryDisplayName(country)}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isVisible}
                                                    onChange={() => toggleCountryFilter(country)}
                                                    className="rounded cursor-pointer"
                                                />
                                            </CustomTooltip>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <FlagIcon country={country} />
                                                <span className="text-sm font-medium text-gray-900 font-['Geist']">
                                                    {getCountryDisplayName(country)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-900 font-['Geist'] flex-1">
                                                    {headline}
                                                </span>
                                {summary && (
                                                    <span className="text-xs text-gray-500 whitespace-nowrap font-mono">
                                                        {coerceDate(summary.timestamp)?.toLocaleTimeString('en-GB', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: false
                                                        }) || '—'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            <CohesionBar cohesion={cohesion} country={country} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="pb-2"></div>
            </div>
        </div>
    );
} 
