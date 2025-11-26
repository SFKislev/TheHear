'use client'

import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import InnerLink from '@/components/InnerLink';
import ArchiveCountryNavigator from './ArchiveCountryNavigator';
import { countries } from '@/utils/sources/countries';
import CustomTooltip from '@/components/CustomTooltip';
import useMobile from '@/components/useMobile';

function MonthNavigation({ country, locale, year, month, monthName, position = 'left' }) {
    const { isMobile } = useMobile();
    const currentMonth = parseInt(month);
    const currentYear = parseInt(year);
    
    // Calculate previous month
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Calculate next month  
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    
    // Check if navigation months should be available based on launch dates and current date
    const today = new Date();
    const nextMonthDate = new Date(nextYear, nextMonth - 1, 1);
    const hasNextMonth = nextMonthDate <= today;

    if (position === 'left') {
        const prevMonthName = new Date(prevYear, prevMonth - 1).toLocaleDateString(locale === 'heb' ? 'he' : 'en', { month: 'long', year: 'numeric' });
        return (
            <div className="flex items-center gap-2">
                <CustomTooltip title={prevMonthName} placement="top">
                    <div>
                        <InnerLink 
                            href={`/${locale}/${country}/history/${prevYear}/${prevMonth.toString().padStart(2, '0')}`}
                            className="flex items-center"
                            aria-label={locale === 'heb' ? `עבור לחודש הקודם: ${prevMonthName}` : `Go to previous month: ${prevMonthName}`}
                        >
                            <IconButton 
                                size="small" 
                                sx={{ padding: '2px' }}
                            >
                                <ArrowBackIosNew sx={{ fontSize: '14px' }} />
                            </IconButton>
                        </InnerLink>
                    </div>
                </CustomTooltip>
                {!isMobile && <div className="w-8 h-px bg-gray-300"></div>}
            </div>
        );
    } else {
        if (!hasNextMonth) return null;
        const nextMonthName = new Date(nextYear, nextMonth - 1).toLocaleDateString(locale === 'heb' ? 'he' : 'en', { month: 'long', year: 'numeric' });
        return (
            <div className="flex items-center gap-2">
                {!isMobile && <div className="w-8 h-px bg-gray-300"></div>}
                <CustomTooltip title={nextMonthName} placement="top">
                    <div>
                        <InnerLink 
                            href={`/${locale}/${country}/history/${nextYear}/${nextMonth.toString().padStart(2, '0')}`}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                            aria-label={locale === 'heb' ? `עבור לחודש הבא: ${nextMonthName}` : `Go to next month: ${nextMonthName}`}
                        >
                            <IconButton 
                                size="small" 
                                sx={{ padding: '2px' }}
                            >
                                <ArrowForwardIos sx={{ fontSize: '14px' }} />
                            </IconButton>
                        </InnerLink>
                    </div>
                </CustomTooltip>
            </div>
        );
    }
}

export default function ArchiveTopBar({ country, locale, year, month, monthName }) {
    const { isMobile } = useMobile();
    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew : countryData.english;
    const fullTitle = locale === 'heb' 
        ? `ארכיון חדשות ${countryName} - ${monthName}`
        : `${countryName} News Archive - ${monthName}`;

    return (
        <nav className="sticky top-0 w-full bg-white z-50 py-1 direction-ltr border-b border-gray-200">
            <div className="px-4">
                <div className="flex items-center justify-between min-h-[40px]">
                    {/* Left: The Hear */}
                    <div className="flex items-center">
                        <div className="text-sm font-medium cursor-default hover:text-blue transition-colors font-['Geist']">The Hear</div>
                    </div>

                    {/* Center: Flag • Month/Year • Headlines Archive with Navigation on sides */}
                    <div className="flex items-center gap-2 flex-1 justify-center">
                        <MonthNavigation {...{ country, locale, year, month, monthName }} position="left" />
                        <ArchiveCountryNavigator country={country} locale={locale} year={year} month={month} />
                        <h1 className={`${locale === 'heb' ? 'frank-re text-right text-[16px]' : 'font-[\"Geist\"] text-left text-sm'} flex items-center gap-2`}>
                            <span>{countryName}</span>
                            <span className="text-gray-400">•</span>
                            <span>{new Date(year, month - 1).toLocaleDateString(locale === 'heb' ? 'he' : 'en', { month: 'long' })}, {year}</span>
                            {!isMobile && (
                                <>
                                    <span className="text-gray-400">•</span>
                                    <span>{locale === 'heb' ? 'ארכיון כותרות' : 'Headlines Archive'}</span>
                                </>
                            )}
                        </h1>
                        <MonthNavigation {...{ country, locale, year, month, monthName }} position="right" />
                    </div>

                    {/* Right: Empty space for balance */}
                    <div className="flex items-center">
                        <div className="text-sm font-medium cursor-default hover:text-blue transition-colors font-['Geist'] opacity-0">The Hear</div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
