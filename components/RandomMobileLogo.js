'use client';

import { useEffect, useState } from 'react';
import DynamicLogo from '@/components/Logo';
import DynamicLogoSmall from '@/components/Logo-small';
import useMobile from '@/components/useMobile';

const STORAGE_KEY = 'thehear-mobile-logo-variant-last';
const WINDOW_CACHE_KEY = '__thehearMobileLogoVariant';

function getMobileVariantForPageLoad() {
    if (typeof window === 'undefined') return 'large';

    if (window[WINDOW_CACHE_KEY]) {
        return window[WINDOW_CACHE_KEY];
    }

    const variants = ['large', 'small'];
    let nextVariant = variants[Math.floor(Math.random() * variants.length)];

    try {
        const previousVariant = window.localStorage.getItem(STORAGE_KEY);
        if ((previousVariant === 'large' || previousVariant === 'small') && previousVariant === nextVariant) {
            nextVariant = previousVariant === 'large' ? 'small' : 'large';
        }
        window.localStorage.setItem(STORAGE_KEY, nextVariant);
    } catch {
        // Ignore storage errors and keep random variant.
    }

    window[WINDOW_CACHE_KEY] = nextVariant;
    return nextVariant;
}

export default function RandomMobileLogo({ desktopVariant = 'large', ...props }) {
    const { isMobile } = useMobile();
    const [mobileVariant, setMobileVariant] = useState(desktopVariant);

    useEffect(() => {
        if (!isMobile) return;
        setMobileVariant(getMobileVariantForPageLoad());
    }, [isMobile]);

    const selectedVariant = isMobile ? mobileVariant : desktopVariant;

    if (selectedVariant === 'small') {
        return <DynamicLogoSmall {...props} />;
    }

    return <DynamicLogo {...props} />;
}

