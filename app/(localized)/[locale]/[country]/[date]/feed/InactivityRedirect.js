'use client'

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function InactivityRedirect({ locale, country, date, timeoutSeconds = 180 }) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
    const [showWarning, setShowWarning] = useState(false);
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);

    // Reset timer function
    const resetTimer = useCallback(() => {
        setTimeLeft(timeoutSeconds);
        setShowWarning(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Start countdown
        timeoutRef.current = setTimeout(() => {
            // Redirect to parent page (remove /feed)
            const parentUrl = `/${locale}/${country}/${date}`;
            router.push(parentUrl);
        }, timeoutSeconds * 1000);

        // Update countdown display (show warning in last 20 seconds)
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = prev - 1;
                if (newTime <= 20 && newTime > 0) {
                    setShowWarning(true);
                }
                return newTime;
            });
        }, 1000);
    }, [router, locale, country, date, timeoutSeconds]);

    // Activity event handlers
    const handleActivity = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    useEffect(() => {
        // Don't run for bots/crawlers - prevents Google from detecting redirects
        const userAgent = navigator.userAgent.toLowerCase();
        const isCrawler = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/i.test(userAgent);

        if (isCrawler) {
            return; // Don't start timer for crawlers
        }

        // Start timer on mount
        resetTimer();

        // Add activity event listeners
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });

        // Cleanup
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true);
            });
        };
    }, [handleActivity, resetTimer]);

    // Don't render anything if warning not shown
    if (!showWarning) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[10000] text-blue bg-white p-2 rounded-xl shadow-md">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-['Geist']">
                        Navigating to the Time Machine in {timeLeft}s...
                    </span>
                </div>
            </div>
        </div>
    );
}
