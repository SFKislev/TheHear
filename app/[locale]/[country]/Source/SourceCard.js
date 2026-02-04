'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import CloseButton from "./CloseButton";
import Headline from "./Headine";
import SourceName from "./SourceName";
import { SourceFooter } from "./SourceFooter";
import { getTypographyOptions } from "@/utils/typography/typography";
import Subtitle from "./Subtitle";
import dynamic from "next/dynamic";
import { useFont, useTime, useTranslate, useActiveWebsites } from "@/utils/store";
import { checkRTL, choose } from "@/utils/utils";
import TranslatedLabel from "./TranslatedLabel";
import { getSourceData } from "@/utils/sources/getCountryData";
import RightClickMenu from "./RightClickMenu";

const SourceSlider = dynamic(() => import('./SourceSlider'));

const randomFontIndex = Math.floor(Math.random() * 100)

export default function SourceCard({ source, headlines, country, locale, isLoading, pageDate, isVerticalScreen, sources }) {
    const translate = useTranslate((state) => state.translate);
    const date = useTime((state) => state.date);
    const font = useFont((state) => state.font);
    const [headline, setHeadline] = useState(headlines && headlines.length > 0 ? headlines[0] : null);
    const [translations, setTranslations] = useState({});
    const websites = useActiveWebsites(state => state.activeWebsites);
    const [isPresent, setIsPresent] = useState(true);
    const [showLiveHint, setShowLiveHint] = useState(false);
    const liveHintStartedRef = useRef(false);
    const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0 });

    const index = websites.length > 0 ? websites.indexOf(source) : 1
    const shouldRender = headline && index !== -1;

    const sourceData = useMemo(() => getSourceData(country, source), [country, source])

    const shouldTranslate = useMemo(() => translate.includes(source) || translate.includes('ALL'), [translate, source]);

    const randomBgOpacity = useMemo(() => {
        const opacities = ['bg-opacity-20', 'bg-opacity-30', 'bg-opacity-40', 'bg-opacity-50', 'bg-opacity-60', 'bg-opacity-70', 'bg-opacity-80', 'bg-opacity-90'];
        return opacities[Math.floor(Math.random() * opacities.length)];
    }, []);

    useEffect(() => {
        if (!headlines || headlines.length === 0) return;
        if (!date) return;
        const foundHeadline = headlines.find(({ timestamp }) => timestamp <= date);
        setHeadline(foundHeadline || headlines[0]);
    }, [headlines, date]);


    useEffect(() => {
        if (shouldTranslate && headline && headline.headline && headline.id) {
            if (translations[headline.id]) return;
            (async () => {
                const res = await fetch('/api/translate', {
                    method: 'POST',
                    body: JSON.stringify({ headline: headline.headline, subtitle: headline.subtitle, locale }),
                    headers: { 'Content-Type': 'application/json' }
                })
                const resData = await res.json()
                setTranslations((prev) => ({ ...prev, [headline.id]: resData }))
            })();
        }
    }, [shouldTranslate, headline, source, translations, locale]);

    let displayHeadline = headline ? { ...headline } : null;
    let displayName = sourceData.name
    if (shouldRender && shouldTranslate && headline.id && translations[headline.id]) {
        displayHeadline.headline = translations[headline.id].headline;
        displayHeadline.subtitle = translations[headline.id].subtitle;
        displayName = checkRTL(translations[headline.id].headline) ? sourceData.translations.he : sourceData.translations.en
    } else if (shouldRender && shouldTranslate && (!headline.id || !translations[headline.id])) {
        displayHeadline = { headline: '', subtitle: '' }
    }

    const isRTL = useMemo(() => {
        if (!shouldRender) return false;
        return (displayHeadline.headline && checkRTL(displayHeadline.headline)) || checkRTL(displayName)
    }, [shouldRender, displayHeadline?.headline, displayName]);

    const typography = useMemo(() => {
        if (!shouldRender) return null;
        let typo = font
        const options = getTypographyOptions(country).options
        if (typeof font === 'number') typo = options[font % options.length]
        else if (font == 'random') typo = choose(options)

        if ((typo.direction === 'rtl' && !isRTL) || (typo.direction === 'ltr' && isRTL)) {
            const otherOptions = getTypographyOptions(isRTL ? 'israel' : 'us').options
            typo = otherOptions[randomFontIndex % otherOptions.length]
        }

        if (shouldTranslate) {
            const translatedOptions = getTypographyOptions(locale == 'heb' ? 'israel' : 'us').options
            typo = translatedOptions[randomFontIndex % translatedOptions.length]
        }

        return typo;
    }, [shouldRender, font, country, isRTL, shouldTranslate, locale]);

    useEffect(() => {
        setIsPresent(new Date() - date < 60 * 1000 * 5);
    }, [date]);

    useEffect(() => {
        if (pageDate) return;
        if (!shouldRender) return;
        if (isLoading) return;
        if (liveHintStartedRef.current) return;
        liveHintStartedRef.current = true;
        setShowLiveHint(true);
        const durationMs = Math.floor(3000 + Math.random() * 2000);
        const timer = setTimeout(() => setShowLiveHint(false), durationMs);
        return () => clearTimeout(timer);
    }, [pageDate, shouldRender, isLoading]);

    // Early return if shouldn't render
    if (!shouldRender) {
        return null;
    }

    return (
        <div style={{ order: index }}
            onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ open: true, x: e.clientX, y: e.clientY });
            }}
            className={`source-card group
            ${isVerticalScreen ? (index % 5 === 0 ? 'col-span-2' : 'col-span-1') : `col-span-1 ${index === 0 ? 'col-span-2' : ''} ${(index === 7 || index === 8) ? 'max-xl:col-span-1 qhd:col-span-1' : ''} ${(index === 11 || index === 12 || index === 13) ? 'max-qhd:col-span-1 qhd:col-span-2' : ''}`}
            relative bg-neutral-100 hover:bg-white hover:shadow-xl
            ${isRTL ? 'direction-rtl' : 'direction-ltr'}
            ${!isPresent ? `bg-off-white ${randomBgOpacity} outline outline-1 outline-neutral-300 outline-dotted` : ''}
            ${shouldTranslate ? 'bg-white shadow-lg border border-dotted' : ''}
        `}>
            <TranslatedLabel locale={locale} active={shouldTranslate} className="group-hover:opacity-0" />
            <CloseButton name={source} isRTL={isRTL} className="z-[2]" />
            <div className="flex flex-col h-full justify-normal sm:justify-between">
                <div className="flex flex-col gap-2 mb-2 p-4">
                    <div className={`flex items-center gap-2 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <SourceName
                            name={displayName}
                            description={sourceData.description}
                            {...{ typography, date, isLoading }}
                            align={isRTL ? 'right' : 'left'}
                        />
                        {showLiveHint && (
                            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-white/80 shadow-sm border border-gray-200">
                                <span className="h-2.5 w-2.5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                            </span>
                        )}
                    </div>
                    <Headline headline={displayHeadline}
                        {...{ typography, isLoading }} />
                </div>
                <div>
                    <Subtitle headlineData={displayHeadline} {...{ isLoading }} />
                    <SourceSlider {...{ locale, country, headlines, pageDate }} />
                    <SourceFooter url={headlines && headlines.length > 0 ? headlines[0].link : ''} {...{ headline, headlines, source, pageDate }} />
                </div>
            </div>
            <RightClickMenu
                open={contextMenu.open}
                position={{ x: contextMenu.x, y: contextMenu.y }}
                close={() => setContextMenu({ open: false, x: 0, y: 0 })}
                {...{ country, locale, sources }}
            />
        </div>
    );
}
