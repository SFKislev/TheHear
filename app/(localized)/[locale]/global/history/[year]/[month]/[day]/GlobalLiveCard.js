'use client'

import { useState, useMemo } from 'react';
import InnerLink from '@/components/InnerLink';
import { getTypographyOptions } from '@/utils/typography/typography';
import { choose, checkRTL } from '@/utils/utils';
import { useFont, useTranslate } from '@/utils/store';

const randomFontIndex = Math.floor(Math.random() * 100);

export default function GlobalLiveCard({ locale }) {
    const translate = useTranslate((state) => state.translate);
    const storeFont = useFont((state) => state.font);
    
    const displayText = locale === 'heb' 
        ? `אל העכשיו ⟵`
        : `Live Global View ⟶`;

    // Dynamic typography logic from ArchiveCard
    const shouldTranslate = useMemo(() => translate.includes('ALL'), [translate]);
    
    const isRTL = useMemo(() => checkRTL(displayText), [displayText]);
    
    const typography = useMemo(() => {
        let typo = storeFont;
        // Use locale to determine typography options instead of country
        const localeCountry = locale === 'heb' ? 'israel' : 'us';
        const options = getTypographyOptions(localeCountry).options;
        if (typeof storeFont === 'number') typo = options[storeFont % options.length];
        else if (storeFont == 'random') typo = choose(options);

        if ((typo.direction === 'rtl' && !isRTL) || (typo.direction === 'ltr' && isRTL)) {
            const otherOptions = getTypographyOptions(isRTL ? 'israel' : 'us').options;
            typo = otherOptions[randomFontIndex % otherOptions.length];
        }

        if (shouldTranslate) {
            const translatedOptions = getTypographyOptions(locale == 'heb' ? 'israel' : 'us').options;
            typo = translatedOptions[randomFontIndex % translatedOptions.length];
        }

        return typo;
    }, [storeFont, locale, isRTL, shouldTranslate]);

    return (
        <InnerLink 
            href={`/${locale}/global`}
            className="block"
        >
            <div className={`
                col-span-1 relative bg-[#223052] hover:bg-gray-900 transition-colors duration-50 h-full
                ${isRTL ? 'direction-rtl' : 'direction-ltr'}
            `}>
                <div className="flex flex-col h-full justify-center items-center p-4">
                    <span 
                        className="text-lg text-center text-white"
                        style={{ 
                            ...typography, 
                            direction: isRTL ? 'rtl' : 'ltr',
                            display: 'block',
                            whiteSpace: 'pre-line',
                            textAlign: 'center',
                            color: 'white'
                        }}
                    >
                        {displayText}
                    </span>
                </div>
            </div>
        </InnerLink>
    );
}