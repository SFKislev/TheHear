'use client'

import { getSourceData, getWebsiteName } from "@/utils/sources/getCountryData";
import { getTypographyOptions } from "@/utils/typography/typography";
import { checkRTL } from "@/utils/utils";
import Headline from "../../Source/Headine";
import Subtitle from "../../Source/Subtitle";

export default function HeadlineCard({ headline, country, locale, countryTimezone }) {
    // Normalize website_id to match source keys using fuzzy matching
    const normalizedWebsiteId = getWebsiteName(country, headline.website_id);
    const sourceData = getSourceData(country, normalizedWebsiteId);

    // Use the original source name (already in the source's native language)
    const sourceName = sourceData?.name || headline.website_id;

    const timestamp = new Date(headline.timestamp);

    // User's local time
    const userTimeString = timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Country's local time
    let countryTimeString = userTimeString;
    if (countryTimezone) {
        try {
            countryTimeString = new Intl.DateTimeFormat('en-US', {
                timeZone: countryTimezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(timestamp);
        } catch (e) {
            countryTimeString = userTimeString;
        }
    }

    // Show both times if they're different, with label for clarity
    const timeString = countryTimeString === userTimeString
        ? countryTimeString
        : `${countryTimeString} (${userTimeString} in your timezone)`;

    // Get favicon domain
    let domain = '';
    try {
        if (headline.link && typeof headline.link === 'string' &&
            (headline.link.startsWith('http://') || headline.link.startsWith('https://'))) {
            domain = new URL(headline.link).hostname.replace('www.', '');
        }
    } catch (error) {
        domain = '';
    }

    // Check if this should use RTL based on headline/source content
    const headlineIsRTL = checkRTL(headline.headline) || checkRTL(sourceName);

    // Get random typography for this headline (matching SourceCard logic)
    const typography = getTypographyOptions(country);
    const options = typography.options;
    const randomIndex = Math.floor(Math.random() * 100);
    let selectedTypo = options[randomIndex % options.length];

    // If typography direction doesn't match content, switch it
    let finalTypo = selectedTypo;
    if ((finalTypo.direction === 'rtl' && !headlineIsRTL) || (finalTypo.direction === 'ltr' && headlineIsRTL)) {
        const otherOptions = getTypographyOptions(headlineIsRTL ? 'israel' : 'us').options;
        finalTypo = otherOptions[randomIndex % otherOptions.length];
    }
    
    return (
        <article className={`bg-neutral-100 hover:bg-white hover:shadow-xl transition-colors duration-200 ${headlineIsRTL ? 'direction-rtl' : 'direction-ltr'}`}>
            <div className="flex flex-col h-full">
                <div className="flex flex-col gap-2 p-6">
                    {/* Source Name - metadata, not a heading */}
                    <div className="text-blue" style={{
                        ...finalTypo,
                        fontSize: finalTypo.fontFamily === 'var(--font-frank-re-tzar)' ? '1.5rem' : '1.2rem',
                        margin: 0,
                        fontWeight: finalTypo.fontWeight || 'inherit'
                    }}>
                        {sourceName}
                    </div>

                    {/* Use existing Headline component - this contains the h3 */}
                    <div className="mb-2">
                        <Headline headline={headline} typography={finalTypo} isLoading={false} />
                    </div>
                </div>
                
                {/* Use existing Subtitle component */}
                <div className="px-6 -mx-4">
                    <Subtitle headlineData={headline} isLoading={false} locale={locale} />
                </div>
                
                {/* Footer with favicon and timestamp - matching SourceFooter style */}
                <div className="flex justify-between items-center gap-4 py-2 my-2 px-6 mt-auto">
                    <div className="flex gap-2 items-center">
                        {domain && (
                            <img
                                src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                                width={16}
                                height={16}
                                alt=""
                                style={{ verticalAlign: 'middle' }}
                            />
                        )}
                    </div>
                    <div className="text-[0.7em] text-gray-400 font-mono">{timeString}</div>
                </div>
            </div>
        </article>
    );
}

