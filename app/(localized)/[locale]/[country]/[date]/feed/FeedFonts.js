/**
 * Wrapper for CountryFonts component for feed pages
 */

import CountryFonts from '@/components/CountryFonts';
import HebrewFonts from '@/utils/typography/HebrewFonts';
import HebrewUIFonts from '@/utils/typography/HebrewUIFonts';

export default function FeedFonts({ country, locale }) {
    const needsFullHebrewFonts = country === 'israel';
    const needsHebrewUIFonts = locale === 'heb' && !needsFullHebrewFonts;

    return (
        <>
            {needsFullHebrewFonts ? <HebrewFonts /> : null}
            {needsHebrewUIFonts ? <HebrewUIFonts /> : null}
            {!needsFullHebrewFonts ? <CountryFonts country={country} /> : null}
        </>
    );
}
