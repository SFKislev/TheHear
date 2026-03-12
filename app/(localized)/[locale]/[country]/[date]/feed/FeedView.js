import { countries } from "@/utils/sources/countries";
import HeadlineCard from "./FeedHeadlineCard";
import SummaryCard from "./FeedSummaryCard";
import FeedTopbar from "./FeedTopbar";
import FeedDailySummary from "./feedDailySummary";
import Link from "next/link";
import Image from "next/image";
import logoA from "@/components/logo/thehear-round.webp";
import InnerLink from "@/components/InnerLink";

function formatInCountryTimezone(timestamp, countryTimezone) {
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

export default function FeedView({ headlines, initialSummaries, daySummary, archiveInsights, locale, country, date, countryTimezone, isMobile, footer }) {
    const countryData = countries[country] || {};
    const countryName = locale === "heb" ? countryData.hebrew || country : countryData.english || country;
    const isRTL = locale === "heb";
    const dateString = `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
    const timelineItems = [];

    headlines.forEach((headline) => {
        timelineItems.push({
            type: "headline",
            timestamp: new Date(headline.timestamp),
            data: headline
        });
    });

    initialSummaries.forEach((summary) => {
        timelineItems.push({
            type: "hourly-summary",
            timestamp: new Date(summary.timestamp),
            data: summary
        });
    });

    timelineItems.sort((a, b) => a.timestamp - b.timestamp);

    return (
        <div style={{ paddingBottom: "var(--footer-offset, 3rem)" }} className={`min-h-screen ${isRTL ? "direction-rtl" : "direction-ltr"}`}>
            <FeedTopbar locale={locale} country={country} daySummary={daySummary} date={date} />

            <div className="py-2">
                <div className="logo-hover-container flex items-center justify-center relative pt-8">
                    <div
                        className="logo-background absolute top-[62%] left-1/2 w-[210px] h-[40%] bg-[#EBEBEB] opacity-0 transform translate-y-[-50%] translate-x-[-50%] shadow-xl"
                        style={{ transition: "opacity 0.2s ease", transitionDelay: ".8s", marginLeft: "8px" }}
                    />
                    <div
                        className="logo-text-right absolute left-1/2 top-[50%] pt-8 transform translate-y-[-50%] font-serif text-2xl text-black z-10 opacity-0 transition-opacity duration-100 delay-50 pointer-events-none"
                        style={{ fontFamily: "CheltenhamCondensed, serif", fontSize: "2rem", transform: "translateX(-88px) translateY(-50%)" }}
                    >
                        THE
                    </div>
                    <Link href={`/${locale}/global`} hrefLang={locale}>
                        <Image
                            className={`relative z-20 h-[85px] ${locale === "heb" ? "scale-x-[1]" : "scale-x-[-1]"} object-contain pb-2 cursor-pointer`}
                            width={200}
                            height={200}
                            src={logoA}
                            alt="The Hear Logo"
                        />
                    </Link>
                    <div
                        className="logo-text-right pt-8 absolute left-1/2 top-[50%] transform translate-y-[-50%] font-serif text-2xl text-black z-10 opacity-0 transition-opacity duration-100 delay-500 pointer-events-none"
                        style={{ fontFamily: "CheltenhamCondensed, serif", fontSize: "2rem", transition: "opacity 0.1s ease", transitionDelay: "0.5s", transform: "translateX(48px) translateY(-50%)" }}
                    >
                        HEAR
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-2">
                <h2 className={`${locale === "heb" ? "text-base text-gray-800 frank-re" : 'text-sm text-gray-700 font-["Geist"]'} text-center leading-relaxed`} style={{ margin: 0, fontWeight: "inherit" }}>
                    {locale === "heb" ? (
                        <>
                            {"\u05D6\u05D4\u05D5 \u05D0\u05E8\u05DB\u05D9\u05D5\u05DF \u05DB\u05D5\u05EA\u05E8\u05D5\u05EA \u05E8\u05D0\u05E9\u05D9\u05D5\u05EA \u05DE"}
                            <u>{countryName}</u>
                            {" \u05DE\u05EA\u05D0\u05E8\u05D9\u05DA \u05D4-"}{dateString}.<br /><br />
                            {"\u05D1\u05E2\u05DE\u05D5\u05D3 \u05DE\u05D5\u05E6\u05D2\u05D5\u05EA "}
                            <u>{headlines.length} {"\u05DB\u05D5\u05EA\u05E8\u05D5\u05EA"}</u>
                            {" \u05DE\u05DE\u05E7\u05D5\u05E8\u05D5\u05EA \u05E8\u05D1\u05D9\u05DD, \u05DC\u05E4\u05D9 \u05E1\u05D3\u05E8 \u05DB\u05E8\u05D5\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9, \u05DB\u05E4\u05D9 \u05E9\u05D4\u05D5\u05E4\u05D9\u05E2\u05D5 \u05D5\u05E0\u05E2\u05DC\u05DE\u05D5 \u05DC\u05D0\u05D5\u05E8\u05DA \u05D4\u05D9\u05D5\u05DD."}
                        </>
                    ) : (
                        <>
                            This page is an <strong>archive of main headlines</strong> from {(country === "us" || country === "uk") ? "the " : ""}
                            <strong>{countryName}</strong> for <strong>{dateString}</strong>.<br /><br />
                            It displays <strong>{headlines.length} headlines</strong> from many sources chronologically, as they appeared throughout the day, accompanied by AI overviews that were written in real time.
                        </>
                    )}
                </h2>
            </div>

            {daySummary ? (
                <div className="max-w-xl mx-auto px-4 py-4">
                    <FeedDailySummary locale={locale} daySummary={daySummary} />
                </div>
            ) : null}

            <div className={`${isMobile ? "max-w-lg" : "max-w-5xl"} mx-auto px-4 py-8 pb-48 relative`}>
                {isMobile ? (
                    <div className="space-y-8">
                        {timelineItems.map((item, index) => {
                            const isSummary = item.type !== "headline";
                            const timeString = item.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false
                            });
                            const countryTimeString = formatInCountryTimezone(item.timestamp, countryTimezone);

                            return (
                                <div key={`${item.type}-${index}`} className={`${isSummary ? "my-12" : "my-4"}`}>
                                    <div className="text-center mb-2">
                                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                            {countryTimeString || timeString}
                                        </span>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="w-full max-w-md">
                                            {item.type === "headline" ? (
                                                <HeadlineCard headline={item.data} country={country} countryTimezone={countryTimezone} />
                                            ) : (
                                                <SummaryCard summary={item.data} locale={locale} countryTimezone={countryTimezone} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="relative pt-8">
                        {locale !== "heb" ? (
                            <div className={`absolute ${isRTL ? "right-1/2" : "left-1/2"} top-0 transform -translate-x-1/2 -translate-y-6 z-20`}>
                                <div className="text-[0.7em] text-gray-400 font-mono whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                                    {dateString}
                                </div>
                            </div>
                        ) : null}

                        <div className={`absolute ${isRTL ? "right-1/2" : "left-1/2"} top-0 bottom-0 w-px bg-gray-500`} />

                        {locale !== "heb" ? (
                            <div className={`absolute ${isRTL ? "right-1/2" : "left-1/2"} bottom-0 transform -translate-x-1/2 translate-y-16 z-30`}>
                                <InnerLink
                                    href={`/${locale}/${country}/${String(date.getDate() + 1).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}/feed`}
                                    locale={locale}
                                >
                                    <div className="flex flex-col items-center text-gray-400 hover:text-gray-600">
                                        <div className="text-[0.7em] font-mono whitespace-nowrap px-2 rounded">
                                            {String(date.getDate() + 1).padStart(2, "0")}.{String(date.getMonth() + 1).padStart(2, "0")}.{date.getFullYear()}
                                        </div>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="mb-4"
                                        >
                                            <polyline points="6,9 12,15 18,9"></polyline>
                                        </svg>
                                    </div>
                                </InnerLink>
                            </div>
                        ) : null}

                        {timelineItems.map((item, index) => {
                            const headlineCountBeforeThis = timelineItems.slice(0, index).filter((entry) => entry.type === "headline").length;
                            const side = headlineCountBeforeThis % 2 === 0 ? "left" : "right";
                            const isLeft = isRTL ? side === "right" : side === "left";
                            const isSummary = item.type !== "headline";
                            const timeString = item.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false
                            });
                            const countryTimeString = formatInCountryTimezone(item.timestamp, countryTimezone);

                            return (
                                <div key={`${item.type}-${index}`} className={`relative ${isSummary ? "mb-8 mt-24" : "-mb-16"}`}>
                                    {!isSummary ? (
                                        <>
                                            {locale !== "heb" ? (
                                                <div className={`absolute ${isRTL ? "right-1/2" : "left-1/2"} top-1 w-2 h-2 rounded-full bg-white transform -translate-x-1/3 z-10`} />
                                            ) : null}

                                            <div
                                                className="text-[0.7em] text-gray-400 font-mono whitespace-nowrap"
                                                style={{
                                                    position: "absolute",
                                                    top: "0",
                                                    [isLeft ? (isRTL ? "right" : "left") : (isRTL ? "left" : "right")]: "calc(50% + 1rem)"
                                                }}
                                            >
                                                {countryTimeString || timeString}
                                            </div>

                                            {isLeft ? (
                                                <div className={`absolute top-1.5 ${isRTL ? "left-1/2" : "right-1/2"} h-px bg-gray-500 z-0`} style={{ width: "calc(8%)" }} />
                                            ) : (
                                                <div className={`absolute top-1.5 ${isRTL ? "right-1/2" : "left-1/2"} h-px bg-gray-500 z-0`} style={{ width: "calc(8%)" }} />
                                            )}
                                        </>
                                    ) : null}

                                    <div className={`flex ${isSummary ? "justify-center" : (isLeft ? "justify-start pr-1/2" : "justify-end pl-1/2")}`}>
                                        <div className={isSummary ? "w-2/4" : "w-5/12"}>
                                            {item.type === "headline" ? (
                                                <HeadlineCard headline={item.data} country={country} countryTimezone={countryTimezone} />
                                            ) : (
                                                <SummaryCard summary={item.data} locale={locale} countryTimezone={countryTimezone} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {footer}
        </div>
    );
}
