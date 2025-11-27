'use client'

import { useState, useEffect, useRef } from "react";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import Disclaimer from "@/components/Disclaimer";
import DynamicLogoSmall from "@/components/Logo-small";
import GlobalOverview from "./GlobalOverview";
import CustomTooltip from "@/components/CustomTooltip";

export default function GlobalSummarySection({ locale, onCollapsedChange, globalOverview }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const isCollapsedRef = useRef(false);

    const toggleCollapse = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        isCollapsedRef.current = newCollapsedState;
        if (onCollapsedChange) {
            onCollapsedChange(newCollapsedState);
        }
    };

    // Set initial state based on screen size after component mounts
    useEffect(() => {
        const shouldBeCollapsed = window.innerWidth < 1920;
        setIsCollapsed(shouldBeCollapsed);
        isCollapsedRef.current = shouldBeCollapsed;
        setIsMounted(true);
        setIsSmallScreen(window.innerWidth < 1920);
        
        // Notify parent of initial collapsed state
        if (onCollapsedChange) {
            onCollapsedChange(shouldBeCollapsed);
        }

        const handleResize = () => {
            const shouldBeCollapsed = window.innerWidth < 1920;
            setIsSmallScreen(window.innerWidth < 1920);
            // Only auto-collapse, don't auto-expand (let user control expansion)
            if (shouldBeCollapsed && !isCollapsedRef.current) {
                setIsCollapsed(true);
                isCollapsedRef.current = true;
                if (onCollapsedChange) {
                    onCollapsedChange(true);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [onCollapsedChange]);

    // Don't render until we know the screen size to prevent flash
    if (!isMounted) {
        return null;
    }

    // Collapsed view - narrow bar similar to SideSlider
    if (isCollapsed) {
        return (
            <CustomTooltip title={locale === 'heb' ? 'סקירה גלובלית' : 'Global Overview'} followCursor placement="top">
                <div 
                    className={`flex flex-col items-center justify-start py-2 px-1 gap-2 h-full overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors`} 
                    style={{ width: '48px' }}
                    onClick={toggleCollapse}
                >
                    <IconButton 
                        size="small" 
                        className="mb-2 animate-pulse"
                        title=""
                        onClick={toggleCollapse}
                    >
                        {locale === 'heb' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                    </IconButton>
                </div>
            </CustomTooltip>
        );
    }

    // Expanded view - original layout with collapse button
    return (
        <div className={`summary-section flex flex-col gap-4 h-full overflow-hidden px-4 pb-2 w-full relative`}>
            {/* Collapse button positioned at top, aligned with TopBar */}
            <div className={`absolute top-3 ${locale === 'heb' ? 'left-1' : 'right-1'} z-50`}>
                <CustomTooltip title={locale === 'heb' ? 'הסתר סקירה' : 'hide overview'} placement="top">
                    <IconButton 
                        size="small" 
                        onClick={toggleCollapse}
                        title=""
                        style={{ 
                            padding: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        {locale === 'heb' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                    </IconButton>
                </CustomTooltip>
            </div>

            <div className="mb-2">
                {isSmallScreen ? <DynamicLogoSmall locale={locale} /> : <DynamicLogoSmall locale={locale} />}
            </div>
            
            <div className="h-full custom-scrollbar">
                <div className="px-4">
                    <GlobalOverview locale={locale} initialOverview={globalOverview} />
                </div>
            </div>
            <div className='py-1 bg-white border-t border-gray-200'>
                <div className="hidden sm:block">
                    <Disclaimer locale={locale} />
                </div>
            </div>
        </div>
    );
}