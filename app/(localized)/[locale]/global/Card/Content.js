import CustomTooltip from "@/components/CustomTooltip";
import { TopBarButton } from "@/components/IconButtons";
import { ExpandLess, ExpandMore, PushPin, PushPinOutlined } from "@mui/icons-material";
import { Collapse } from "@mui/material";
import { useState, useEffect } from "react";
import { useGlobalSort } from "@/utils/store";
import useMobile from "@/components/useMobile";

// Helper function to clean summary text by removing everything after language markers
const cleanSummaryText = (text) => {
    if (!text) return '';
    
    // Find the index of language markers and truncate at the first one found
    const markers = ['HEBREWSUMMARY:', 'LOCALSUMMARY:', 'SUMMARY:'];
    let cleanText = text;
    
    for (const marker of markers) {
        const markerIndex = text.indexOf(marker);
        if (markerIndex !== -1) {
            cleanText = text.substring(0, markerIndex).trim();
            break; // Stop at the first marker found
        }
    }
    
    return cleanText;
};

export default function Content({ country, summary, locale, pinned }) {
    const coerceDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value?.toDate === 'function') return value.toDate();
        if (typeof value === 'string' || typeof value === 'number') {
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        return null;
    };
    // Start with open=true for SSR (bots see content), can be toggled by user
    const [open, setOpen] = useState(true);
    const setPinnedCountries = useGlobalSort(state => state.setPinnedCountries);
    const allExpanded = useGlobalSort(state => state.allExpanded);
    const { isMobile } = useMobile();

    useEffect(() => {
        setOpen(allExpanded);
    }, [allExpanded]);

    const timestampDate = coerceDate(summary?.timestamp);
    const minutes = timestampDate?.getMinutes();
    const hours = timestampDate?.getHours();

    // Format time to ensure two digits for minutes
    const formattedTime = (minutes === undefined || hours === undefined)
        ? '—'
        : `${hours}:${minutes.toString().padStart(2, '0')}`;

    let text = cleanSummaryText(summary.summary);
    if (locale === 'heb') {
        text = cleanSummaryText(summary.hebrewSummary);
    } else if (locale === 'translated') {
        text = summary ? cleanSummaryText(summary.translatedSummary) : '';
    }

    const pin = () => {
        let pinnedCountries = localStorage.getItem('pinnedCountries');
        if (pinnedCountries) {
            pinnedCountries = JSON.parse(pinnedCountries);
            if (pinnedCountries.indexOf(country) >= 0) {
                pinnedCountries.splice(pinnedCountries.indexOf(country), 1);
            } else {
                pinnedCountries.push(country);
            }
        } else pinnedCountries = [country];
        localStorage.setItem('pinnedCountries', JSON.stringify(pinnedCountries));
        setPinnedCountries(pinnedCountries);
    }

    return (
        <div className="p-4">
            <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <p style={{
                        fontFamily: 'monospace',
                        fontWeight: 400,
                        fontSize: '0.8rem',
                        padding: 6,
                    }}>{formattedTime}</p>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <TopBarButton onClick={pin} >
                        <CustomTooltip title="pin country in place">
                            {pinned >= 0 ? <PushPin style={{ fontSize: '0.7rem', color: 'blue' }} /> : <PushPinOutlined style={{ fontSize: '0.7rem' }} />}
                        </CustomTooltip>
                    </TopBarButton>
                </div>

                <TopBarButton onClick={() => setOpen(!open)}>
                    {open ? <ExpandLess color='gray' /> : <ExpandMore className="animate-pulse" color='gray' />}
                </TopBarButton>
            </div>
            <Collapse in={open}>
                <div style={{
                    fontFamily: locale === 'heb' ? '' : 'Geist, sans-serif',
                    padding: 6,
                    direction: locale === 'heb' ? 'rtl' : 'ltr',
                    textAlign: locale === 'heb' ? 'right' : 'left',
                    color: locale === 'heb' ? 'black' : '#374151', // Tailwind gray-700
                    fontSize: locale === 'heb' ? '0.85rem' : '0.9rem',
                    lineHeight: '1.4'
                }}>
                    <div className={isMobile ? 'line-clamp-4 overflow-hidden' : ''} style={isMobile ? {
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                    } : {}}>
                        {text.split(/(\([^)]+\))/g).map((part, index) =>
                            part.startsWith('(') && part.endsWith(')') ? (
                                <span key={index} style={{ fontSize: '0.75rem', color: 'grey' }}>
                                    {part}
                                </span>
                            ) : (
                                part
                            )
                        )}
                    </div>
                </div>
            </Collapse>
        </div>
    );
}
