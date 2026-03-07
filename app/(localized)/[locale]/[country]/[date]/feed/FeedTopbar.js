import Link from "next/link";
import FlagIcon from "@/components/FlagIcon";
import InnerLink from "@/components/InnerLink";
import { getHeadline } from "@/utils/daily summary utils";

const ChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
);

const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
);

function formatDateForUrl(dateObj) {
    return `${dateObj.getDate().toString().padStart(2, "0")}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${dateObj.getFullYear()}`;
}

export default function FeedTopbar({ locale, country, daySummary, date }) {
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - 1);

    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const currentHeadline = daySummary ? getHeadline(daySummary, locale) : null;
    const prevDateUrl = formatDateForUrl(prevDate);
    const nextDateUrl = formatDateForUrl(nextDate);

    return (
        <div className="sticky top-0 z-40 flex border-b border-gray-200 px-2 py-2 bg-white">
            <div className="flex items-center justify-center min-w-0 flex-1">
                {locale !== "heb" ? (
                    <>
                        <Link href={`/${locale}/global`} className="hover:text-blue transition-colors hidden min-[915px]:block">
                            <div className="text-sm font-medium cursor-pointer font-['Geist'] pl-2 sm:pl-4 whitespace-nowrap">The Hear</div>
                        </Link>
                        <div className="border-l border-dotted border-gray-300 h-[50%] mx-2 sm:mx-5 flex-shrink-0 hidden min-[915px]:block"></div>
                    </>
                ) : null}

                <div className="flex items-center cursor-default">
                    <FlagIcon country={country} />
                </div>
                <div className="border-l border-dotted border-gray-300 h-[50%] mx-2 sm:mx-5 flex-shrink-0"></div>

                <div className="flex items-center gap-1">
                    <InnerLink href={`/${locale}/${country}/${prevDateUrl}/feed`} locale={locale}>
                        <div className="text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                            {locale === "heb" ? <ChevronRight /> : <ChevronLeft />}
                        </div>
                    </InnerLink>
                    <div className="text-sm font-mono text-gray-600 whitespace-nowrap">
                        {date.getDate().toString().padStart(2, "0")}.{String(date.getMonth() + 1).padStart(2, "0")}.{date.getFullYear()}
                    </div>
                    <InnerLink href={`/${locale}/${country}/${nextDateUrl}/feed`} locale={locale}>
                        <div className="text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                            {locale === "heb" ? <ChevronLeft /> : <ChevronRight />}
                        </div>
                    </InnerLink>
                </div>

                {currentHeadline ? (
                    <>
                        <div className="border-l border-gray-300 border-dotted h-[50%] mx-2 sm:mx-5 flex-shrink-0"></div>
                        <h1
                            className={`text-gray-800 truncate min-w-0 flex-1 max-w-xs sm:max-w-md ${locale === "heb" ? "frank-re text-base" : 'font-["Geist"] text-sm'}`}
                            style={{ margin: 0, fontWeight: "inherit" }}
                        >
                            {currentHeadline}
                        </h1>
                    </>
                ) : null}
            </div>
        </div>
    );
}
