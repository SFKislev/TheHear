'use client';

/**
 * Lazy-loaded analytics components
 * Defers loading until after page is interactive to improve initial load performance
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import analytics with no SSR
const Analytics = dynamic(() => import('@vercel/analytics/react').then(mod => mod.Analytics), {
    ssr: false,
    loading: () => null
});

const SpeedInsights = dynamic(() => import('@vercel/speed-insights/react').then(mod => mod.SpeedInsights), {
    ssr: false,
    loading: () => null
});

const GoogleAnalytics = dynamic(() => import('./GoogleAnalytics'), {
    ssr: false,
    loading: () => null
});

export default function LazyAnalytics() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Defer analytics loading until after page is interactive
        // Wait for idle callback or 3 seconds, whichever comes first
        if (typeof window !== 'undefined') {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => setIsReady(true), { timeout: 3000 });
            } else {
                setTimeout(() => setIsReady(true), 3000);
            }
        }
    }, []);

    if (!isReady) {
        return null;
    }

    return (
        <>
            <Analytics />
            <SpeedInsights />
            <GoogleAnalytics />
        </>
    );
}
