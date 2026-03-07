'use client';

import { useEffect, useState } from "react";

function formatLocalTime(timestamp) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(timestamp);
}

function formatCountryTime(timestamp, countryTimezone) {
    if (!countryTimezone) return null;

    try {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: countryTimezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(timestamp);
    } catch (error) {
        return null;
    }
}

export default function FeedLocalTime({ timestamp, countryTimezone, variant = "compact" }) {
    const [localTime, setLocalTime] = useState("");

    useEffect(() => {
        if (!timestamp) return;

        const date = new Date(timestamp);
        const browserTime = formatLocalTime(date);
        const countryTime = formatCountryTime(date, countryTimezone);

        if (!browserTime || browserTime === countryTime) {
            setLocalTime("");
            return;
        }

        setLocalTime(browserTime);
    }, [countryTimezone, timestamp]);

    if (!localTime) return null;

    if (variant === "verbose") {
        return <> ({localTime} in your timezone)</>;
    }

    return <> ({localTime})</>;
}
