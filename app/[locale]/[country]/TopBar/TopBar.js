import TimeDisplay from "./TimeDisplay.js";
import Flag from "./Flag.js";
import { SettingsButton } from "./SettingsButton.js";
import { useTranslate, useTime } from "@/utils/store";
import useMobile from "@/components/useMobile";
import useVerticalScreen from "@/components/useVerticalScreen";
import Link from "next/link";
import InnerLink from '@/components/InnerLink';
import { countries } from "@/utils/sources/countries";
import FlagIcon from "@/components/FlagIcon";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import HebrewFonts from "@/utils/typography/HebrewFonts";
import { getHeadline } from '@/utils/daily summary utils';
import { trackEngagedUser } from "@/utils/analytics";

const Settings = dynamic(() => import("./settings/Settings"));

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

export default function TopBar({ locale, country, sources, currentSummary, initialSummaries, isRightPanelCollapsed, onExpandPanel, userCountry, pageDate, daySummary }) {
    const useLocalLanguage = useTranslate(state => state.useLocalLanguage);
    const { isMobile } = useMobile();
    const { isVerticalScreen } = useVerticalScreen();
    const date = useTime(state => state.date);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isWideScreen, setIsWideScreen] = useState(false);
    const hasTrackedSettings = useRef(false);

    // Track when settings are opened (once per session)
    useEffect(() => {
        if (settingsOpen && !hasTrackedSettings.current) {
            hasTrackedSettings.current = true;
            trackEngagedUser('settings_opened', {
                country,
                locale
            });
        }
    }, [settingsOpen, country, locale]);

    // Check if screen is wide enough to show region buttons (1240px+)
    useEffect(() => {
        const checkScreenSize = () => {
            setIsWideScreen(window.innerWidth >= 1240);
        };

        // Check on mount
        checkScreenSize();

        // Add event listener for resize
        window.addEventListener('resize', checkScreenSize);

        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Calculate conditions for hiding translate toggle
    const isSpecialCase = (locale === 'heb' && country === 'israel') ||
                         (locale === 'en' && (country === 'us' || country === 'uk'));

    // Force English behavior on mobile
    const effectiveLocale = isMobile ? 'en' : locale;

    // Find the current summary from initialSummaries if currentSummary is not available
    const findCurrentSummary = () => {
        if (currentSummary) return currentSummary;
        if (!initialSummaries || !date) return null;

        const sortedSummaries = initialSummaries.sort((a, b) => b.timestamp - a.timestamp);
        return sortedSummaries.find(summary => summary.timestamp <= date) || null;
    };

    const actualCurrentSummary = findCurrentSummary();

    // Get the appropriate headline based on locale and language settings
    const getCurrentHeadline = () => {
        if (!actualCurrentSummary) return null;

        let headline = actualCurrentSummary.englishHeadline;
        if (effectiveLocale === 'heb') {
            headline = actualCurrentSummary.hebrewHeadline || actualCurrentSummary.headline;
        }
        if (useLocalLanguage) {
            headline = actualCurrentSummary.translatedHeadline || actualCurrentSummary.headline;
        }
        return cleanSummaryText(headline);
    };

    const currentHeadline = getCurrentHeadline();

    const regions = {
        Europe: ['finland', 'france', 'germany', 'italy', 'netherlands', 'poland', 'russia', 'spain', 'turkey', 'uk', 'ukraine'],
        'Middle East': ['iran', 'israel', 'lebanon', 'palestine'],
        Asia: ['china', 'india', 'japan']
    };

    // Hebrew translations for regions and countries
    const hebrewTranslations = {
        regions: {
            'Europe': 'אירופה',
            'Middle East': 'המזרח התיכון',
            'Asia': 'אסיה',
            'US': 'ארה״ב',
            'Global': 'העולם'
        },
        countries: {
            'finland': 'פינלנד',
            'france': 'צרפת',
            'germany': 'גרמניה',
            'italy': 'איטליה',
            'netherlands': 'הולנד',
            'poland': 'פולין',
            'russia': 'רוסיה',
            'spain': 'ספרד',
            'kenya': 'קניה',
            'turkey': 'טורקיה',
            'uk': 'בריטניה',
            'ukraine': 'אוקראינה',
            'iran': 'איראן',
            'israel': 'ישראל',
            'lebanon': 'לבנון',
            'palestine': 'פלסטין',
            'china': 'סין',
            'india': 'הודו',
            'japan': 'יפן'
        }
    };

    // Helper function to get translated text
    const getTranslatedText = (text, type = 'regions') => {
        if (effectiveLocale === 'heb' && hebrewTranslations[type] && hebrewTranslations[type][text]) {
            return hebrewTranslations[type][text];
        }
        return text;
    };


    return (
        <>
            {/* Load Hebrew fonts when locale is Hebrew */}
            {effectiveLocale === 'heb' && <HebrewFonts />}

            <nav className="sticky top-0 left-0 w-full bg-white z-10 border-b border-gray-200">
                <div className="w-full mx-auto px-5">
                    <div className="flex items-center justify-between py-3">
                        {/* Left side: The Hear | TIME | FLAG */}
                        <div className="flex items-center min-w-0 flex-1">
                            {effectiveLocale !== 'heb' && (
                                <>
                                    <InnerLink href={`/${effectiveLocale}/global`}>
                                        <h1 className={`${effectiveLocale === 'heb' ? 'text-base' : 'text-sm'} font-medium cursor-pointer ${effectiveLocale === 'heb' ? 'frank-re' : 'font-["Geist"]'} whitespace-nowrap hover:text-blue transition-colors`}>The Hear</h1>
                                    </InnerLink>
                                    <div className="border-l border-dotted border-gray-500 self-stretch mx-2 sm:mx-5 flex-shrink-0"></div>
                                </>
                            )}
                            <TimeDisplay locale={effectiveLocale} country={country} />
                            <div className="border-l border-dotted border-gray-500 h-5 w-0 mx-2 sm:mx-5 flex-shrink-0"></div>
                            <Flag {...{ country, locale: effectiveLocale, originalLocale: locale}} />
                            {/* Show current summary title when right panel is collapsed or on vertical screens */}
                            {(isRightPanelCollapsed || isVerticalScreen) && currentHeadline && (
                                <>
                                    <div className="border-l border-gray-500 border-dotted h-5 w-0 mx-2 sm:mx-5 flex-shrink-0"></div>
                                    <div
                                        className={`text-gray-800 truncate cursor-pointer hover:underline hover:underline-offset-2 min-w-0 flex-1 max-w-xs sm:max-w-md ${effectiveLocale === 'heb' ? 'frank-re text-base' : 'font-["Geist"] text-sm'}`}
                                        onClick={onExpandPanel}
                                    >
                                        {currentHeadline}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right side: Navigation Links */}
                        <div className="flex items-center gap-4">
                            {/* Desktop: Show all buttons */}
                            <div className="hidden md:flex items-center gap-4">
                                {/* For date pages: Show daily title instead of global navigation */}
                                {pageDate && daySummary ? (
                                    <div className={`px-4 py-2 ${effectiveLocale === 'heb' ? 'text-base' : 'text-sm'} bg-zinc-50 rounded-md ${effectiveLocale === 'heb' ? 'frank-re' : 'font-["Geist"] font-medium'} flex items-center gap-2 text-black`}>
                                        {getHeadline(daySummary, effectiveLocale)}
                                    </div>
                                ) : (
                                    <>
                                        {/* US Link - hide when settings open or screen too narrow */}
                                        {!settingsOpen && isWideScreen && (
                                            <InnerLink href={`/${effectiveLocale}/us`}>
                                                <div className={`px-4 py-2 ${effectiveLocale === 'heb' ? 'text-base' : 'text-sm'} bg-gray-100 rounded-md hover:bg-gray-200 transition-colors ${effectiveLocale === 'heb' ? 'frank-re' : 'font-["Geist"]'} flex items-center gap-2 no-underline cursor-pointer`}>
                                                    {getTranslatedText('US')}
                                                </div>
                                            </InnerLink>
                                        )}

                                        {/* Region Dropdowns - hide when settings open or screen too narrow */}
                                        {!settingsOpen && isWideScreen && Object.entries(regions).map(([region, countryCodes]) => (
                                            <div key={region} className="group relative z-20">
                                                <div className={`px-4 py-2 ${effectiveLocale === 'heb' ? 'text-base' : 'text-sm'} bg-gray-100 rounded-md hover:bg-gray-200 transition-colors ${effectiveLocale === 'heb' ? 'frank-re' : 'font-["Geist"]'} flex items-center gap-1 cursor-pointer`}>
                                                    {getTranslatedText(region)}
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                {/* Add padding-top to create a hoverable gap */}
                                                <div className="absolute right-0 pt-2">
                                                    <div className="mt-2 w-64 bg-white rounded-sm shadow-lg hidden group-hover:block">
                                                        <div className="p-4">
                                                            <div className="grid grid-cols-2 gap-[1px] bg-gray-200">
                                                                {countryCodes.map((id) => (
                                                                    <InnerLink key={id} href={`/${effectiveLocale}/${id}`}>
                                                                        <div className={`flex items-center gap-2 p-2 hover:bg-gray-100 bg-white ${effectiveLocale === 'heb' ? 'frank-re' : 'font-["Geist"]'} no-underline cursor-pointer`}>
                                                                            <FlagIcon country={countries[id].id} />
                                                                            <span className={effectiveLocale === 'heb' ? 'text-sm' : 'text-xs'}>{effectiveLocale === 'heb' ? countries[id].hebrew : countries[id].english}</span>
                                                                        </div>
                                                                    </InnerLink>
                                                                ))}
                                                                {/* Add empty white cell if odd number of countries */}
                                                                {countryCodes.length % 2 !== 0 && (
                                                                    <div className="bg-white"></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Global Link - hide when settings open or screen too narrow */}
                                        {!settingsOpen && isWideScreen && (
                                            <InnerLink href={`/${effectiveLocale}/global`}>
                                                <div className={`px-4 py-2 ${effectiveLocale === 'heb' ? 'text-base' : 'text-sm'} bg-gray-100 rounded-md hover:bg-gray-200 transition-colors ${effectiveLocale === 'heb' ? 'frank-re' : 'font-["Geist"]'} flex items-center gap-2 no-underline cursor-pointer`}>
                                                    {getTranslatedText('Global')}
                                                </div>
                                            </InnerLink>
                                        )}
                                    </>
                                )}

                                {/* Settings Button */}
                                {!isVerticalScreen && (
                                    <SettingsButton
                                        {...{ locale: effectiveLocale, country, sources, isRightPanelCollapsed, userCountry, pageDate }}
                                        settingsOpen={settingsOpen}
                                        setSettingsOpen={setSettingsOpen}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Settings Bar - always render but hide when closed so FontToggle can react to panel changes */}
            {!isVerticalScreen && (
                <div className={`sticky top-[65px] left-0 w-full bg-white z-10 border-b border-gray-200 ${settingsOpen ? 'block' : 'hidden'}`}>
                    <div className="w-full mx-auto px-4 py-3">
                        <div className="flex justify-end">
                            <Settings
                                locale={effectiveLocale}
                                country={country}
                                sources={sources}
                                isRightPanelCollapsed={isRightPanelCollapsed}
                                hideLanguageToggle={isSpecialCase}
                                userCountry={userCountry}
                                pageDate={pageDate}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

