'use client'

import { useState, useEffect, useRef } from "react";
import { TopBarButton } from "@/components/IconButtons";
import FlagIcon from "@/components/FlagIcon";
import { countries } from "@/utils/sources/countries";
import InnerLink from "@/components/InnerLink";
import useMobile from "@/components/useMobile";

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

export default function HistoryCountryNavigator({ country, locale }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative z-[1000]" ref={dropdownRef}>
            <div className="h-full flex items-center justify-center">
                <TopBarButton 
                    onClick={() => setOpen(!open)}
                    aria-label={locale === 'heb' ? 'שנה מדינה' : 'Change country'}
                >
                    <FlagIcon country={country} />
                </TopBarButton>
            </div>
            <HistoryCountrySelector {...{ country, open, locale }} close={() => setOpen(false)} />
        </div>
    );
}

function HistoryCountrySelector({ country, open, close, locale }) {
    const { isMobile } = useMobile();
    
    if (!open) return null;

    return (
        <div className={`${
            isMobile 
                ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
                : `absolute top-10 ${locale === 'heb' ? 'right-0' : 'left-0'}`
        } p-4 bg-white rounded-xs shadow-lg w-[18rem] z-[1000] font-['Geist'] text-sm`} dir="ltr">
            <div className="grid grid-cols-2 gap-[1px] bg-gray-200">
                {Object.keys(countries)
                    .filter(c => c !== 'uae' && c !== 'finland')
                    .map((c, i) => (
                        <InnerLink key={i} locale={locale} href={`/${locale}/${c}/history`}>
                            <div className={`flex justify-start items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer ${c === country ? 'bg-gray-50' : 'bg-white'}`}>
                                <FlagIcon country={c} />
                                {countries[c].english}
                            </div>
                        </InnerLink>
                    ))}
                {/* Add empty white cell if odd number of countries */}
                {Object.keys(countries).length % 2 !== 0 && (
                    <div className="bg-white"></div>
                )}
            </div>
            
            {/* Global page link - separate from the grid */}
            <div className="mt-3">
                <InnerLink locale={locale} href={`/${locale}/global`}>
                    <div className="w-full flex justify-center items-center gap-2 p-2 hover:bg-gray-100 text-xs cursor-pointer bg-white rounded-xs border border-gray-100 shadow-lg">
                        <GlobeIcon />
                        Global View
                    </div>
                </InnerLink>
            </div>
        </div>
    );
}
