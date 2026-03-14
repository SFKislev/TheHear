'use client';

import { useEffect } from "react";

function formatLocalTime(timestamp) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(timestamp);
}

function updateFeedLocalTimes() {
    const nodes = document.querySelectorAll("[data-feed-local-time]");

    nodes.forEach((node) => {
        const timestampValue = node.getAttribute("data-feed-local-time-value");
        const countryTime = node.getAttribute("data-feed-country-time");
        const variant = node.getAttribute("data-feed-local-variant") || "compact";

        if (!timestampValue) {
            node.textContent = "";
            return;
        }

        const timestamp = new Date(timestampValue);
        const browserTime = formatLocalTime(timestamp);

        if (!browserTime || browserTime === countryTime) {
            node.textContent = "";
            return;
        }

        node.textContent = variant === "verbose"
            ? ` (${browserTime} in your timezone)`
            : ` (${browserTime})`;
    });
}

export default function FeedLocalTimeEnhancer() {
    useEffect(() => {
        updateFeedLocalTimes();
    }, []);

    return null;
}
