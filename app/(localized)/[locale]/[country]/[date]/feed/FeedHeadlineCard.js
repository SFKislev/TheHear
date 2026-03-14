import { getSourceData, getWebsiteName } from "@/utils/sources/getCountryData";
import { getDeterministicTypography, getTypographyOptions } from "@/utils/typography/typography";
import { checkRTL } from "@/utils/utils";
import FeedLocalTime from "./FeedLocalTime";

function getPriorityTypography(country, isRTL) {
    const primaryOptions = getTypographyOptions(country).options;
    const fallbackOptions = getTypographyOptions(isRTL ? "israel" : "us").options;
    const firstMatchingPrimary = primaryOptions.find((option) => option?.direction === (isRTL ? "rtl" : "ltr"));

    if (firstMatchingPrimary) {
        return firstMatchingPrimary;
    }

    return fallbackOptions.find((option) => option?.direction === (isRTL ? "rtl" : "ltr")) || fallbackOptions[0];
}

export default function HeadlineCard({ headline, country, countryTimezone, isPriorityCard = false }) {
    const normalizedWebsiteId = getWebsiteName(country, headline.website_id);
    const sourceData = getSourceData(country, normalizedWebsiteId);
    const sourceName = sourceData?.name || headline.website_id;
    const timestamp = new Date(headline.timestamp);
    const headlineText = headline.headline || "";
    const subtitleText = headline.subtitle || "";
    const headlineIsRTL = checkRTL(headlineText) || checkRTL(sourceName);
    const typographySeed = [
        sourceName,
        headlineText,
        subtitleText,
        headline.timestamp?.toString?.() || ""
    ].join("|");
    const typographyText = [sourceName, headlineText, subtitleText].join(" ");
    const finalTypo = isPriorityCard
        ? getPriorityTypography(country, headlineIsRTL)
        : getDeterministicTypography({
            country,
            seed: typographySeed,
            isRTL: headlineIsRTL,
            text: typographyText
        });

    let countryTimeString = "";
    if (countryTimezone) {
        try {
            countryTimeString = new Intl.DateTimeFormat("en-US", {
                timeZone: countryTimezone,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).format(timestamp);
        } catch (error) {
            countryTimeString = "";
        }
    }
    const fallbackTimeString = `${String(timestamp.getUTCHours()).padStart(2, "0")}:${String(timestamp.getUTCMinutes()).padStart(2, "0")} UTC`;
    const timeString = countryTimeString || fallbackTimeString;

    let domain = "";
    try {
        if (headline.link && typeof headline.link === "string" &&
            (headline.link.startsWith("http://") || headline.link.startsWith("https://"))) {
            domain = new URL(headline.link).hostname.replace("www.", "");
        }
    } catch (error) {
        domain = "";
    }

    const headlineContent = (
        <div className="relative">
            <h3
                className="w-full text-lg font-semibold break-words line-clamp-6"
                style={{
                    ...finalTypo,
                    width: "100%",
                    direction: headlineIsRTL ? "rtl" : "ltr"
                }}
            >
                {headlineText}
            </h3>
        </div>
    );

    const isInternalLink = headline.link && (
        headline.link.includes("thehear.org") ||
        headline.link.includes("www.thehear.org") ||
        headline.link.startsWith("/")
    );

    return (
        <article className={`bg-neutral-100 hover:bg-white hover:shadow-xl transition-colors duration-200 ${headlineIsRTL ? "direction-rtl" : "direction-ltr"}`}>
            <div className="flex flex-col h-full">
                <div className="flex flex-col gap-2 p-6">
                    <div
                        className="text-blue"
                        style={{
                            ...finalTypo,
                            fontSize: finalTypo.fontFamily === "var(--font-frank-re-tzar)" ? "1.5rem" : "1.2rem",
                            margin: 0,
                            fontWeight: finalTypo.fontWeight || "inherit"
                        }}
                    >
                        {sourceName}
                    </div>

                    <div className="mb-2">
                        {headline.link && !isInternalLink ? (
                            <a href={headline.link} target="_blank" rel="noopener noreferrer">
                                {headlineContent}
                            </a>
                        ) : (
                            headlineContent
                        )}
                    </div>
                </div>

                {subtitleText ? (
                    <div className="px-6 -mx-4">
                        <div
                            className={`px-4 pb-2 ${checkRTL(subtitleText) ? "text-right" : "text-left"}`}
                            style={{ fontSize: "0.8rem" }}
                        >
                            {subtitleText}
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-between items-center gap-4 py-2 my-2 px-6 mt-auto">
                    <div className="flex gap-2 items-center">
                        {domain ? (
                            <img
                                src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                                width={16}
                                height={16}
                                alt=""
                                loading="lazy"
                                style={{ verticalAlign: "middle" }}
                            />
                        ) : null}
                    </div>
                    <div className="text-[0.7em] text-gray-400 font-mono">
                        {timeString}
                        {!isPriorityCard ? (
                            <FeedLocalTime
                                timestamp={headline.timestamp}
                                countryTimezone={countryTimezone}
                                variant="verbose"
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </article>
    );
}
