'use client'

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconButton, Slider, styled } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useTime } from "@/utils/store";
import { createDateString } from "@/utils/utils";
import { usePathname, useRouter } from "next/navigation";
import CustomTooltip from "@/components/CustomTooltip";
import { countries } from "@/utils/sources/countries";

function getCountryDateParts(date, timezone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);

    const get = (type) => parts.find((part) => part.type === type)?.value;
    return {
        year: get("year"),
        month: get("month"),
        day: get("day"),
        hour: Number(get("hour")),
        minute: Number(get("minute")),
    };
}

export default function SourceSlider({ locale, country, headlines, pageDate }) {
    const date = useTime((state) => state.date);
    const setDate = useTime((state) => state.setDate);
    const router = useRouter();
    const pathname = usePathname();
    const [showProgress, setShowProgress] = useState(false);
    const [portalReady, setPortalReady] = useState(false);
    const timeoutRef = useRef(null);
    const anchorHeadline = headlines[0] || null;
    const sliderDay = pageDate || anchorHeadline?.timestamp || date;
    const timezone = countries[country]?.timezone || "UTC";

    const sliderDayParts = getCountryDateParts(new Date(sliderDay), timezone);
    const sliderDayKey = `${sliderDayParts.year}-${sliderDayParts.month}-${sliderDayParts.day}`;
    const uniqueMarks = [...new Set(
        headlines
            .map(({ timestamp }) => new Date(timestamp))
            .filter((timestamp) => {
                const parts = getCountryDateParts(timestamp, timezone);
                return `${parts.year}-${parts.month}-${parts.day}` === sliderDayKey;
            })
            .map((timestamp) => {
                const parts = getCountryDateParts(timestamp, timezone);
                return parts.hour * 60 + parts.minute;
            })
    )].sort((a, b) => a - b);
    const marks = uniqueMarks.map(mark => ({ value: mark, label: null }));

    const minutes = date.getHours() * 60 + date.getMinutes();

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = date.toDateString() === now.toDateString();

    const nextHeadline = headlines.filter(({ timestamp }) => timestamp > date && (!isToday || timestamp <= now)).pop();
    const prevHeadline = headlines.find(({ timestamp }) => timestamp < date);

    useEffect(() => {
        setPortalReady(true);
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!showProgress) return;

        const hideTimeout = setTimeout(() => {
            setShowProgress(false);
        }, 120);

        return () => clearTimeout(hideTimeout);
    }, [pathname, showProgress]);

    const goToHeadline = (headline) => {
        if (!headline) return;
        if (date.toDateString() === headline.timestamp.toDateString()) {
            setDate(headline.timestamp);
        } else {
            const hours = String(headline.timestamp.getHours()).padStart(2, '0');
            const minuteString = String(headline.timestamp.getMinutes()).padStart(2, '0');
            const href = `/${locale}/${country}/${createDateString(headline.timestamp)}?time=${hours}:${minuteString}`;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setShowProgress(true);
            timeoutRef.current = setTimeout(() => {
                setShowProgress(false);
            }, 4000);

            router.push(href);
        }
    };

    const updateDate = (nextMinutes) => {
        if (isToday && nextMinutes > currentMinutes) {
            nextMinutes = currentMinutes;
        }

        const updatedDate = new Date(sliderDay);
        updatedDate.setHours(Math.floor(nextMinutes / 60), nextMinutes % 60, 0, 0);
        setDate(updatedDate);
    };

    return (
        <>
            <div className="flex flex-row gap-4 justify-between items-center border-t border-b border-gray-200" dir="ltr">
                <CustomTooltip title={locale === 'heb' ? 'כותרת קודמת' : 'previous headline'} placement="left">
                    <IconButton size="small" disabled={!prevHeadline} onClick={() => goToHeadline(prevHeadline)}>
                        <KeyboardArrowLeft color="gray" />
                    </IconButton>
                </CustomTooltip>

                <CustomSlider_Source
                    key={marks.map(mark => mark.value).join('-')}
                    size="small"
                    min={0}
                    max={24 * 60}
                    value={minutes}
                    onChange={(_, value) => updateDate(value)}
                    marks={marks}
                />

                <CustomTooltip title={locale === 'heb' ? 'כותרת הבאה' : 'next headline'} placement="bottom">
                    <IconButton size="small" disabled={!nextHeadline} onClick={() => goToHeadline(nextHeadline)}>
                        <KeyboardArrowRight color="gray" />
                    </IconButton>
                </CustomTooltip>
            </div>
            {showProgress && portalReady ? createPortal(
                <div className="fixed inset-0 z-[9999] pointer-events-none">
                    <div className="absolute inset-0 bg-white/35 animate-pulse" />
                    <div className="absolute inset-x-0 top-0">
                        <div className="h-[2px] w-full overflow-hidden bg-white/50">
                            <div className="h-full w-full origin-left animate-[inner-link-progress_1.4s_ease-out_infinite] bg-neutral-700" />
                        </div>
                    </div>
                </div>
            , document.body) : null}
        </>
    );
}

export const CustomSlider_Source = styled(Slider)(() => ({
    color: 'navy',
    height: 4,
    '& .MuiSlider-thumb': {
        width: 7,
        height: 7,
        backgroundColor: '#888',
        transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
        '&.Mui-active': {
            width: 16,
            height: 16,
        },
    },
    '& .MuiSlider-rail': {
        opacity: 0.5,
        backgroundColor: 'lightblue',
        width: '100%',
    },
    '& .MuiSlider-track': {
        backgroundColor: '#CCC',
        border: 'none',
    },
    '& .MuiSlider-mark': {
        backgroundColor: 'white',
        width: '3px',
        height: '5px',
        borderRadius: 0,
        opacity: 1,
    },
}));
