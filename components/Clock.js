'use client'

import { useEffect, useState, useRef } from "react";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useRouter, usePathname } from "next/navigation";
import { createDateString } from '@/utils/utils';
import { LinearProgress } from "@mui/material";
import { createPortal } from "react-dom";

// Per-country launch dates - actual dates when data became available
const countryLaunchDates = {
    'israel': new Date('2024-07-04'),
    'germany': new Date('2024-07-28'),
    'us': new Date('2024-07-31'),
    'italy': new Date('2024-08-28'),
    'russia': new Date('2024-08-29'),
    'iran': new Date('2024-08-29'),
    'france': new Date('2024-08-29'),
    'lebanon': new Date('2024-08-29'),
    'poland': new Date('2024-08-30'),
    'uk': new Date('2024-09-05'),
    'india': new Date('2024-09-05'),
    'ukraine': new Date('2024-09-05'),
    'spain': new Date('2024-09-05'),
    'netherlands': new Date('2024-09-05'),
    'china': new Date('2024-09-06'),
    'japan': new Date('2024-09-07'),
    'turkey': new Date('2024-09-07'),
    'uae': new Date('2024-09-08'),
    'palestine': new Date('2024-09-10'),
    'finland': new Date('2025-02-20')
};

export default function Clock({locale, date, country}) {
    const [displayDate, setDisplayDate] = useState(date);
    const [open, setOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const calendarRef = useRef(null);

    useEffect(()=>{
        if (date) setDisplayDate(date);
        else {
            setDisplayDate(new Date());
            const interval = setInterval(() => {
                setDisplayDate(new Date());
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [date]);

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

    // Reset loading state when route change is complete
    useEffect(() => {
        if (isNavigating) {
            const handleRouteChange = () => {
                setIsNavigating(false);
            };
            window.addEventListener('popstate', handleRouteChange);
            return () => {
                window.removeEventListener('popstate', handleRouteChange);
            }
        }
    }, [isNavigating]);

    if (!displayDate) return null;

    const isPresent = Math.abs(new Date() - displayDate) < 300000;

    const hours = displayDate.getHours();
    const minutes = displayDate.getMinutes();

    // Format date as dd.mm.yyyy when not present
    const dateString = !isPresent ? 
        displayDate.toLocaleDateString("en-GB", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) : '';

    const paddingClass = locale === 'heb' ? 'pr-3' : 'pl-0';
    const blinkClass = isPresent ? 'timer-blink' : '';
    const notPresentClass = !isPresent ? 'text-gray-600 underline underline-offset-4 font-medium' : '';
    const clickableClass = !isPresent && country ? 'cursor-pointer' : '';

    const today = new Date();
    const minDate = country ? (countryLaunchDates[country] || new Date('2024-07-04')) : new Date('2024-07-04');

    const handleDateChange = (newDate) => {
        if (country && pathname) {
            setIsNavigating(true);
            router.push(`/${locale}/${country}/${createDateString(newDate)}`);
            setOpen(false);
        }
    };

    return (
        <>
            {isNavigating && typeof window !== 'undefined' && createPortal(
                <div className="fixed inset-0 w-full h-full z-[9999] pointer-events-auto">
                    <div className="absolute inset-0 bg-white bg-opacity-40 animate-pulse transition-all duration-200" />
                    <div className="fixed top-0 left-0 w-full">
                        <LinearProgress color="inherit" sx={{ opacity: 0.8, backgroundColor: 'white', height: '2px' }} />
                    </div>
                </div>,
                document.body
            )}
            <div className={`h-full flex items-center justify-center font-mono text-sm direction-ltr ${paddingClass} ${notPresentClass} ${clickableClass} relative`}
                 onClick={(e) => {
                     if (!isPresent && country) {
                         // Don't toggle if clicking inside the calendar popup
                         if (calendarRef.current && calendarRef.current.contains(e.target)) {
                             return;
                         }
                         setOpen(!open);
                     }
                 }}>
                <span>{hours.toString().padStart(2, '0')}</span>
                <span className={blinkClass}>:</span>
                <span>{minutes.toString().padStart(2, '0')}</span>
                {!isPresent && <span className="ml-2">{dateString}</span>}
                
                {open && country && typeof window !== 'undefined' && createPortal(
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 z-[99998] bg-black/20"
                            onClick={() => setOpen(false)}
                        />
                        {/* Centered Calendar */}
                        <div 
                            ref={calendarRef} 
                            className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div 
                                className="bg-white shadow-xl rounded-lg direction-ltr pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DateCalendar 
                                        maxDate={today} 
                                        minDate={minDate}
                                        onChange={handleDateChange}
                                        value={displayDate}
                                        sx={{
                                            fontFamily: "monospace",
                                            '& *': {
                                                fontFamily: "monospace !important"
                                            },
                                            '& .MuiPickersCalendarHeader-root': {
                                                fontFamily: "monospace"
                                            },
                                            '& .MuiPickersDay-root': {
                                                fontFamily: "monospace"
                                            },
                                            '& .MuiPickersCalendarHeader-label': {
                                                fontFamily: "monospace"
                                            },
                                            '& .MuiPickersCalendarHeader-switchViewButton': {
                                                fontFamily: "monospace"
                                            },
                                            '& .MuiDayCalendar-weekDayLabel': {
                                                fontFamily: "monospace"
                                            },
                                            '& .MuiPickersYear-yearButton': {
                                                fontFamily: "monospace",
                                                fontSize: '0.8rem'
                                            },
                                            '& .MuiPickersYear-yearButton.Mui-selected': {
                                                backgroundColor: 'black',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'black'
                                                }
                                            },
                                            '& .MuiPickersDay-root.Mui-selected': {
                                                backgroundColor: 'black',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'black'
                                                }
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </div>
                        </div>
                    </>,
                    document.body
                )}
            </div>
        </>
    )
}