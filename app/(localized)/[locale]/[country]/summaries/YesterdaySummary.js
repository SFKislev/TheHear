'use client'

import { useEffect, useState } from "react";
import InnerLink from "@/components/InnerLink";
import { getHeadline } from "@/utils/daily summary utils";
import { Skeleton } from "@mui/material";
import { sub } from "date-fns";
import { createDateString } from '@/utils/utils';
import useFirebase from "@/utils/database/useFirebase";

export default function YesterdaySummary({ locale, country, yesterdaySummary, pageDate}) {
    const [dynamicYesterdaySummary, setDynamicYesterdaySummary] = useState(yesterdaySummary);
    const [lastCheckedDate, setLastCheckedDate] = useState(new Date().toDateString());
    const [isLoading, setIsLoading] = useState(false);
    const firebase = useFirebase();
    
    // Blinking state for the arrow
    const [blink, setBlink] = useState(true);
    useEffect(() => {
        const interval = setInterval(() => {
            setBlink(prev => !prev);
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    
    // Use the most current data available
    const currentSummary = dynamicYesterdaySummary || yesterdaySummary;
    let headline = <Skeleton variant="text" width={200} />;
    if (currentSummary) headline = getHeadline(currentSummary, locale);
    
    // Since this component only renders on today's page (pageDate is falsy),
    // always calculate yesterday from today
    const today = new Date();
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(today.getDate() - 1);
    yesterdayDate.setHours(23, 59, 0, 0);

    // Check if we need to fetch fresh yesterday summary when page becomes visible
    useEffect(() => {
        const fetchYesterdayData = async () => {
            if (!firebase.ready || pageDate) return; // Don't fetch for archive pages
            
            const currentDate = new Date().toDateString();
            if (currentDate !== lastCheckedDate) {
                try {
                    setIsLoading(true);
                    const freshYesterdayDate = sub(new Date(), { days: 1 });
                    const freshYesterdaySummary = await firebase.getCountryDailySummary(country, freshYesterdayDate);
                    setDynamicYesterdaySummary(freshYesterdaySummary);
                    setLastCheckedDate(currentDate);
                } catch (error) {
                    console.error('Failed to fetch fresh yesterday summary:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchYesterdayData();
            }
        };

        // Check on mount
        fetchYesterdayData();

        // Listen for visibility changes
        document.addEventListener("visibilitychange", handleVisibilityChange);
        
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [firebase, country, lastCheckedDate, pageDate]);

    // Reset to initial data when pageDate or country changes
    useEffect(() => {
        setDynamicYesterdaySummary(yesterdaySummary);
        setLastCheckedDate(new Date().toDateString());
        setIsLoading(false);
    }, [yesterdaySummary, country, pageDate]);

    let dateString
    if (pageDate){
        dateString = <span className={`font-['GeistMono'] font-medium ${locale === 'heb' ? 'text-[16px]' : ''}`}>{yesterdayDate.toLocaleDateString('en-GB').replace(/\//g, '.')}</span>;
    } else {
        dateString = locale == 'heb' ? 'אתמול' : 'Yesterday';
    }
        
    return (
        <InnerLink href={`/${locale}/${country}/${createDateString(yesterdayDate)}`}>
            <h2 className={`hidden sm:block py-2 px-2 cursor-pointer mt-1.5 ${locale === 'heb' ? 'text-[17px]' : 'text-base'} text-black hover:text-blue hover:underline hover:underline-offset-4 ${locale === 'en'
                ? 'font-["Geist"] pr-4 font-medium'
                : 'frank-re pl-4'
                }`}
                style={{ lineHeight: '1.4em'}}>

                <span>{dateString}</span>
                <span style={{ visibility: blink ? 'visible' : 'hidden' }}> {locale == 'heb' ? ' ⇢ ' : ' ⇠ '}</span>
                <span>{headline}</span>
            </h2>
        </InnerLink>
    );
}