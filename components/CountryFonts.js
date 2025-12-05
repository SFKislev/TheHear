'use client';

/**
 * Dynamically loads country-specific fonts for all country pages
 * Only loads the fonts needed for the specific country to minimize bundle size
 */

import RussianFonts from '@/utils/typography/RussianFonts';
import ArabicFonts from '@/utils/typography/ArabicFonts';
import ChinaFonts from '@/utils/typography/ChinaFonts';
import JapaneseFonts from '@/utils/typography/JapaneseFonts';
import IndiaFonts from '@/utils/typography/IndiaFonts';
// Removed Japanese fonts: rocknRollOne, sawarabiGothic, pottaOne, kiwiMaru, delaGothicOne
// Removed Chinese fonts: zcoolKuaiLe, zcoolQingKe
import { oswald, rubik, amiri, lalezar, alexandria, notoSansSC, notoSansJP, notoSansDevanagari, palanquinDark } from '@/app/fonts';
import { useEffect } from 'react';

// Map countries to their font components and CSS variables
const countryFontConfig = {
    // Russian/Cyrillic countries
    'russia': {
        component: RussianFonts,
        fontClasses: [oswald.variable, rubik.variable]
    },
    'ukraine': {
        component: RussianFonts,
        fontClasses: [oswald.variable, rubik.variable]
    },

    // Arabic countries
    'iran': {
        component: ArabicFonts,
        fontClasses: [amiri.variable, lalezar.variable, alexandria.variable]
    },
    'lebanon': {
        component: ArabicFonts,
        fontClasses: [amiri.variable, lalezar.variable, alexandria.variable]
    },
    'palestine': {
        component: ArabicFonts,
        fontClasses: [amiri.variable, lalezar.variable, alexandria.variable]
    },
    'uae': {
        component: ArabicFonts,
        fontClasses: [amiri.variable, lalezar.variable, alexandria.variable]
    },

    // Chinese - REDUCED to 1 font (was 3) to fix render-blocking CSS
    // Keeping only Noto Sans SC (most reliable, 2 weights)
    'china': {
        component: ChinaFonts,
        fontClasses: [notoSansSC.variable]  // Only Noto Sans SC now
    },

    // Japanese - REDUCED to 1 font (was 6) to fix 291KB CSS render blocking
    // Keeping only Noto Sans JP (most reliable, 2 weights)
    'japan': {
        component: JapaneseFonts,
        fontClasses: [notoSansJP.variable]  // Only Noto Sans JP now
    },

    // Indian
    'india': {
        component: IndiaFonts,
        fontClasses: [notoSansDevanagari.variable, palanquinDark.variable]
    },

    // English/Hebrew/European countries use English/Hebrew fonts (loaded globally in layout)
    // No additional fonts needed: 'us', 'uk', 'israel', 'germany', 'france', 'italy', 'spain', 'poland', 'netherlands', 'finland', 'kenya', 'turkey'
};

export default function CountryFonts({ country }) {
    const fontConfig = countryFontConfig[country];

    useEffect(() => {
        if (fontConfig) {
            // Add font variable classes to document element
            const classes = fontConfig.fontClasses.join(' ');
            document.documentElement.className += ' ' + classes;

            // Cleanup on unmount
            return () => {
                fontConfig.fontClasses.forEach(fontClass => {
                    document.documentElement.classList.remove(fontClass);
                });
            };
        }
    }, [fontConfig]);

    if (!fontConfig) {
        // No additional fonts needed for this country
        // English/Hebrew fonts are already loaded globally
        return null;
    }

    // Render the country-specific font component (provides CSS variable definitions)
    const FontComponent = fontConfig.component;
    return <FontComponent />;
}
