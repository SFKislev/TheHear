'use client';

import { useEffect, useState } from "react";

export default function useMobile() {
    // Default to mobile-first approach (most traffic is mobile)
    // This minimizes CLS on mobile devices
    const [isMobile, setIsMobile] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 915); // Match Tailwind's sm breakpoint
        };

        checkIsMobile();
        setIsHydrated(true);

        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return { isMobile, isHydrated };
}