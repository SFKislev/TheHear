'use client';

import { useState, useEffect } from 'react';
import { Calendar, X, Check } from 'lucide-react';
import PopUpCleaner from "@/components/PopUp";
import { getCountryLaunchDate } from "@/utils/launchDates";

export default function DateFilterMenu({ 
    open, 
    close, 
    locale, 
    country, 
    selectedMonths, 
    setSelectedMonths,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedContentTypes,
    setSelectedContentTypes
}) {
    const [tempSelectedMonths, setTempSelectedMonths] = useState(new Set(selectedMonths));
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);
    const [tempSelectedContentTypes, setTempSelectedContentTypes] = useState(new Set(selectedContentTypes || ['headlines', 'summaries', 'dailysummaries']));

    useEffect(() => {
        if (open) {
            setTempSelectedMonths(new Set(selectedMonths));
            setTempStartDate(startDate);
            setTempEndDate(endDate);
            setTempSelectedContentTypes(new Set(selectedContentTypes || ['headlines', 'summaries', 'dailysummaries']));
        }
    }, [open, selectedMonths, startDate, endDate, selectedContentTypes]);

    if (!open) return null;

    const launchDate = getCountryLaunchDate(country);
    const now = new Date();
    
    // Generate available months
    const months = [];
    let currentDate = new Date(launchDate.getFullYear(), launchDate.getMonth(), 1);
    const endOfAvailableMonths = new Date(now.getFullYear(), now.getMonth(), 1);

    while (currentDate <= endOfAvailableMonths) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        months.push({
            key: monthKey,
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            monthName: currentDate.toLocaleDateString('en', { month: 'short' }),
            fullName: currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Group by year
    const yearGroups = months.reduce((groups, month) => {
        if (!groups[month.year]) {
            groups[month.year] = [];
        }
        groups[month.year].push(month);
        return groups;
    }, {});

    const handleMonthToggle = (monthKey) => {
        const newSelection = new Set(tempSelectedMonths);
        if (newSelection.has(monthKey)) {
            newSelection.delete(monthKey);
        } else {
            newSelection.add(monthKey);
        }
        setTempSelectedMonths(newSelection);
        // Clear date selections when months are selected
        setTempStartDate('');
        setTempEndDate('');
    };

    const handleApply = () => {
        setSelectedMonths(tempSelectedMonths);
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        setSelectedContentTypes(tempSelectedContentTypes);
        close();
    };

    const selectedCount = tempSelectedMonths.size;

    return (
        <>
            <div className="fixed inset-0 z-[9998] bg-black bg-opacity-25" style={{ top: '-50px' }} onClick={close} />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none" style={{ top: '40px', left: 0, right: 0, bottom: 0 }}>
                <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-200 pointer-events-auto max-w-md w-full mx-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />
                            <h3 className={`font-medium ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'}`}>
                                {locale === 'heb' ? 'סינון זמן' : 'Advanced Filters'}
                            </h3>
                        </div>
                        <button
                            onClick={close}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Month grid */}
                        <div className="max-h-64 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
                            {Object.keys(yearGroups).reverse().map(year => (
                                <div key={year} className="mb-3">
                                    <div className={`font-medium text-sm text-gray-800 mb-2 ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'}`}>
                                        {year}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {yearGroups[year].map(month => (
                                            <button
                                                key={month.key}
                                                onClick={() => handleMonthToggle(month.key)}
                                                className={`flex items-center justify-center px-3 py-2 text-xs rounded-md transition-colors ${
                                                    tempSelectedMonths.has(month.key)
                                                        ? 'bg-white text-black border border-gray-100 shadow-lg'
                                                        : 'bg-gray-100 border border-gray-100 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className="font-mono mr-1">
                                                    {month.month.toString().padStart(2, '0')}
                                                </span>
                                                <span className="text-[10px] text-gray-500">
                                                    ({month.monthName})
                                                </span>
                                                {tempSelectedMonths.has(month.key) && (
                                                    <Check size={12} className="ml-1" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Date range inputs */}
                        <div className="border-t pt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`block text-xs font-medium text-gray-700 mb-1 ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'}`}>
                                        {locale === 'heb' ? 'מתאריך' : 'From date'}
                                    </label>
                                    <input
                                        type="date"
                                        value={tempStartDate}
                                        onChange={(e) => {
                                            setTempStartDate(e.target.value);
                                            // Clear month selections when dates are selected
                                            setTempSelectedMonths(new Set());
                                        }}
                                        className={`w-full px-3 py-2 border rounded-md text-sm font-mono ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'}`}
                                        style={{
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-xs font-medium text-gray-700 mb-1 ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'}`}>
                                        {locale === 'heb' ? 'עד תאריך' : 'To date'}
                                    </label>
                                    <input
                                        type="date"
                                        value={tempEndDate}
                                        onChange={(e) => {
                                            setTempEndDate(e.target.value);
                                            // Clear month selections when dates are selected
                                            setTempSelectedMonths(new Set());
                                        }}
                                        className={`w-full px-3 py-2 border rounded-md text-sm font-mono ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'}`}
                                        style={{
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content type filters */}
                        <div className="border-t pt-4">
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { key: 'headlines', label: locale === 'heb' ? 'כותרות' : 'Headlines' },
                                    { key: 'summaries', label: locale === 'heb' ? 'סקירות' : 'Overviews' },
                                    { key: 'dailysummaries', label: locale === 'heb' ? 'יומיים' : 'Days' }
                                ].map(contentType => (
                                    <button
                                        key={contentType.key}
                                        onClick={() => {
                                            const newSelection = new Set(tempSelectedContentTypes);
                                            if (newSelection.has(contentType.key)) {
                                                newSelection.delete(contentType.key);
                                            } else {
                                                newSelection.add(contentType.key);
                                            }
                                            setTempSelectedContentTypes(newSelection);
                                        }}
                                        className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                                            tempSelectedContentTypes.has(contentType.key)
                                                ? contentType.key === 'dailysummaries' 
                                                    ? 'bg-off-white text-black shadow-lg'
                                                    : contentType.key === 'summaries'
                                                        ? 'bg-gray-200 shadow-lg'
                                                        : 'bg-white text-black border border-gray-100 shadow-lg'
                                                : 'bg-gray-100 border border-gray-100 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="font-mono text-xs">
                                            {contentType.label}
                                        </span>
                                        {tempSelectedContentTypes.has(contentType.key) && (
                                            <Check size={14} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-6">
                        <div className={`text-xs text-gray-500 font-mono ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'}`}>
                            {(() => {
                                const parts = [];
                                if (selectedCount > 0) {
                                    parts.push(locale === 'heb' 
                                        ? `${selectedCount} חודשים נבחרו`
                                        : `${selectedCount} months selected`
                                    );
                                }
                                if (tempStartDate && tempEndDate) {
                                    parts.push(`${tempStartDate} → ${tempEndDate}`);
                                }
                                if (tempSelectedContentTypes.size < 3) {
                                    const contentLabels = {
                                        'headlines': locale === 'heb' ? 'כותרות' : 'Headlines',
                                        'summaries': locale === 'heb' ? 'סקירות' : 'Overviews', 
                                        'dailysummaries': locale === 'heb' ? 'יומיים' : 'Days'
                                    };
                                    const selectedLabels = Array.from(tempSelectedContentTypes).map(key => contentLabels[key]).join(', ');
                                    parts.push(selectedLabels);
                                }
                                return parts.length > 0 ? parts.join(' • ') : (locale === 'heb' ? 'לא נבחרו חודשים' : 'no months selected');
                            })()}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleApply}
                                className={`px-4 py-2 text-sm bg-gray-600 text-white hover:bg-gray-800 hover:shadow-lg ${locale === 'heb' ? 'frank-re' : 'font-["Geist"]'}`}
                            >
                                {locale === 'heb' ? 'החל' : 'Apply'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
