'use client'

import { ArrowBackIosNew, ArrowForwardIos, SortByAlpha, Sort, CalendarMonth } from '@mui/icons-material';
import { IconButton, LinearProgress } from '@mui/material';
import InnerLink from '@/components/InnerLink';
import CustomTooltip from '@/components/CustomTooltip';
import { DateSelector } from '@/app/(localized)/[locale]/[country]/TopBar/settings/DateSelector';
import useMobile from '@/components/useMobile';

// Custom DateSelector for global archive with calendar icon
function GlobalDateSelector({ locale, currentDate }) {
    const { useRouter } = require('next/navigation');
    const router = useRouter();
    const { useState, useEffect, useRef } = require('react');
    const { DateCalendar, LocalizationProvider } = require('@mui/x-date-pickers');
    const { AdapterDateFns } = require('@mui/x-date-pickers/AdapterDateFns');
    
    const [open, setOpen] = useState(false);
    const [date, setLocalDate] = useState(currentDate);
    const [isNavigating, setIsNavigating] = useState(false);
    const calendarRef = useRef(null);

    // Handle clicking outside to close calendar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    const today = new Date();
    
    // Define minimum date (September 14, 2024)
    const minDate = new Date(2024, 8, 14); // Month is 0-indexed, so 8 = September

    const formatDateUrl = (date) => {
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    };

    const getDayUrl = (newDate) => {
        if (newDate < minDate || newDate > today) return null;
        return `/${locale}/global/history/${formatDateUrl(newDate)}`;
    };

    const calendarTooltipText = locale === 'heb' ? 'בחר תאריך' : 'Select date';

    return (
        <>
            {isNavigating && typeof window !== 'undefined' && require('react-dom').createPortal(
                <div className="fixed inset-0 w-full h-full z-[9999] pointer-events-auto">
                    <div className="absolute inset-0 bg-white bg-opacity-40 animate-pulse transition-all duration-200" />
                    <div className="fixed top-0 left-0 w-full">
                        <LinearProgress color="inherit" sx={{ opacity: 0.8, backgroundColor: 'white', height: '2px' }} />
                    </div>
                </div>,
                document.body
            )}
            <CustomTooltip title={calendarTooltipText} placement="top">
                <IconButton 
                    onClick={() => setOpen(!open)}
                    size="small" 
                    sx={{ 
                        padding: '4px',
                        color: '#666',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                    }}
                    aria-label={calendarTooltipText}
                >
                    <CalendarMonth sx={{ fontSize: '16px' }} />
                </IconButton>
            </CustomTooltip>

            {open && (
                <div ref={calendarRef} className="absolute top-full right-0 mt-2 z-10 bg-white shadow-lg direction-ltr">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateCalendar 
                            maxDate={today} 
                            minDate={minDate}
                            onChange={(date) => {
                                const url = getDayUrl(date);
                                if (url) {
                                    setIsNavigating(true);
                                    router.push(url);
                                }
                                setOpen(false);
                            }}
                            value={currentDate}
                            defaultValue={currentDate}
                            sx={{
                                '& .MuiPickersDay-root.Mui-selected': {
                                    backgroundColor: '#000 !important',
                                    color: '#fff !important',
                                    '&:hover': {
                                        backgroundColor: '#333 !important',
                                    },
                                },
                                '& .MuiPickersDay-root.Mui-selected.Mui-focusVisible': {
                                    backgroundColor: '#000 !important',
                                },
                                '& .MuiPickersCalendarHeader-root': {
                                    fontFamily: 'Geist, sans-serif',
                                },
                                '& .MuiPickersDay-root': {
                                    fontFamily: 'Geist, sans-serif',
                                },
                                '& .MuiPickersCalendarHeader-label': {
                                    fontFamily: 'Geist, sans-serif',
                                },
                                '& .MuiPickersCalendarHeader-switchViewButton': {
                                    fontFamily: 'Geist, sans-serif',
                                },
                                '& .MuiPickersArrowSwitcher-button': {
                                    fontFamily: 'Geist, sans-serif',
                                },
                                '& .MuiPickersCalendarHeader-weekDayLabel': {
                                    fontFamily: 'Geist, sans-serif !important',
                                },
                                '& .MuiDayCalendar-weekDayLabel': {
                                    fontFamily: 'Geist, sans-serif !important',
                                },
                                '& .MuiYearCalendar-root': {
                                    fontFamily: 'Geist, sans-serif !important',
                                },
                                '& .MuiPickersYear-yearButton': {
                                    fontFamily: 'Geist, sans-serif !important',
                                },
                                '& .MuiPickersYear-yearButton.Mui-selected': {
                                    backgroundColor: '#000 !important',
                                    color: '#fff !important',
                                    '&:hover': {
                                        backgroundColor: '#333 !important',
                                    },
                                },
                                '& .MuiPickersYear-yearButton.Mui-selected.Mui-focusVisible': {
                                    backgroundColor: '#000 !important',
                                },
                                fontFamily: 'Geist, sans-serif',
                            }}
                        />
                    </LocalizationProvider>
                </div>
            )}
        </>
    );
}

