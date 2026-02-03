'use client'

import { KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp, PlayArrow, Pause, Speed } from "@mui/icons-material";
import { IconButton, Slider, styled } from "@mui/material";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import ResetTimerButton from "./Slider/ResetTimerButton";
import PlaySpeedPopup from "./Slider/PlaySpeedPopup";
import { useTime } from "@/utils/store";
import { useDaySummaries } from "@/utils/database/useSummariesManager";
import { CustomSlider_Source } from "./Source/SourceSlider";
import useMobile from "@/components/useMobile";
import { redirect } from "next/navigation";
import { createDateString } from "@/utils/utils";
import CustomTooltip from "@/components/CustomTooltip";
import { trackTimeExploration } from "@/utils/analytics";

export default function SideSlider({ locale, country, pageDate }) {
    const summaries = useDaySummaries(state => state.daySummaries);
    const date = useTime(state => state.date);
    const setDate = useTime(state => state.setDate);
    const setManualDate = useTime(state => state.setManualDate);
    const lastManualInteractionAt = useTime(state => state.lastManualInteractionAt);
    const { isMobile } = useMobile();
    const [isPlaying, setIsPlaying] = useState(false);
    const [playSpeed, setPlaySpeed] = useState(4); // Speed multiplier (1x, 2x, 4x, 8x, 16x)
    const [isSpeedPopupOpen, setIsSpeedPopupOpen] = useState(false);
    const intervalRef = useRef(null);
    const lastProcessedPageDateRef = useRef(null);

    // Force English behavior on mobile
    const effectiveLocale = isMobile ? 'en' : locale;

    // Only show play functionality for date pages (not live pages)
    // pageDate is undefined for live pages, and a Date object for date pages
    const isDatePage = pageDate !== undefined && pageDate !== null;

    // Handler for play button with tracking
    const handlePlayToggle = useCallback(() => {
        const newPlayState = !isPlaying;
        setIsPlaying(newPlayState);

        // Track when user starts playing (not when pausing)
        if (newPlayState) {
            trackTimeExploration('play', {
                country,
                locale,
                is_date_page: isDatePage,
                play_speed: playSpeed
            });
        }
    }, [isPlaying, country, locale, isDatePage, playSpeed]);

    // Derive day from date directly, no useEffect needed
    const day = date ? date.toDateString() : new Date().toDateString();

    useEffect(() => {
        // Only run this effect when pageDate actually changes
        if (pageDate === lastProcessedPageDateRef.current) {
            return;
        }
        lastProcessedPageDateRef.current = pageDate;

        if (pageDate) {
            // Check if user has already selected a specific time on this date
            const currentDate = date;
            const isSameDay = currentDate && currentDate.toDateString() === pageDate.toDateString();

            if (isSameDay && currentDate.getHours() !== 16) {
                // User has already selected a specific time, preserve it
                return;
            }

            const newDate = new Date(pageDate);
            newDate.setHours(16, 0, 0, 0); // Default to 16:00 for date pages
            setDate(newDate);
        } else {
            setDate(new Date())
        }
    }, [pageDate, setDate]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (isDatePage) return;
        const manualHoldActive = () => (
            lastManualInteractionAt &&
            Date.now() - lastManualInteractionAt < 2 * 60 * 1000
        );
        const tick = () => {
            if (manualHoldActive()) return;
            setDate(new Date());
        };

        const interval = setInterval(tick, 60 * 1000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                tick();
            }
        };
        const handleFocus = () => tick();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
        };
    }, [isDatePage, lastManualInteractionAt, setDate]);

    useEffect(() => {
        if (isDatePage || !lastManualInteractionAt) return;
        const elapsed = Date.now() - lastManualInteractionAt;
        const remaining = 2 * 60 * 1000 - elapsed;
        if (remaining <= 0) return;

        const timeout = setTimeout(() => {
            if (Date.now() - lastManualInteractionAt >= 2 * 60 * 1000) {
                setDate(new Date());
            }
        }, remaining);

        return () => clearTimeout(timeout);
    }, [isDatePage, lastManualInteractionAt, setDate]);

    const minutes = date.getHours() * 60 + date.getMinutes();

    // Get current time to prevent sliding into the future
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = day === now.toDateString();

    const updateDate = useCallback((minutes, pausePlay = false) => {
        // If today, don't allow setting time in the future
        if (isToday && minutes > currentMinutes) {
            minutes = currentMinutes;
        }

        const updatedDate = new Date(day + ' ' + Math.floor(minutes / 60) + ':' + (minutes % 60));
        setManualDate(updatedDate);

        // Track time exploration when user manually adjusts slider
        if (pausePlay) {
            trackTimeExploration('slider', {
                country,
                locale,
                is_date_page: isDatePage
            });
        }

        // Pause playback when manually adjusting slider
        if (pausePlay && isPlaying) {
            setIsPlaying(false);
        }
    }, [isToday, currentMinutes, day, setManualDate, isPlaying, setIsPlaying, country, locale, isDatePage]);

    // Auto-play functionality
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                const currentMinutes = date.getHours() * 60 + date.getMinutes();
                const nextMinutes = currentMinutes + playSpeed; // Advance by speed multiplier

                // If we've reached the end of the day or current time (if today), stop playing
                const now = new Date();
                const todayLimit = now.getHours() * 60 + now.getMinutes();
                if (nextMinutes >= 24 * 60 || (isToday && nextMinutes >= todayLimit)) {
                    setIsPlaying(false);
                    return;
                }

                updateDate(nextMinutes);
            }, 50); // Reduced interval for smoother animation
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, date, isToday, playSpeed, updateDate]);

    const marks = useMemo(() => {
        const daySummaries = summaries.filter(summary => summary.timestamp.toDateString() === day);
        return daySummaries.map((summary, index) => ({
            value: summary.timestamp.getHours() * 60 + summary.timestamp.getMinutes(),
            label: null
        }));
    }, [summaries, day]);

    // Filter out future summaries if today
    const nextSummary = useMemo(() => summaries.findLast(summary =>
        summary.timestamp > date &&
        (!isToday || summary.timestamp <= now)
    ), [summaries, date, isToday, now]);

    const prevSummary = useMemo(() => summaries.find(summary => summary.timestamp < date), [summaries, date]);

    const goToSummary = (summary => {
        if (!summary) return;

        // Track time exploration when clicking arrows
        trackTimeExploration('arrow', {
            country,
            locale,
            is_date_page: isDatePage
        });

        setManualDate(summary.timestamp);
        if (date.toDateString() === summary.timestamp.toDateString()) {
            setManualDate(summary.timestamp);
        } else {
            redirect(`/${locale}/${country}/${createDateString(summary.timestamp)}`);
        }
    })

    if (isMobile) return (
        <>
        <div className={`fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200
            flex items-center justify-between py-2 px-1 gap-2`}>
            <IconButton size="small" onClick={() => prevSummary && goToSummary(prevSummary)} disabled={!prevSummary}>
                <KeyboardArrowLeft />
            </IconButton>
            <CustomSlider_Source orientation="horizontal" size="small"
                min={0} max={24 * 60-1} step={1}
                onChange={(_, value) => updateDate(value, true)}
                value={minutes} marks={marks}
                sx={{ height: 4 }}
            />
            <IconButton size="small" onClick={() => nextSummary && goToSummary(nextSummary)} disabled={!nextSummary}>
                <KeyboardArrowRight />
            </IconButton>

            <ResetTimerButton locale={effectiveLocale} country={country} pageDate={pageDate} />
        </div>
        {isDatePage && (
            <PlaySpeedPopup 
                open={isSpeedPopupOpen}
                close={() => setIsSpeedPopupOpen(false)}
                playSpeed={playSpeed}
                setPlaySpeed={setPlaySpeed}
                locale={effectiveLocale}
            />
        )}
        </>
    )

    return (
        <>
        <div className={`flex flex-col items-center justify-center ${effectiveLocale === 'heb' ? 'border-r' : 'border-l'} border-gray-200 py-2 px-1 gap-2`}>
            <ResetTimerButton locale={effectiveLocale} country={country} pageDate={pageDate} />
            <IconButton size="small" onClick={() => nextSummary && goToSummary(nextSummary)} disabled={!nextSummary}>
                <KeyboardArrowUp />
            </IconButton>
            <CustomTooltip title={effectiveLocale === 'heb' ? 'חזרה בזמן' : 'Back in time'} followCursor placement={effectiveLocale === 'heb' ? 'left' : 'right'}>
                <CustomSlider_Side orientation="vertical" size="small"
                    min={0} max={24 * 60-1} step={1}
                    onChange={(_, value) => updateDate(value, true)}
                    value={minutes} marks={marks}
                    sx={{ width: 4 }}
                />
            </CustomTooltip>
            <IconButton size="small" onClick={() => prevSummary && goToSummary(prevSummary)} disabled={!prevSummary}>
                <KeyboardArrowDown />
            </IconButton>
            {isDatePage && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CustomTooltip
                        title={effectiveLocale === 'heb' ? 'נגן כותרות' : 'Autoplay the day'}
                        placement={effectiveLocale === 'heb' ? 'left' : 'right'}
                    >
                        <IconButton
                            onClick={handlePlayToggle}
                            sx={{
                                color: '#9ca3af',
                                // padding: '4px',
                                '& .MuiSvgIcon-root': {
                                    fontSize: '18px'
                                }
                            }}
                        >
                            {isPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                    </CustomTooltip>
                    <CustomTooltip
                        title={effectiveLocale === 'heb' ? 'מהירות ניגון' : 'autoplay playback speed'}
                        placement={effectiveLocale === 'heb' ? 'left' : 'right'}
                    >
                        <IconButton
                            onClick={() => setIsSpeedPopupOpen(true)}
                            sx={{
                                color: '#9ca3af',
                                padding: '4px',
                                '& .MuiSvgIcon-root': {
                                    fontSize: '16px'
                                }
                            }}
                        >
                            <Speed fontSize="small" />
                        </IconButton>
                    </CustomTooltip>
                </div>
            )}
        </div>
        {isDatePage && (
            <PlaySpeedPopup 
                open={isSpeedPopupOpen}
                close={() => setIsSpeedPopupOpen(false)}
                playSpeed={playSpeed}
                setPlaySpeed={setPlaySpeed}
                locale={effectiveLocale}
            />
        )}
    </>
    );
}



export const CustomSlider_Side = styled(Slider)(({ theme }) => ({
    color: 'navy',
    '& .MuiSlider-thumb': {
        width: 10,
        height: 10,
        backgroundColor: 'black',
        transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
        '&.Mui-active': {
            width: 16,
            height: 16,
        },
    },
    '& .MuiSlider-rail': {
        opacity: 0.5,
        backgroundColor: 'lightblue',
        width: '5px',
    },
    '& .MuiSlider-track': {
        backgroundColor: 'gray',
        border: 'none',
    },
    '& .MuiSlider-mark': {
        backgroundColor: 'white',
        width: '5px',
        height: '3px',
        borderRadius: 0,
        opacity: 1,
    },
}));
