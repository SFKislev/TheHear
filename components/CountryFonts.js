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
import { oswald, rubik, amiri, lalezar, alexandria, notoSansSC, zcoolKuaiLe, zcoolQingKe, notoSansJP, rocknRollOne, sawarabiGothic, pottaOne, kiwiMaru, delaGothicOne, notoSansDevanagari, palanquinDark } from '@/app/fonts';
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

    // Chinese
    'china': {
        component: ChinaFonts,
        fontClasses: [notoSansSC.variable, zcoolKuaiLe.variable, zcoolQingKe.variable]
    },

    // Japanese
    'japan': {
        component: JapaneseFonts,
        fontClasses: [notoSansJP.variable, rocknRollOne.variable, sawarabiGothic.variable, pottaOne.variable, kiwiMaru.variable, delaGothicOne.variable]
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
