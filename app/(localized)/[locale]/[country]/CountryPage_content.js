'use client'

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import TopBar from "./TopBar/TopBar";
import { getTypographyOptions } from "@/utils/typography/typography";
import MainSection from "./MainSection";
import useCurrentSummary from "@/utils/database/useCurrentSummary";
import { useRightPanel, useFont, useOrder } from "@/utils/store";
import useMobile from "@/components/useMobile";
import useVerticalScreen from "@/components/useVerticalScreen";
import Loader from "@/components/loader";
import { useSearchParams } from "next/navigation";
import { orderOptionLabels } from "@/utils/sources/getCountryData";

const RightPanel = dynamic(() => import("./RightPanel"), { loading: () => null });
const SideSlider = dynamic(() => import("./SideSlider"), { loading: () => null });
const FirstVisitModal = dynamic(() => import("./FirstVisitModal"), { ssr: false, loading: () => null });
const AboutMenu = dynamic(() => import("./TopBar/AboutMenu"), { ssr: false, loading: () => null });
const DateNavigator = dynamic(() => import("@/components/DateNavigator"), { loading: () => null });

function OrderParamSync({ country, order, setOrder }) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const orderParam = searchParams.get('order');
        if (!orderParam) return;

        const normalizedParam = orderParam.trim().toLowerCase();
        let nextOrder = null;
        const useCampaignPresets = country === 'us' || country === 'israel';

        if (normalizedParam === 'liberal') {
            nextOrder = useCampaignPresets ? 'campaignLiberal' : 'progressiveToConservative';
        } else if (normalizedParam === 'conservative') {
            nextOrder = useCampaignPresets ? 'campaignConservative' : 'conservativeToProgressive';
        } else if (Object.prototype.hasOwnProperty.call(orderOptionLabels, normalizedParam)) {
            nextOrder = normalizedParam;
        }

        if (nextOrder && nextOrder !== order) {
            setOrder(nextOrder);
        }
    }, [searchParams, country, order, setOrder]);

    return null;
}

export default function CountryPageContent({ sources, initialSummaries, yesterdaySummary, daySummary, locale, country, pageDate, userCountry }) {
    const [userCountryState, setUserCountryState] = useState(userCountry);
    const typography = getTypographyOptions(country);
    const currentSummary = useCurrentSummary();
    const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true);
    const { setCollapsed } = useRightPanel();
    const { isMobile, isHydrated } = useMobile();
    const { isVerticalScreen } = useVerticalScreen();
    const { setFont } = useFont();
    const { order, setOrder } = useOrder();
    const [aboutOpen, setAboutOpen] = useState(false);
    const [showDeferredUi, setShowDeferredUi] = useState(Boolean(pageDate));
    const TypographyComponent = typography.component;
    const shouldLoadTypographyComponent =
        TypographyComponent?.name !== 'EnglishFonts' &&
        !(locale === 'heb' && TypographyComponent?.name === 'HebrewFonts');

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
        const fetchUserCountry = () => {
            fetch('/api/user-country')
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (!cancelled && data?.country) {
                        setUserCountryState(data.country);
                    }
                })
                .catch(() => { });
        };

        let cleanup = null;
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(fetchUserCountry, { timeout: 2000 });
            cleanup = () => window.cancelIdleCallback(idleId);
        } else {
            const timeoutId = window.setTimeout(fetchUserCountry, 800);
            cleanup = () => window.clearTimeout(timeoutId);
        }

        return () => {
            cancelled = true;
            cleanup?.();
        };
    }, [userCountryState]);

    useEffect(() => {
        if (pageDate) {
            return;
        }

        let cancelled = false;
        const enableDeferredUi = () => {
            if (!cancelled) {
                setShowDeferredUi(true);
            }
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(enableDeferredUi, { timeout: 1500 });
            return () => {
                cancelled = true;
                window.cancelIdleCallback(idleId);
            };
        }

        const timeoutId = window.setTimeout(enableDeferredUi, 800);
        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [pageDate]);

    return (
        <>
            <Suspense fallback={null}>
                <OrderParamSync country={country} order={order} setOrder={setOrder} />
            </Suspense>
            {!isHydrated && (
                <div className="absolute inset-0 z-50">
                    <Loader />
                </div>
            )}
            <FirstVisitModal openAbout={() => setAboutOpen(true)} country={country} locale={locale} pageDate={pageDate} />
            <AboutMenu open={aboutOpen} onClose={() => setAboutOpen(false)} />
            <div id='main' style={{ paddingBottom: "var(--footer-offset, 3rem)" }} className={`absolute flex flex-col sm:flex-row w-full h-full overflow-auto sm:overflow-hidden ${effectiveLocale === 'heb' ? 'direction-rtl' : 'direction-ltr'}`}>
                {shouldLoadTypographyComponent && <TypographyComponent />}
                {showDeferredUi && !isVerticalScreen && <SideSlider {...{ locale, country, pageDate }} />}
                
                {/* Right Panel - only show on desktop, not vertical screens */}
                {showDeferredUi && !isVerticalScreen && (
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
                    {showDeferredUi && pageDate && (
                        <DateNavigator {...{ locale, country, pageDate }} />
                    )}
                </div>
            </div>
        </>
    );
}
