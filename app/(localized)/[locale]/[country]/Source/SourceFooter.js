import FlagIcon from "@/components/FlagIcon";
import { useTranslate } from "@/utils/store";
import { Languages } from "lucide-react";
import { useParams } from "next/navigation";

export function SourceFooter({ source, headline, url, headlines, pageDate, flagCountry = null, sourceCountry = null }) {
    const { translate, toggleTranslate } = useTranslate();
    const params = useParams();
    const { locale, country } = params;
    const effectiveCountry = (sourceCountry || country || '').toLowerCase();

    // Hide translate icon for specific routes
    const shouldHideTranslate =
        (locale === 'heb' && effectiveCountry === 'israel') ||
        (locale === 'en' && (effectiveCountry === 'us' || effectiveCountry === 'uk' || effectiveCountry === 'kenya'));

    let timeString = '';
    if (headline) {
        timeString = headline.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        // Find the next headline if it exists
        if (headlines) {
            const currentIndex = headlines.findIndex(h => h === headline);
            const nextHeadline = currentIndex > 0 ? headlines[currentIndex - 1] : null;

            if (nextHeadline) {
                const nextTimeString = nextHeadline.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                // Add LRM character to prevent RTL flipping
                timeString = `\u200E${timeString} - ${nextTimeString}`;
            }
        }
    }

    let domain = '';
    try {
        if (
            url &&
            typeof url === 'string' &&
            (url.startsWith('http://') || url.startsWith('https://'))
        ) {
            domain = new URL(url).hostname.replace('www.', '');
        }
    } catch (error) {
        console.error('Invalid URL:', url);
        domain = null; // Set to null if URL is invalid
    }

    const clickTranslate = () => {
        toggleTranslate(source)
    }

    // Color scheme: blue for regular pages, amber-700 for date pages when active
    const isDatePage = !!pageDate;
    const activeColor = isDatePage ? '#b45309' : 'blue';
    const showMetaDivider = flagCountry || domain || !shouldHideTranslate;
    const itemClassName = "inline-flex h-5 min-w-5 items-center justify-center shrink-0";
    const dividerClassName = "w-px h-4 bg-gray-200 shrink-0";

    return (
        <div className="flex justify-between items-center gap-4 bg-white p-2 px-2">
            <div className="flex items-center gap-2.5">
                {flagCountry ? (
                    <>
                        <span className={itemClassName}>
                            <FlagIcon country={flagCountry} size="20x15" width={18} height={14} />
                        </span>
                        {(domain || !shouldHideTranslate) ? <div className={dividerClassName} /> : null}
                    </>
                ) : null}
                {domain ? (
                    <>
                        <span className={itemClassName}>
                            <img src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                                width={16} height={16} alt=""
                                style={{
                                    verticalAlign: 'middle'
                                }}
                            />
                        </span>
                        {!shouldHideTranslate ? <div className={dividerClassName} /> : null}
                    </>
                ) : null}
                {!shouldHideTranslate && (
                    <button
                        type="button"
                        onClick={clickTranslate}
                        className={`${itemClassName} rounded-full hover:bg-gray-100 focus:outline-none focus:ring focus:ring-gray-400 transition-all`}
                        aria-label="translate"
                    >
                        <Languages size={16} color={translate.includes(source) || translate.includes('ALL') ? activeColor : 'gray'} />
                    </button>
                )}
                {showMetaDivider ? <div className="w-px h-4 bg-gray-300 ml-0.5" /> : null}
            </div>
            <div className="flex gap-4 items-center">
                <div className="text-[0.7em] text-gray-400 font-mono">{timeString}</div>
            </div>
        </div >
    );
}
