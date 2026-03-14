import FeedSummaryNav from "./FeedSummaryNav";
import FeedLocalTime from "./FeedLocalTime";

function cleanSummaryText(text) {
    if (!text) return "";

    const markers = ["HEBREWSUMMARY:", "LOCALSUMMARY:", "SUMMARY:"];
    let cleanText = text;

    for (const marker of markers) {
        const markerIndex = text.indexOf(marker);
        if (markerIndex !== -1) {
            cleanText = text.substring(0, markerIndex).trim();
            break;
        }
    }

    return cleanText;
}

export default function SummaryCard({ summary, locale, countryTimezone, previousSummaryId, nextSummaryId }) {
    const summaryContent = locale === "heb"
        ? cleanSummaryText(summary.hebrewSummary || summary.summary)
        : cleanSummaryText(summary.summary || summary.hebrewSummary);

    const timestampValue = summary.timestamp ? new Date(summary.timestamp) : null;
    let countryTimestamp = "";
    if (timestampValue && countryTimezone) {
        try {
            countryTimestamp = new Intl.DateTimeFormat("en-US", {
                timeZone: countryTimezone,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).format(timestampValue);
        } catch (error) {
            countryTimestamp = "";
        }
    }
    const fallbackTimestamp = timestampValue
        ? `${String(timestampValue.getUTCHours()).padStart(2, "0")}:${String(timestampValue.getUTCMinutes()).padStart(2, "0")} UTC`
        : "";
    const timestamp = countryTimestamp || fallbackTimestamp;

    const fontClass = locale === "heb" ? "frank-re" : 'font-["Geist"]';
    const disclaimer = locale === "heb" ? "סקירה זו נכתבה בידי בינה" : "This overview was written by an AI";
    const arrowIcon = locale === "heb" ? "⇠" : "⇢";
    const headline = locale === "heb"
        ? cleanSummaryText(summary.hebrewHeadline || summary.headline)
        : cleanSummaryText(summary.englishHeadline || summary.headline);
    const parts = summaryContent.split(/(\(.*?\))/g);
    const summaryId = timestampValue ? timestampValue.getTime() : headline;

    return (
        <article
            className={`${fontClass} leading-none font-normal bg-white rounded-sm border border-gray-500 p-6 text-justify relative`}
            data-summary-card
            data-summary-id={summaryId}
            id={`summary-${summaryId}`}
        >
            <FeedSummaryNav targetSummaryId={previousSummaryId} locale={locale} direction="previous" />

            <h3
                className={`mb-2 ${locale === "heb" ? "text-[17px]" : "text-base"} font-medium text-black`}
                style={{
                    lineHeight: "1.5",
                    marginBottom: "10px",
                    marginTop: 0
                }}
            >
                <span className="font-mono text-sm">
                    {timestamp}
                    {timestampValue ? (
                        <FeedLocalTime
                            timestamp={summary.timestamp}
                            countryTimezone={countryTimezone}
                        />
                    ) : null}
                </span>
                <span className="mx-1">{arrowIcon}</span>
                <span>{headline}</span>
            </h3>

            <div className={`${locale === "heb" ? "text-base" : "text-sm"} text-gray-800`} style={{ lineHeight: "1.5" }}>
                <span
                    className={`${locale === "heb" ? "pl-2" : "pr-2"} align-middle cursor-help text-sm text-gray-600`}
                    tabIndex={0}
                    title={disclaimer}
                    aria-label={disclaimer}
                >
                    ⌨
                </span>
                {parts.map((part, index) => (
                    <span key={index} className={part.startsWith("(") ? "text-gray-400 text-xs" : ""}>
                        {part}
                    </span>
                ))}
            </div>

            <FeedSummaryNav targetSummaryId={nextSummaryId} locale={locale} direction="next" />
        </article>
    );
}
