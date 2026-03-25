'use client';

import CountryFonts from "@/components/CountryFonts";
import { getTypographyOptions } from "@/utils/typography/typography";

export default function MixFonts({ countries }) {
    const uniqueCountries = [...new Set(countries || [])];
    const typographyComponents = uniqueCountries
        .map((country) => getTypographyOptions(country).component)
        .filter(Boolean)
        .filter((component, index, array) => array.indexOf(component) === index);

    return (
        <>
            {uniqueCountries.map((country) => (
                <CountryFonts key={country} country={country} />
            ))}
            {typographyComponents.map((TypographyComponent, index) => (
                <TypographyComponent key={index} />
            ))}
        </>
    );
}
