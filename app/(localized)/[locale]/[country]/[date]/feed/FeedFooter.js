import InnerLink from "@/components/InnerLink";
import FlagIcon from "@/components/FlagIcon";
import { Info } from "lucide-react";
import { countries } from "@/utils/sources/countries";

export default function FeedFooter({ locale, country, date }) {
    // Get country name - always use English for footer to avoid RTL issues
    const countryData = countries[country] || {};
    const countryName = countryData.english || country;

    // Create URL for time machine view (remove /feed from current path)
    const formatDateForUrl = (dateObj) => {
        return `${dateObj.getDate().toString().padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
    };
    const timeMachineUrl = `/${locale}/${country}/${formatDateForUrl(date)}`;

    // Create URL for live headlines (country-only URL)
    const liveHeadlinesUrl = `/${locale}/${country}`;

    // Create URL for date archives (global history for this date)
    const dateArchivesUrl = `/${locale}/global/history/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;

    // Create URL for monthly archives (country-specific month view)
    const monthlyArchivesUrl = `/${locale}/${country}/history/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;

    const countryLabel = (country === 'us' || country === 'uk') ? `the ${countryName}` : countryName;

    // All dividers are standalone direct children (same height context). 4 dividers between 5 buttons.
    // First two dividers hidden on mobile so we get: Date | Live | About (2 dividers, 3 buttons).
    const dividerClass = "border-l border-gray-300 h-[50%] mx-2 sm:mx-5 flex-shrink-0 self-center";
    return (
        <div className="sticky bottom-0 z-40 flex border-t border-gray-200 px-2 py-3 bg-white direction-ltr">
            <div className="flex flex-nowrap items-center justify-center min-w-0 flex-1 overflow-x-auto">
                {/* 1. Time machine - hidden on mobile */}
                <div className="hidden sm:block">
                    <InnerLink href={timeMachineUrl} locale={locale}>
                        <div className="text-xs bg-gradient-to-r from-green-100 to-green-200 px-4 py-1 rounded-xl cursor-pointer font-['Geist'] hover:shadow-lg hover:text-gray-800 whitespace-nowrap">
                            Time Machine View
                        </div>
                    </InnerLink>
                </div>
                <div className={`hidden sm:block ${dividerClass}`} aria-hidden="true" />
                {/* 2. Date archives */}
                <InnerLink href={dateArchivesUrl} locale={locale}>
                    <div className="text-xs cursor-pointer bg-gray-100 px-4 py-1 rounded-xl font-['Geist'] hover:text-blue hover:bg-gray-50 hover:border-gray-300 whitespace-nowrap">
                        <span className="font-mono">{date.getDate().toString().padStart(2, '0')}.{String(date.getMonth() + 1).padStart(2, '0')}.{date.getFullYear()}</span> &nbsp;&nbsp;archives
                    </div>
                </InnerLink>
                <div className={`hidden sm:block ${dividerClass}`} aria-hidden="true" />
                {/* 3. Monthly archives - hidden on mobile */}
                <div className="hidden sm:block">
                    <InnerLink href={monthlyArchivesUrl} locale={locale}>
                        <div className="text-xs cursor-pointer bg-gray-100 px-4 py-1 rounded-xl font-['Geist'] hover:text-blue hover:bg-gray-50 hover:border-gray-300 whitespace-nowrap">
                            {new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} news archives from {countryLabel}
                        </div>
                    </InnerLink>
                </div>
                <div className={dividerClass} aria-hidden="true" />
                {/* 4. Live headlines */}
                <InnerLink href={liveHeadlinesUrl} locale={locale}>
                    <div className="flex items-center gap-2 text-xs bg-gray-100 px-4 py-1 rounded-xl cursor-pointer font-['Geist'] hover:text-blue hover:bg-gray-50 hover:border-gray-300 whitespace-nowrap">
                        <FlagIcon country={country} />
                        <span className="sm:hidden">Live Headlines</span>
                        <span className="hidden sm:inline">Live headlines from {countryLabel}</span>
                    </div>
                </InnerLink>
                <div className={dividerClass} aria-hidden="true" />
                {/* 5. About */}
                <InnerLink href="/about" locale={locale}>
                    <div className="flex items-center justify-center text-xs bg-gray-100 px-3 py-1 rounded-xl cursor-pointer font-['Geist'] hover:text-blue hover:bg-gray-50 hover:border-gray-300">
                        <Info size={10} />
                    </div>
                </InnerLink>
            </div>
        </div>
    );
}
