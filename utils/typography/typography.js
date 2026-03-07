import { choose } from "../utils";
import HebrewFonts, { Typography_Hebrew } from "./HebrewFonts";
import EnglishFonts, { Typography_English } from "./EnglishFonts";
import ArabicFonts, { Typography_Arabic } from "./ArabicFonts";
import JapaneseFonts, { Typography_Japanese } from "./JapaneseFonts";
import RussianFonts, { Typography_Russian } from "./RussianFonts";
import IndiaFonts, { Typography_India } from "./IndiaFonts";
import ChinaFonts, { Typography_China } from "./ChinaFonts";

export const countryTypographyOptions = {
    israel: { options: Typography_Hebrew, component: HebrewFonts },
    default: { options: Typography_English, component: EnglishFonts },

    lebanon: { options: Typography_Arabic, component: ArabicFonts },
    iran: { options: Typography_Arabic, component: ArabicFonts },
    palestine: { options: Typography_Arabic, component: ArabicFonts },
    uae: { options: Typography_Arabic, component: ArabicFonts },

    japan: { options: Typography_Japanese, component: JapaneseFonts },
    china: { options: Typography_China, component: ChinaFonts },
    india: { options: Typography_India, component: IndiaFonts },
    russia: {options: Typography_Russian, component: RussianFonts},
    ukraine: {options: Typography_Russian, component: RussianFonts},
};

export function getTypographyOptions(country) {
    return countryTypographyOptions[country] || countryTypographyOptions['default'];
}

function hashString(seed) {
    let hash = 2166136261;

    for (let i = 0; i < seed.length; i += 1) {
        hash ^= seed.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

export function getDeterministicTypography({ country, fallbackCountry, seed, isRTL }) {
    const primaryOptions = getTypographyOptions(country).options;
    const effectiveFallback = fallbackCountry || (isRTL ? "israel" : "us");
    const fallbackOptions = getTypographyOptions(effectiveFallback).options;
    const primaryIndex = hashString(`${country}:${seed}:primary`) % primaryOptions.length;
    const fallbackIndex = hashString(`${effectiveFallback}:${seed}:fallback`) % fallbackOptions.length;

    const candidate = primaryOptions[primaryIndex];

    if (!candidate || (candidate.direction === "rtl" && !isRTL) || (candidate.direction === "ltr" && isRTL)) {
        return fallbackOptions[fallbackIndex];
    }

    return candidate;
}
