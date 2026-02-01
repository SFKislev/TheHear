'use client';

import CustomTooltip from "@/components/CustomTooltip";
import { Restore } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { useTime } from "@/utils/store";
import { isToday } from "date-fns";
import InnerLink from "@/components/InnerLink";

export default function ResetTimerButton({ locale, country, className, pageDate }) {
    const date = useTime(state => state.date);
    const setDate = useTime(state => state.setDate);
    const isPresent = new Date() - date < 60 * 1000 * 5;

    useEffect(() => {
        if (pageDate) return;
        const timer = setInterval(() => {
            if (!isPresent) setDate(new Date());
        }, 60 * 1000);
        return () => clearInterval(timer);
    }, [isPresent, setDate, pageDate]);

    useEffect(() => {
        if (pageDate) return;
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && !isPresent) {
                setDate(new Date());
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [pageDate, setDate, isPresent])

    const tooltip = locale === 'heb' ? 'בחזרה לעכשיו' : 'Reset To Now';
    const placement = locale === 'heb' ? 'left' : 'right';

    const handleClick = () => {
        if (isToday(date)) {
            setDate(new Date());
        }
        // else: navigation handled by InnerLink
    }

    const button = (
        <CustomTooltip title={tooltip} arrow open={!isPresent} placement={placement}>
            <IconButton
                className={`transition-colors duration-300 ${isPresent ? '' : 'animate-slow-fade'} ` + className}
                onClick={handleClick}
                size="small"
                sx={{
                    color: isPresent ? 'lightgray' : 'blue'
                }}
            >
                <Restore fontSize="small" />
            </IconButton>
        </CustomTooltip>
    );

    if (!isToday(date)) {
        return (
            <InnerLink locale={locale} href={`/${locale}/${country}`}>
                {button}
            </InnerLink>
        );
    }
    return button;
}