function DayNavigation({ locale, year, month, day, position = 'left' }) {
    const { isMobile } = useMobile();
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Calculate previous day
    const prevDay = new Date(currentDate);
    prevDay.setDate(currentDate.getDate() - 1);
    
    // Calculate next day  
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    
    // Define minimum date (September 14, 2024)
    const minDate = new Date(2024, 8, 14); // Month is 0-indexed, so 8 = September
    
    // Check if navigation days should be available based on current date and minimum date
    const today = new Date();
    const hasNextDay = nextDay <= today;
    const hasPrevDay = prevDay >= minDate;

    const formatDateUrl = (date) => {
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    };

    if (position === 'left') {
        if (!hasPrevDay) return null;
        const prevDayName = locale === 'heb' 
            ? `${String(prevDay.getDate()).padStart(2, '0')}.${String(prevDay.getMonth() + 1).padStart(2, '0')}.${prevDay.getFullYear()}`
            : prevDay.toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });
        return (
            <div className="flex items-center gap-2">
                <CustomTooltip title={prevDayName} placement="top">
                    <div>
                        <InnerLink 
                            href={`/${locale}/global/history/${formatDateUrl(prevDay)}`}
                            className="flex items-center"
                            aria-label={locale === 'heb' ? `עבור ליום הקודם: ${prevDayName}` : `Go to previous day: ${prevDayName}`}
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
        if (!hasNextDay) return null;
        const nextDayName = locale === 'heb' 
            ? `${String(nextDay.getDate()).padStart(2, '0')}.${String(nextDay.getMonth() + 1).padStart(2, '0')}.${nextDay.getFullYear()}`
            : nextDay.toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });
        return (
            <div className="flex items-center gap-2">
                {!isMobile && <div className="w-8 h-px bg-gray-300"></div>}
                <CustomTooltip title={nextDayName} placement="top">
                    <div>
                        <InnerLink 
                            href={`/${locale}/global/history/${formatDateUrl(nextDay)}`}
                            className="flex items-center"
                            aria-label={locale === 'heb' ? `עבור ליום הבא: ${nextDayName}` : `Go to next day: ${nextDayName}`}
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

export default function GlobalArchiveTopBar({ locale, year, month, day, dateString, isAlphabetical, setIsAlphabetical, currentDate }) {
    const { isMobile } = useMobile();
    const fullTitle = locale === 'heb'
        ? `ארכיון כותרות גלובלי ל־${dateString}`
        : `Global Headlines Archive for ${dateString}`;

    const handleSortToggle = () => {
        setIsAlphabetical(!isAlphabetical);
    };

    const sortTooltipText = isAlphabetical 
        ? (locale === 'heb' ? 'שנה סדר מדינות' : 'Switch to country order')
        : (locale === 'heb' ? 'שנה סדר מדינות' : 'Switch to alphabetical order');

    return (
        <nav className="sticky top-0 w-full bg-white z-50 py-1 direction-ltr border-b border-gray-200">
            <div className="px-4">
                <div className="flex items-center justify-between min-h-[40px]">
                    {/* Left: The Hear */}
                    <div className="flex items-center">
                        <div className="text-sm font-medium cursor-default hover:text-blue transition-colors font-['Geist']">The Hear</div>
                    </div>

                    {/* Center: Global • Date • Headlines Archive with Day Navigation on sides */}
                    <div className="flex items-center gap-2 flex-1 justify-center">
                        <DayNavigation {...{ locale, year, month, day }} position="left" />
                        <div className={`${locale === 'heb' ? 'frank-re text-right text-[16px]' : 'font-[\"Geist\"] text-left text-sm'} flex items-center gap-2`}>
                            <span className="text-sm">{fullTitle}</span>
                        </div>
                        <DayNavigation {...{ locale, year, month, day }} position="right" />
                    </div>

                    {/* Right: Sort Toggle and Date Selector */}
                    <div className="flex items-center gap-1">
                        <GlobalDateSelector locale={locale} currentDate={currentDate} />
                        <CustomTooltip title={sortTooltipText} placement="top">
                            <IconButton 
                                onClick={handleSortToggle}
                                size="small" 
                                sx={{ 
                                    padding: '4px',
                                    color: isAlphabetical ? '#666' : '#666',
                                    '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                    }
                                }}
                                aria-label={sortTooltipText}
                            >
                                {isAlphabetical ? 
                                    <SortByAlpha sx={{ fontSize: '16px' }} /> : 
                                    <Sort sx={{ fontSize: '16px' }} />
                                }
                            </IconButton>
                        </CustomTooltip>
                    </div>
                </div>
            </div>
        </nav>
    );
}
