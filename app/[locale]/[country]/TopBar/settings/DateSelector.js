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
import { useRouter } from "next/navigation";
import { createDateString } from '@/utils/utils';
import { LinearProgress } from "@mui/material";
import { getCountryLaunchDate } from "@/utils/launchDates";


export function DateSelector({ locale, country }) {
    const { date } = useTime()
    const [open, setOpen] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 })
    const router = useRouter()
    const calendarRef = useRef(null)
    const triggerRef = useRef(null)

    const updateCalendarPosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setCalendarPosition({
            top: rect.bottom + 8,
            left: rect.left,
        });
    };

    // Handle clicking outside to close calendar
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedInsideCalendar = calendarRef.current && calendarRef.current.contains(event.target);
            const clickedInsideTrigger = triggerRef.current && triggerRef.current.contains(event.target);
            if (!clickedInsideCalendar && !clickedInsideTrigger) {
                setOpen(false);
            }
        };

        if (open) {
            updateCalendarPosition();
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('resize', updateCalendarPosition);
            window.addEventListener('scroll', updateCalendarPosition, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', updateCalendarPosition);
            window.removeEventListener('scroll', updateCalendarPosition, true);
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
    const minDate = getCountryLaunchDate(country);

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
                <div ref={triggerRef} className="flex items-center gap-1 relative" style={{ direction: 'ltr' }}>
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
                </div>
            </LabeledContent>
            {open && typeof window !== 'undefined' && createPortal(
                <div
                    ref={calendarRef}
                    className="fixed z-[9999] bg-white shadow-lg direction-ltr"
                    style={{ top: `${calendarPosition.top}px`, left: `${calendarPosition.left}px` }}
                >
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
                </div>,
                document.body
            )}
        </>
    );
}
