'use client'

import { useState, useEffect, useRef } from "react";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import DynamicLogoSmall from "@/components/Logo-small";
import DynamicLogo from "@/components/Logo";
import SummariesSection from "./summaries/SummariesSection";
import CustomTooltip from "@/components/CustomTooltip";
import useSummariesManager from "@/utils/database/useSummariesManager";

export default function RightPanel({ initialSummaries, locale, country, yesterdaySummary, daySummary, pageDate, onCollapsedChange, collapsed }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const isCollapsedRef = useRef(isCollapsed);

    // Manage summaries at the RightPanel level so it works when collapsed
    const summaries = useSummariesManager(country, initialSummaries, !Boolean(pageDate));

    const toggleCollapse = () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);
        if (onCollapsedChange) {
            onCollapsedChange(newCollapsedState);
        }
    };

    // Update ref when isCollapsed changes
    useEffect(() => {
        isCollapsedRef.current = isCollapsed;
    }, [isCollapsed]);

    // Respond to external collapsed prop changes
    useEffect(() => {
        if (collapsed !== undefined && collapsed !== isCollapsed) {
            setIsCollapsed(collapsed);
        }
    }, [collapsed, isCollapsed]);

    // Set initial state based on screen size after component mounts
    useEffect(() => {
        const shouldBeCollapsed = window.innerWidth < 1920;
        setIsCollapsed(shouldBeCollapsed);
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
            <CustomTooltip title={locale === 'heb' ? 'סקירות בינה' : 'AI Overviews'} followCursor placement="top">
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
        <div className={`summary-section flex flex-col gap-4 h-full overflow-hidden px-4 pb-2 relative`} style={pageDate && locale !== 'heb' ? { paddingBottom: '60px' } : {}}>
            {/* Collapse button positioned at top, aligned with TopBar */}
            {/* Use fixed positioning from the top of the panel */}
            <div className={`absolute top-3 ${locale === 'heb' ? 'left-1' : 'right-1'} z-10`}>
                <CustomTooltip title={locale === 'heb' ? 'הסתר סקירות' : 'hide overviews'} placement="top">
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
            <div>
                {isSmallScreen ? <DynamicLogoSmall {...{ locale }} /> : <DynamicLogoSmall {...{ locale }} />}
            </div>
            <SummariesSection {...{ locale, summaries, country, yesterdaySummary, daySummary, pageDate }} />
        </div>
    );
}