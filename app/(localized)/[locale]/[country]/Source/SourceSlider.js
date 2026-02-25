'use client'

import { useEffect, useState, useMemo } from "react";
import { IconButton, Slider, styled } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useTime } from "@/utils/store";
import { createDateString } from "@/utils/utils";
import { redirect } from "next/navigation";
import CustomTooltip from "@/components/CustomTooltip";

export default function SourceSlider({ locale, country, headlines, pageDate }) {
    const date = useTime((state) => state.date);
    const setDate = useTime((state) => state.setDate);

    const marks = useMemo(() => {
        const dateString = pageDate ? pageDate.toDateString() : new Date().toDateString();
        const dayHeadlines = headlines.filter(({ timestamp }) => timestamp.toDateString() === dateString);
        const newMarks = dayHeadlines.map(({ timestamp }) => timestamp.getHours() * 60 + timestamp.getMinutes());
        return newMarks.map(mark => ({ value: mark, label: null }));
    }, [headlines]);

    const minutes = date.getHours() * 60 + date.getMinutes();

    // Get current time to prevent sliding into the future
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = date.toDateString() === now.toDateString();

    const nextHeadline = headlines.filter(({ timestamp }) => timestamp > date && (!isToday || timestamp <= now)).pop();
    const prevHeadline = headlines.find(({ timestamp }) => timestamp < date);

    const goToHeadline = (headline) => {
        if (!headline) return;
        if (date.toDateString() === headline.timestamp.toDateString()) {
            setDate(headline.timestamp);
        } else {
            redirect(`/${locale}/${country}/${createDateString(headline.timestamp)}`);
        }
    }

    const updateDate = (minutes) => {
        // If today, don't allow setting time in the future
        if (isToday && minutes > currentMinutes) {
            minutes = currentMinutes;
        }

        const updatedDate = new Date(date);
        updatedDate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
        setDate(updatedDate); // Update global state immediately
    }

    return (
        <div className="flex flex-row gap-4 justify-between items-center border-t border-b border-gray-200" dir="ltr">
            <CustomTooltip title={locale === 'heb' ? 'כותרת קודמת' : 'previous headline'} placement="left">
                <IconButton size="small" disabled={!prevHeadline} onClick={() => goToHeadline(prevHeadline)} >
                    <KeyboardArrowLeft color="gray" />
                </IconButton>
            </CustomTooltip>

            <CustomSlider_Source
                key={marks.map(mark => mark.value).join('-')} // force re-mount when marks change
                size="small"
                min={0} max={24 * 60} value={minutes}
                onChange={(_, value) => updateDate(value)}
                marks={marks} />

            <CustomTooltip title={locale === 'heb' ? 'כותרת הבאה' : 'next headline'} placement="bottom">
                <IconButton size="small" disabled={!nextHeadline} onClick={() => goToHeadline(nextHeadline)} >
                    <KeyboardArrowRight color="gray" />
                </IconButton>
            </CustomTooltip>
        </div >
    );
}

export const CustomSlider_Source = styled(Slider)(({ theme }) => ({
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