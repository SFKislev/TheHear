'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HebrewFonts from "@/utils/typography/HebrewFonts";
import GlobalGrid from "./GlobalGrid";
import GlobalSummarySection from "./GlobalSummarySection";
import GlobalTopBar from "./GlobalTopBar";
import EnglishFonts from "@/utils/typography/EnglishFonts";
import useMobile from "@/components/useMobile";
import Loader from "@/components/loader";
import { useFont } from "@/utils/store";
import { ServerCountryNavigation } from "@/utils/ServerSideLinks";

export default function GlobalPageContent({ locale, AICountrySort, countrySummaries, globalOverview }) {
    const router = useRouter();
    const { isMobile, isLoading } = useMobile();
    const [isGlobalSummaryCollapsed, setIsGlobalSummaryCollapsed] = useState(false);
    const { setFont } = useFont();

    // Set font to random for global page random font experience
    useEffect(() => {
        setFont("random");
    }, [setFont]);

    // Show loader while checking mobile status
    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className={`absolute flex flex-col w-full h-full overflow-auto ${locale === 'heb' ? 'direction-rtl' : 'direction-ltr'}`}>
            <HebrewFonts />
            <EnglishFonts />

            {/* Mobile title bar - only visible on mobile */}
            {isMobile && globalOverview && (
                <div className="bg-white border-b border-gray-200 py-2 px-4 text-center">
                    <h1 className={`text-gray-800 ${locale === 'heb' ? 'frank-re text-base py-2' : 'font-["Geist"] font-bold text-sm'}`}>
                        {locale === 'heb' ? globalOverview.hebrew.headline : globalOverview.english.headline}
                    </h1>
                </div>
            )}

            {/* Desktop layout with summary section */}
            {!isMobile && (
                <div className="flex flex-row w-full h-full overflow-hidden">
                    <div className={`${isGlobalSummaryCollapsed ? 'w-[48px]' : 'w-[380px]'} flex-shrink-0 border-l border-r border-gray-200 flex transition-all duration-300`}>
                        <GlobalSummarySection
                            locale={locale}
                            onCollapsedChange={setIsGlobalSummaryCollapsed}
                            globalOverview={globalOverview}
                        />
                    </div>
                    <div className="flex flex-col flex-[1] md:flex-[2] lg:flex-[3] 2xl:flex-[4]">
                        <div className="block">
                            <GlobalTopBar {...{locale}} />
                        </div>
                        <GlobalGrid {...{locale, AICountrySort, countrySummaries}} />
                    </div>
                </div>
            )}

            {/* Mobile layout without summary section */}
            {isMobile && (
                <div className="flex flex-col flex-1">
                    <div className="block">
                        <GlobalTopBar {...{locale}} />
                    </div>
                    <GlobalGrid {...{locale, AICountrySort, countrySummaries}} />
                </div>
            )}

            {/* Navigation links for crawlers */}
            <ServerCountryNavigation locale={locale} currentCountry="global" />
        </div>
    );
}