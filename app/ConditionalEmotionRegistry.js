'use client';

/**
 * Conditionally loads EmotionRegistry only for pages that need MUI components
 * Feed pages don't use MUI, so we skip loading the 100KB+ CSS-in-JS runtime
 */

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import EmotionRegistry from './EmotionRegistry';

export default function ConditionalEmotionRegistry({ children }) {
    const pathname = usePathname();

    // Check if current page needs MUI/Emotion
    const needsEmotion = useMemo(() => {
        // Feed pages don't use MUI - skip EmotionRegistry
        if (pathname?.includes('/feed')) {
            return false;
        }
        // All other pages might use MUI components
        return true;
    }, [pathname]);

    if (!needsEmotion) {
        // Skip EmotionRegistry for feed pages - saves ~100KB+ of CSS-in-JS runtime
        return <>{children}</>;
    }

    // Load EmotionRegistry for pages that use MUI
    return (
        <EmotionRegistry options={{ key: 'mui' }}>
            {children}
        </EmotionRegistry>
    );
}
