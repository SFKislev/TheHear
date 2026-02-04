'use client'

import { useState, useEffect } from "react";
import RightPanel from "./RightPanel";
import SideSlider from "./SideSlider";
import TopBar from "./TopBar/TopBar";
import EnglishFonts from "@/utils/typography/EnglishFonts";
import { getTypographyOptions } from "@/utils/typography/typography";
import MainSection from "./MainSection";
import HebrewFonts from "@/utils/typography/HebrewFonts";
import useCurrentSummary from "@/utils/database/useCurrentSummary";
import { useRightPanel, useFont } from "@/utils/store";
import useMobile from "@/components/useMobile";
import useVerticalScreen from "@/components/useVerticalScreen";
import Loader from "@/components/loader";
import FirstVisitModal from './FirstVisitModal';
import AboutMenu from './TopBar/AboutMenu';
import DateNavigator from '@/components/DateNavigator';

export default function CountryPageContent({ sources, initialSummaries, yesterdaySummary, daySummary, locale, country, pageDate, userCountry }) {
    const [userCountryState, setUserCountryState] = useState(userCountry);
    const typography = getTypographyOptions(country);
    const currentSummary = useCurrentSummary();
    const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
    const { setCollapsed } = useRightPanel();
    const { isMobile, isHydrated } = useMobile();
    const { isVerticalScreen } = useVerticalScreen();
    const { setFont } = useFont();
    const [aboutOpen, setAboutOpen] = useState(false);

    // Force English behavior on mobile
    const effectiveLocale = isMobile ? 'en' : locale;

    // Sync local state with global store
    useEffect(() => {
        setCollapsed(isRightPanelCollapsed);
    }, [isRightPanelCollapsed, setCollapsed]);

    // Enable font salad (random fonts) for vertical screens
    useEffect(() => {
        if (isVerticalScreen) {
            setFont('random');
        }
    }, [isVerticalScreen, setFont]);

    useEffect(() => {
        if (userCountryState) return;
        let cancelled = false;

        fetch('/api/user-country')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (!cancelled && data?.country) {
                    setUserCountryState(data.country);
                }
            })
            .catch(() => { });

        return () => {
            cancelled = true;
        };
    }, [userCountryState]);

    return (
        <>
            {!isHydrated && (
                <div className="absolute inset-0 z-50">
                    <Loader />
                </div>
            )}
            <FirstVisitModal openAbout={() => setAboutOpen(true)} country={country} locale={locale} pageDate={pageDate} />
            <AboutMenu open={aboutOpen} onClose={() => setAboutOpen(false)} />
            <div id='main' style={{ paddingBottom: "var(--footer-offset, 3rem)" }} className={`absolute flex flex-col sm:flex-row w-full h-full overflow-auto sm:overflow-hidden ${effectiveLocale === 'heb' ? 'direction-rtl' : 'direction-ltr'}`}>
                <EnglishFonts />
                {locale == 'heb' && <HebrewFonts />}
                <typography.component />
                {!isVerticalScreen && <SideSlider {...{ locale, country, pageDate }} />}
                
                {/* Right Panel - only show on desktop, not vertical screens */}
                {!isVerticalScreen && (
                    <div className={`hidden sm:flex flex-[1 sm:border-l sm:border-r border-gray-200 max-w-[400px] `}>
                    <RightPanel
                        {...{ initialSummaries, locale, country, yesterdaySummary, daySummary, pageDate }}
                        onCollapsedChange={setIsRightPanelCollapsed}
                        collapsed={isRightPanelCollapsed}
                    />
                </div>
                )}

                <div className="flex flex-col flex-[1] sm:flex-[1] md:flex-[2] lg:flex-[3] 2xl:flex-[4]">
                    <TopBar
                        {...{ locale, country, sources, userCountry: userCountryState, pageDate, daySummary }}
                        currentSummary={currentSummary}
                        initialSummaries={initialSummaries}
                        isRightPanelCollapsed={isRightPanelCollapsed}
                        onExpandPanel={() => setIsRightPanelCollapsed(false)}
                    />
                    <MainSection {...{ country, sources, locale, pageDate, initialSummaries, yesterdaySummary, daySummary, isVerticalScreen }} />
                    {pageDate && (
                        <DateNavigator {...{ locale, country, pageDate }} />
                    )}
                </div>
            </div>
        </>
    );
}
