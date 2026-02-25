'use client'

import { useState } from "react";
import { TopBarButton } from "@/components/IconButtons";
import PopUpCleaner from "@/components/PopUp";
import FlagIcon from "@/components/FlagIcon";
import { countries } from "@/utils/sources/countries";
import InnerLink from "@/components/InnerLink";
import useMobile from "@/components/useMobile";
import { createPortal } from "react-dom";

// Simple Globe Icon component
function GlobeIcon() {
    return (
        <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            style={{
                width: '1rem',
                height: '1rem',
                verticalAlign: 'middle',
                cursor: 'pointer'
            }}
        >
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
        </svg>
    );
}

export default function Flag({ country, locale, originalLocale }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <div className="h-full flex items-center justify-center">
                <TopBarButton onClick={() => setOpen(!open)}>
                    <FlagIcon country={country} />
                </TopBarButton>
            </div>
            <FlagSelector {...{ country, open, locale, originalLocale }} close={() => setOpen(false)} />
        </div>
    );
}

function FlagSelector({ country, open, close, locale, originalLocale }) {
    const { isMobile } = useMobile();

    // Use originalLocale for navigation if provided, fallback to locale
    const navigationLocale = originalLocale || locale;

    if (!open) return null;

    const dropdownContent = (
        <>
            <PopUpCleaner open={open} close={close} />
            <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-white rounded-xs shadow-lg w-[18rem] z-[9999] font-['Geist'] text-sm`} dir="ltr">
                <div className="grid grid-cols-2 gap-[1px] bg-gray-200">
                    {Object.keys(countries).map((c, i) => (
                        c === 'uae' ? (
                            // UAE is temporarily disabled due to Firestore collection naming issue
                            <div key={i} className={`flex justify-start items-center gap-2 p-2 cursor-not-allowed opacity-50 ${c === country ? 'bg-gray-50' : 'bg-white'}`}>
                                <FlagIcon country={c} />
                                {countries[c].english}
                            </div>
                        ) : (
                            <InnerLink key={i} locale={navigationLocale} href={`/${navigationLocale}/${c}`}>
                                <div className={`flex justify-start items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer ${c === country ? 'bg-gray-50' : 'bg-white'}`}>
                                    <FlagIcon country={c} />
                                    {countries[c].english}
                                </div>
                            </InnerLink>
                        )
                    ))}
                    {/* Add empty white cell if odd number of countries */}
                    {Object.keys(countries).length % 2 !== 0 && (
                        <div className="bg-white"></div>
                    )}
                </div>

                {/* Global page link - separate from the grid */}
                <div className="mt-3">
                    <InnerLink locale={navigationLocale} href={`/${navigationLocale}/global`}>
                        <div className="w-full flex justify-center items-center gap-2 p-2 hover:bg-gray-100 text-xs cursor-pointer bg-white rounded-xs border border-gray-100 shadow-lg">
                            <GlobeIcon />
                            Global View
                        </div>
                    </InnerLink>
                </div>
            </div>
        </>
    );

    // Render using portal to ensure it appears above everything, including sticky elements
    if (typeof window === 'undefined') return null;
    return createPortal(dropdownContent, document.body);
}