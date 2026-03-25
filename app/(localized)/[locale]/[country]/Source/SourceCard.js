'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import CloseButton from "./CloseButton";
import Headline from "./Headine";
import SourceName from "./SourceName";
import { SourceFooter } from "./SourceFooter";
import { getDeterministicTypography, getTypographyOptions } from "@/utils/typography/typography";
import Subtitle from "./Subtitle";
import dynamic from "next/dynamic";
import { useFont, useTime, useTranslate, useActiveWebsites } from "@/utils/store";
import { checkRTL, choose } from "@/utils/utils";
import TranslatedLabel from "./TranslatedLabel";
import { getSourceData } from "@/utils/sources/getCountryData";

const SourceSlider = dynamic(() => import('./SourceSlider'));
const RightClickMenu = dynamic(() => import('./RightClickMenu'), { ssr: false, loading: () => null });

const randomFontIndex = Math.floor(Math.random() * 100)

export default function SourceCard({
    source,
    headlines,
    country,
    locale,
    isLoading,
    pageDate,
    isVerticalScreen,
    sources,
    sourceKey = source,
    activeWebsitesOverride = null,
    sourceDataOverride = null,
    onClose = null,
    disableContextMenu = false,
    renderWhenEmpty = false,
    preferRandomTypography = false,
}) {
    const translate = useTranslate((state) => state.translate);
    const isTranslationTemporarilyPaused = useTranslate((state) => state.isTemporarilyPaused);
    const date = useTime((state) => state.date);
    const font = useFont((state) => state.font);
    const [headline, setHeadline] = useState(headlines && headlines.length > 0 ? headlines[0] : null);
    const [translations, setTranslations] = useState({});
    const storeWebsites = useActiveWebsites(state => state.activeWebsites);
    const websites = activeWebsitesOverride || storeWebsites;
    const [isPresent, setIsPresent] = useState(true);
    const [allowLiveHeadlineRefresh, setAllowLiveHeadlineRefresh] = useState(Boolean(pageDate));
    const [showLiveHint, setShowLiveHint] = useState(false);
    const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0 });
    const liveHintStartedRef = useRef(false);
    const previousHeadlineIdRef = useRef(headline?.id ?? null);
    const isCountryRTL = country?.toLowerCase() === 'israel';

    const index = websites.length > 0 ? websites.indexOf(sourceKey) : 1
    const shouldRender = index !== -1 && (headline || renderWhenEmpty);

    const sourceData = useMemo(() => sourceDataOverride || getSourceData(country, source), [sourceDataOverride, country, source])

    const shouldTranslate = useMemo(
        () => !isTranslationTemporarilyPaused && (translate.includes(sourceKey) || translate.includes('ALL')),
        [translate, sourceKey, isTranslationTemporarilyPaused]
    );

    const randomBgOpacity = useMemo(() => {
        const opacities = ['bg-opacity-20', 'bg-opacity-30', 'bg-opacity-40', 'bg-opacity-50', 'bg-opacity-60', 'bg-opacity-70', 'bg-opacity-80', 'bg-opacity-90'];
        return opacities[Math.floor(Math.random() * opacities.length)];
    }, []);

    useEffect(() => {
        if (pageDate) {
            setAllowLiveHeadlineRefresh(true);
            return;
        }

        let cancelled = false;
        const enableRefresh = () => {
            if (!cancelled) {
                setAllowLiveHeadlineRefresh(true);
            }
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(enableRefresh, { timeout: 4000 });
            return () => {
                cancelled = true;
                window.cancelIdleCallback(idleId);
            };
        }

        const timeoutId = window.setTimeout(enableRefresh, 2500);
        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [pageDate]);

    useEffect(() => {
        if (!headlines || headlines.length === 0) return;
        if (!date) return;
        if (!allowLiveHeadlineRefresh && headline) return;
        const foundHeadline = headlines.find(({ timestamp }) => timestamp <= date);
        setHeadline(foundHeadline || headlines[0]);
    }, [headlines, date, allowLiveHeadlineRefresh, headline]);

    useEffect(() => {
        if (pageDate || !headline?.id) {
            previousHeadlineIdRef.current = headline?.id ?? null;
            return;
        }

        const previousHeadlineId = previousHeadlineIdRef.current;
        previousHeadlineIdRef.current = headline.id;

        if (!previousHeadlineId || previousHeadlineId === headline.id) return;

        setShowLiveHint(false);
    }, [pageDate, headline?.id]);

    useEffect(() => {
        if (shouldTranslate && headline && headline.headline && headline.id) {
            if (translations[headline.id]) return;
            (async () => {
                const res = await fetch('/api/deepseek-translate', {
                    method: 'POST',
                    body: JSON.stringify({ headline: headline.headline, subtitle: headline.subtitle, locale }),
                    headers: { 'Content-Type': 'application/json' }
                })
                const resData = await res.json()
                setTranslations((prev) => ({ ...prev, [headline.id]: resData }))
            })();
        }
    }, [shouldTranslate, headline, source, translations, locale]);

    let displayHeadline = headline ? { ...headline } : { headline: '', subtitle: '' };
    let displayName = sourceData.name
    if (shouldRender && shouldTranslate && headline?.id && translations[headline.id]) {
        displayHeadline.headline = translations[headline.id].headline;
        displayHeadline.subtitle = translations[headline.id].subtitle;
        displayName = checkRTL(translations[headline.id].headline) ? sourceData.translations.he : sourceData.translations.en
    } else if (shouldRender && shouldTranslate && (!headline?.id || !translations[headline.id])) {
        displayHeadline = { headline: '', subtitle: '' }
    }

    const isRTL = useMemo(() => {
        if (!shouldRender) return false;
        return (displayHeadline?.headline && checkRTL(displayHeadline.headline)) || checkRTL(displayName)
    }, [shouldRender, displayHeadline?.headline, displayName]);

    const typography = useMemo(() => {
        if (!shouldRender) return null;

        if (preferRandomTypography) {
            const typographyCountry = shouldTranslate
                ? (locale == 'heb' ? 'israel' : 'us')
                : country;

            return getDeterministicTypography({
                country: typographyCountry,
                seed: String(sourceKey || source),
                isRTL,
                text: displayHeadline?.headline || displayName,
            });
        }

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
    }, [shouldRender, preferRandomTypography, font, country, isRTL, shouldTranslate, locale, sourceKey, source, displayHeadline?.headline, displayName]);

    useEffect(() => {
        setIsPresent(new Date() - date < 60 * 1000 * 5);
    }, [date]);

    useEffect(() => {
        if (pageDate) {
            setShowLiveHint(false);
            return;
        }
        if (!shouldRender) return;
        if (liveHintStartedRef.current) return;

        liveHintStartedRef.current = true;
        setShowLiveHint(true);

        const durationMs = Math.floor(3000 + Math.random() * 2000);
        const timer = window.setTimeout(() => setShowLiveHint(false), durationMs);
        return () => window.clearTimeout(timer);
    }, [pageDate, shouldRender]);

    const shouldShowLiveHint = !pageDate && (isLoading || showLiveHint);
    const isTranslationLoading = shouldRender && shouldTranslate && Boolean(headline?.id) && !translations[headline.id];

    // Early return if shouldn't render
    if (!shouldRender) {
        return null;
    }

    return (
        <div style={{ order: index }}
            onContextMenu={(e) => {
                if (disableContextMenu) return;
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
            <CloseButton name={sourceKey} isRTL={isRTL} className="z-[2]" onClose={onClose} />
            <div className="flex flex-col h-full justify-normal sm:justify-between">
                <div className="flex flex-col gap-2 mb-2 p-4">
                    <div className={`relative w-full ${shouldShowLiveHint ? (isCountryRTL ? 'pr-6' : 'pl-6') : ''}`}>
                        {shouldShowLiveHint ? (
                            <span
                                className={`absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-4 w-4 shrink-0 rounded-full bg-white/80 shadow-sm border border-gray-200 ${isCountryRTL ? 'right-0' : 'left-0'}`}
                                aria-label="Live updates syncing"
                                title="Live updates syncing"
                            >
                                <span className="h-2.5 w-2.5 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                            </span>
                        ) : null}
                        <SourceName
                            name={displayName}
                            description={sourceData.description}
                            {...{ typography, date, isLoading }}
                            align={isRTL ? 'right' : 'left'}
                        />
                    </div>
                    <Headline headline={displayHeadline}
                        typography={typography}
                        isLoading={isLoading || isTranslationLoading}
                        skeletonIsRTL={isRTL} />
                </div>
                <div>
                    <Subtitle headlineData={displayHeadline} isLoading={isLoading || isTranslationLoading} skeletonIsRTL={isRTL} />
                    <SourceSlider {...{ locale, country, headlines, pageDate }} />
                    <SourceFooter url={headlines && headlines.length > 0 ? headlines[0].link : ''} headline={headline} headlines={headlines} source={sourceKey} pageDate={pageDate} flagCountry={sourceDataOverride ? country : null} sourceCountry={country} />
                </div>
            </div>
            {!disableContextMenu && contextMenu.open ? (
                <RightClickMenu
                    open={contextMenu.open}
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    close={() => setContextMenu({ open: false, x: 0, y: 0 })}
                    {...{ country, locale, sources }}
                />
            ) : null}
        </div>
    );
}
