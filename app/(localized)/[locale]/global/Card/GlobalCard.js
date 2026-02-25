'use client'

import { useEffect, useState } from "react";
import CountryName from "./CountryName";
import Headline from "./Headline";
import Content from "./Content";
import useFirebase from "@/utils/database/useFirebase";
import { useGlobalSort, useGlobalCountryCohesion, useGlobalCountryTimestamps } from "@/utils/store";
import { getCardSpanClasses } from "../responsiveGrid";
import { Skeleton } from "@mui/material";

export default function GlobalCard({ country, locale, pinned, index, typography, initialSummary }) {
    const [summary, setSummary] = useState(initialSummary || null) // Start with initialSummary for SSR
    const [mounted, setMounted] = useState(false)
    const setGlobalCountryCohesion = useGlobalCountryCohesion(state => state?.setGlobalCountryCohesion) || (() => {})
    const setGlobalCountryTimestamp = useGlobalCountryTimestamps(state => state?.setGlobalCountryTimestamp) || (() => {})
    const firebase = useFirebase()

    useEffect(() => {
        setMounted(true)
        // Set initial summary immediately for SSR compatibility
        if (initialSummary) {
            setSummary(initialSummary)
            setGlobalCountryCohesion(country, initialSummary.relativeCohesion)
            setGlobalCountryTimestamp(country, initialSummary.timestamp)
        }
    }, [initialSummary, country, setGlobalCountryCohesion, setGlobalCountryTimestamp])

    useEffect(() => {
        if (!mounted || !firebase.db) return;
        
        // Subscribe to real-time updates
        const unsubscribe = firebase.subscribeToSummaries(country, (newSummaries) => {
            if (newSummaries[0]) {
                setSummary(newSummaries[0])
                setGlobalCountryCohesion(country, newSummaries[0].relativeCohesion)
                setGlobalCountryTimestamp(country, newSummaries[0].timestamp)
            }
        })
        return () => unsubscribe();
    }, [country, firebase.db, mounted, setGlobalCountryCohesion, setGlobalCountryTimestamp])

    // Show skeleton if no summary available
    if (!summary) {
        return (
            <div style={{ order: index }}
                className={`global-card source-card relative bg-gray-100 hover:bg-white hover:shadow-xl
                            ${getCardSpanClasses(index)}
                            ${locale == 'heb' ? 'direction-rtl text-right' : 'direction-ltr'}
                            flex flex-col h-full justify-between`}>
                <div className="flex flex-col gap-4 mb-1 p-4">
                    <div className="flex items-center gap-2">
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="rectangular" width={24} height={18} />
                    </div>
                    <Skeleton variant="text" width="90%" height={32} />
                    <Skeleton variant="text" width="70%" height={24} />
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <Skeleton variant="text" width={40} height={20} />
                        <Skeleton variant="circular" width={24} height={24} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ order: index }}
            className={`global-card source-card relative ${pinned >= 0 ? 'bg-white border border-gray-100' : 'bg-gray-100'} hover:bg-white hover:shadow-xl
                        ${getCardSpanClasses(index)}
                        ${locale == 'heb' ? 'direction-rtl text-right' : 'direction-ltr'}
                        flex flex-col h-full justify-between`}>
            <div className="flex flex-col gap-4 mb-1 p-4">
                <CountryName {...{ country, typography, locale }} />    
                <Headline {...{ summary, country, locale, typography, index }} />
            </div>
            <Content {...{ country, summary, locale, pinned }} />
        </div>
    );
}