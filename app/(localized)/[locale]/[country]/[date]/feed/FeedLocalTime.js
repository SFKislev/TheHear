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
    if (!timestamp) return null;

    const date = new Date(timestamp);
    const countryTime = formatCountryTime(date, countryTimezone);
    const timestampValue = date.toISOString();

    return (
        <span
            data-feed-local-time
            data-feed-local-time-value={timestampValue}
            data-feed-country-time={countryTime || ""}
            data-feed-local-variant={variant}
            suppressHydrationWarning
        />
    );
}
