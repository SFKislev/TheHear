'use client'

import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { add, sub } from "date-fns";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LabeledContent } from "@/components/LabeledIcon";
import { useTime } from "@/utils/store";
import { useRouter, usePathname } from "next/navigation";
import { createDateString } from '@/utils/utils';
import { LinearProgress } from "@mui/material";
import InnerLink from "@/components/InnerLink";

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


export function DateSelector({ locale, country }) {
    const { date, setDate } = useTime()
    const [open, setOpen] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const calendarRef = useRef(null)

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
            }
            window.addEventListener('popstate', handleRouteChange);
            return () => {
                window.removeEventListener('popstate', handleRouteChange);
            }
        }
    }, [isNavigating]);

    const day = date.toDateString();
    const today = new Date()
    const isToday = day == today.toDateString()

    const todayDate = new Date(day);
    const dateString = todayDate.toLocaleDateString("en-GB")
        .slice(0, 8)
        .replace(/(\d{2})$/, todayDate.getFullYear().toString().slice(2))
        const label = isToday ? <span className="font-geist">Today</span> : `${Math.floor((today - todayDate) / (1000 * 60 * 60 * 24))} days ago`;

    const yesterday = sub(todayDate, { days: 1 });
    const tomorrow = isToday ? null : add(todayDate, { days: 1 });

    // Get the minimum date for this country (when data became available)
    const minDate = countryLaunchDates[country] || new Date('2024-07-04'); // fallback to earliest date

    const setDay = (newDate) => {
        setIsNavigating(true);
        router.push(`/${locale}/${country}/${createDateString(newDate)}`);
        // if (newDate) {
        //     newDate.setHours(date.getHours(), date.getMinutes())
        //     setDate(newDate);
        // }
    }

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
            <LabeledContent label={<span dir="ltr">{label}</span>} clickable={false} tooltip="select date">
                <div className="flex items-center gap-1 relative" style={{ direction: 'ltr' }}>
                    <>
                        <IconButton
                            size="small"
                            onClick={() => setDay(yesterday)}
                            disabled={!yesterday || isNavigating}
                            sx={{ padding: '2px' }}
                        >
                            <ArrowBackIosNew fontSize="small" sx={{ fontSize: '0.8rem' }} />
                        </IconButton>
                        <div className="cursor-pointer font-mono text-[0.8rem] text-gray-500"
                            onClick={() => setOpen(p => !p)}>
                            {dateString}
                        </div>
                        <IconButton
                            size="small"
                            onClick={() => setDay(tomorrow)}
                            disabled={!tomorrow || isNavigating}
                            sx={{ padding: '2px' }}
                        >
                            <ArrowForwardIos fontSize="small" sx={{ fontSize: '0.8rem' }} />
                        </IconButton>
                    </>

                    {open && (
                        <div ref={calendarRef} className="absolute top-full left-0 mt-2 z-10 bg-white shadow-lg direction-ltr">
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateCalendar 
                                    maxDate={today} 
                                    minDate={minDate}
                                    onChange={(date) => {
                                        setDay(date);
                                        setOpen(false);
                                    }}
                                    value={date}
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
                    )}
                </div>
            </LabeledContent>
        </>
    );
}