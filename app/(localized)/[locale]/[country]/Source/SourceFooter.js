import IconButton from "@/components/IconButton";
import { useTranslate } from "@/utils/store";
import { Languages } from "lucide-react";
import { useParams } from "next/navigation";

export function SourceFooter({ source, headline, url, headlines, pageDate }) {
    const { translate, toggleTranslate } = useTranslate();
    const params = useParams();
    const { locale, country } = params;

    // Hide translate icon for specific routes
    const shouldHideTranslate =
        (locale === 'heb' && country?.toLowerCase() === 'israel') ||
        (locale === 'en' && (country?.toLowerCase() === 'us' || country?.toLowerCase() === 'uk' || country?.toLowerCase() === 'kenya'));

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

    return (
        <div className="flex justify-between items-center gap-4 bg-white p-2 px-2">
            <div className="flex gap-2 items-center">
                {domain && (
                    <img src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                        width={16} height={16} alt=""
                        style={{
                            verticalAlign: 'middle'
                        }}
                    />
                )}
                {!shouldHideTranslate && (
                    <>
                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                        <IconButton onClick={clickTranslate}>
                            <Languages size={16} color={translate.includes(source) || translate.includes('ALL') ? activeColor : 'gray'} />
                        </IconButton>
                    </>
                )}
                <div className="w-1 h-full bg-gray-300"></div>
            </div>
            <div className="flex gap-4 items-center">
                <div className="text-[0.7em] text-gray-400 font-mono">{timeString}</div>
            </div>
        </div >
    );
}