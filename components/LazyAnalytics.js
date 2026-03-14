'use client';

/**
 * Lazy-loaded analytics components
 * Defers loading until after page is interactive to improve initial load performance
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

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
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const isFeedPage = pathname?.endsWith('/feed');
        let timeoutId;
        let idleId;

        const markReady = () => {
            setIsReady(true);
        };

        if (isFeedPage) {
            const handleInteraction = () => {
                cleanup();
                markReady();
            };

            const cleanup = () => {
                window.removeEventListener('pointerdown', handleInteraction);
                window.removeEventListener('keydown', handleInteraction);
                window.removeEventListener('scroll', handleInteraction);
                if (timeoutId) {
                    window.clearTimeout(timeoutId);
                }
            };

            window.addEventListener('pointerdown', handleInteraction, { once: true, passive: true });
            window.addEventListener('keydown', handleInteraction, { once: true });
            window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
            timeoutId = window.setTimeout(markReady, 15000);

            return cleanup;
        }

        if ('requestIdleCallback' in window) {
            idleId = window.requestIdleCallback(markReady, { timeout: 3000 });
            return () => window.cancelIdleCallback(idleId);
        }

        timeoutId = window.setTimeout(markReady, 3000);
        return () => window.clearTimeout(timeoutId);
    }, [pathname]);

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
