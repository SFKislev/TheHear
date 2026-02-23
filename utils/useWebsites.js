"use client";
import { getSourceOrder } from "./sources/getCountryData";
import { useActiveWebsites, useOrder } from "./store";
import useVerticalScreen from "../components/useVerticalScreen";
import { useEffect, useRef, useState } from "react";

export default function useWebsitesManager(country, sources) {
    const order = useOrder(state => state.order)
    const { activeWebsites, setActiveWebsites } = useActiveWebsites();
    const { isVerticalScreen } = useVerticalScreen();
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const previousAvailableCountRef = useRef(0);

    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i += 1) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    // Add window resize listener
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!sources) return;
        const sourceOrder = getSourceOrder(country, order);
        const availableSources = sourceOrder.filter(source => Boolean(sources[source]));
        
        // Determine number of cards based on screen width and orientation
        let cardLimit = 6;
        if (isVerticalScreen) {
            cardLimit = 8; // 8 cards for vertical screens
        } else if (windowWidth > 1920) {
            cardLimit = 11; // or any other number you prefer for larger screens
        }

        let nextWebsites;
        const preferredSources = availableSources.slice(0, cardLimit);
        const previousAvailableCount = previousAvailableCountRef.current;
        const availableCountIncreased = availableSources.length > previousAvailableCount;

        if (activeWebsites.length === 0) {
            nextWebsites = preferredSources;
        } else if (availableCountIncreased && activeWebsites.length === cardLimit) {
            // If sources recovered since last pass, refresh to preferred top sources.
            nextWebsites = preferredSources;
        } else {
            // Preserve user-selected active sources when possible.
            nextWebsites = activeWebsites.filter(source => availableSources.includes(source)).slice(0, cardLimit);
            for (const source of preferredSources) {
                if (nextWebsites.length >= cardLimit) break;
                if (!nextWebsites.includes(source)) nextWebsites.push(source);
            }
            for (const source of availableSources) {
                if (nextWebsites.length >= cardLimit) break;
                if (!nextWebsites.includes(source)) nextWebsites.push(source);
            }
        }

        previousAvailableCountRef.current = availableSources.length;
        if (!arraysEqual(activeWebsites, nextWebsites)) {
            setActiveWebsites(nextWebsites);
        }
    }, [sources, country, windowWidth, isVerticalScreen, order, setActiveWebsites]);

    return null
}
