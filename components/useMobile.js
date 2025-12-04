'use client';

import { useEffect, useState } from "react";

export default function useMobile() {
    // Default to mobile-first approach (most traffic is mobile)
    // This minimizes CLS on mobile devices
    const [isMobile, setIsMobile] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 915); // Match Tailwind's sm breakpoint
            setIsLoading(false); // Mobile detection complete
        };

        // Set initial state
        checkIsMobile();

        // Add resize listener to update when window size changes
        window.addEventListener('resize', checkIsMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return { isMobile, isLoading };
}