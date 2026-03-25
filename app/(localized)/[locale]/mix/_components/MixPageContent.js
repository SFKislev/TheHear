'use client';

import { useEffect, useMemo, useState } from "react";
import { add, sub } from "date-fns";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Add, Restore } from "@mui/icons-material";
import { IconButton, Slider, styled } from "@mui/material";
import Loader from "@/components/loader";
import InnerLink from "@/components/InnerLink";
import FlagIcon from "@/components/FlagIcon";
import useMobile from "@/components/useMobile";
import useVerticalScreen from "@/components/useVerticalScreen";
import CustomTooltip from "@/components/CustomTooltip";
import { isToday } from "date-fns";
import { useTime, useTranslate } from "@/utils/store";
import { serializeSourcesParam, getSelectionKey, buildMixPath } from "@/utils/mix/config";
import useMixSourcesManager from "./useMixSourcesManager";
import useFirebase from "@/utils/database/useFirebase";
import SourceCard from "../../[country]/Source/SourceCard";
import { getWebsiteName } from "@/utils/sources/getCountryData";
import TranslateToggle from "../../[country]/TopBar/settings/TranslateToggle";

const AboutMenu = dynamic(() => import("../../[country]/TopBar/AboutMenu"), { ssr: false, loading: () => null });
const FirstVisitModal = dynamic(() => import("../../[country]/FirstVisitModal"), { ssr: false, loading: () => null });

function createUrlWithSources(pathname, selections) {
    const serialized = serializeSourcesParam(selections);
    if (!serialized) return pathname;
    return `${pathname}?sources=${serialized}`;
}

function MixTopBar({ locale, title, selections, setPickerOpen, bundleSlug, pageDate, sources }) {
    const date = useTime((state) => state.date);
    const liveHref = createUrlWithSources(buildMixPath({ locale, bundleSlug }), selections);
    const isDatePage = Boolean(pageDate);
    const showTitle = Boolean(bundleSlug);
    const showTranslateToggle = selections.some(({ country }) => country !== "us" && country !== "uk");
    const translatableSources = useMemo(
        () => Object.fromEntries(
            Object.entries(sources || {}).filter(([, sourceData]) => sourceData?.country !== "us" && sourceData?.country !== "uk")
        ),
        [sources]
    );
    const currentDateLabel = pageDate
        ? pageDate.toLocaleDateString("en-GB").replace(/\//g, ".")
        : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    const addSourceTooltip = locale === "heb" ? "הוסף מקור" : "add a source";

    return (
        <nav className="sticky top-0 left-0 w-full bg-white z-40 border-b border-gray-200">
            <div className="w-full mx-auto px-5">
                <div className="flex items-center justify-between py-3 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <InnerLink href={`/${locale}/global`}>
                            <h1 className='font-["Geist"] text-sm font-medium whitespace-nowrap hover:text-blue transition-colors'>
                                The Hear
                            </h1>
                        </InnerLink>
                        {showTitle ? <div className="h-5 w-px bg-gray-300" /> : null}
                        {showTitle ? (
                            <h2 className={`${locale === "heb" ? "frank-re text-base" : 'font-["Geist"] text-sm'} truncate text-gray-800`}>
                                {title}
                            </h2>
                        ) : null}
                        <div className="hidden sm:block h-5 w-px bg-gray-300" />
                        <div className='hidden sm:block font-mono text-xs text-gray-500'>
                            {currentDateLabel}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {isDatePage && (
                            <InnerLink href={liveHref}>
                                <div className='px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors font-["Geist"] text-xs cursor-pointer'>
                                    Live
                                </div>
                            </InnerLink>
                        )}
                        {showTranslateToggle ? (
                            <TranslateToggle
                                sources={translatableSources}
                                pageDate={pageDate}
                                tooltipTitle={locale === "heb" ? "תרגם לעברית" : "Translate to English"}
                                tooltipAlwaysOpen
                            />
                        ) : null}
                        <CustomTooltip title={addSourceTooltip} placement={locale === "heb" ? "bottom-start" : "bottom-end"}>
                            <IconButton
                                size="small"
                                onClick={() => setPickerOpen(true)}
                                sx={{
                                    bgcolor: '#e0f2fe',
                                    borderRadius: '8px',
                                    '&:hover': {
                                        bgcolor: '#bae6fd',
                                    },
                                }}
                            >
                                <Add sx={{ fontSize: 18, color: 'black' }} />
                            </IconButton>
                        </CustomTooltip>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function MixDateNavigator({ locale, bundleSlug, pageDate, selections }) {
    if (!pageDate) return null;

    const previousDate = sub(new Date(pageDate), { days: 1 });
    const nextDate = add(new Date(pageDate), { days: 1 });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDayAllowed = nextDate < today;

    const previousHref = createUrlWithSources(buildMixPath({ locale, bundleSlug, pageDate: previousDate }), selections);
    const nextHref = createUrlWithSources(buildMixPath({ locale, bundleSlug, pageDate: nextDate }), selections);

    return (
        <div className={`flex justify-between border-t border-gray-200 px-2 py-1 w-auto bg-white bg-opacity-85 fixed bottom-0 z-5 backdrop-blur-sm shadow ${locale === 'heb' ? 'right-0 sm:right-[49px] left-0' : 'left-0 sm:left-[49px] right-0'}`}>
            <div className={`flex justify-between gap-3 w-full ${locale === 'heb' ? 'flex-row-reverse' : 'flex-row'}`}>
                <InnerLink href={previousHref} className="min-w-0">
                    <h3 className={`py-1 px-2 cursor-pointer flex items-center gap-2 min-w-0 min-h-[2.5rem] text-black hover:text-blue ${locale === 'en' ? 'font-["Geist"] text-sm' : 'frank-re text-[17px] bg-white rounded-xs py-1.5'}`}>
                        <span>←</span>
                        <span className="font-mono">{previousDate.toLocaleDateString("en-GB").replace(/\//g, ".")}</span>
                    </h3>
                </InnerLink>
                {nextDayAllowed ? (
                    <InnerLink href={nextHref} className="min-w-0">
                        <h3 className={`py-1 px-2 cursor-pointer flex items-center gap-2 min-w-0 min-h-[2.5rem] text-black hover:text-blue ${locale === 'en' ? 'font-["Geist"] text-sm' : 'frank-re text-[17px] bg-white rounded-xs py-1.5'}`}>
                            <span className="font-mono">{nextDate.toLocaleDateString("en-GB").replace(/\//g, ".")}</span>
                            <span>→</span>
                        </h3>
                    </InnerLink>
                ) : <span />}
            </div>
        </div>
    );
}

function getSourceFaviconUrl(sourceOption, currentSources, sourceLinksByKey) {
    const sourceKey = `${sourceOption.country}:${sourceOption.source}`;
    const link = sourceLinksByKey?.[sourceKey] || currentSources?.[sourceKey]?.headlines?.[0]?.link;
    if (!link || typeof link !== "string") return null;

    try {
        const hostname = new URL(link).hostname.replace("www.", "");
        return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
    } catch {
        return null;
    }
}

function FaviconOrPlaceholder({ sourceOption, currentSources, sourceLinksByKey }) {
    const faviconUrl = getSourceFaviconUrl(sourceOption, currentSources, sourceLinksByKey);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
    }, [faviconUrl]);

    if (faviconUrl) {
        return (
            <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
                {!isLoaded ? (
                    <span className="absolute inset-[-2px] rounded-full border border-gray-300 border-t-gray-600 animate-spin" />
                ) : null}
                <Image
                    src={faviconUrl}
                    width={16}
                    height={16}
                    alt=""
                    unoptimized
                    className={`shrink-0 transition-opacity duration-150 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setIsLoaded(true)}
                />
            </span>
        );
    }

    const initial = (sourceOption.name || "?").trim().charAt(0).toUpperCase();
    return (
        <span className='inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-["Geist"] text-gray-600'>
            {initial}
        </span>
    );
}

function hasNonLatinCharacters(value) {
    return /[^\u0000-\u024F\s.,'’"()\-:&/]/.test(value || "");
}

function MixSourcePicker({ open, onClose, locale, options, onSelect, currentSources }) {
    const firebase = useFirebase();
    const [selectedCountry, setSelectedCountry] = useState("");
    const [sourceLinksByKey, setSourceLinksByKey] = useState({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!open) {
            setIsVisible(false);
            return;
        }

        setSelectedCountry("");
        setSourceLinksByKey({});
        const frameId = window.requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [open]);

    useEffect(() => {
        if (!selectedCountry || !firebase.ready) return;

        let cancelled = false;

        const loadSourceLinks = async () => {
            try {
                const headlinesCollection = firebase.getCountryCollectionRef(selectedCountry, "headlines");
                const windowStart = sub(new Date(), { days: 7 });
                const queryRef = firebase.firestore.query(
                    headlinesCollection,
                    firebase.firestore.where("timestamp", ">=", windowStart),
                    firebase.firestore.orderBy("timestamp", "desc"),
                    firebase.firestore.limit(400),
                );

                const snapshot = await firebase.firestore.getDocs(queryRef);
                if (cancelled || snapshot.empty) return;

                const nextLinks = {};
                snapshot.docs.forEach((doc) => {
                    const headline = firebase.prepareData(doc);
                    if (!headline?.link) return;
                    const sourceKey = `${selectedCountry}:${getWebsiteName(selectedCountry, headline.website_id)}`;
                    if (!nextLinks[sourceKey]) {
                        nextLinks[sourceKey] = headline.link;
                    }
                });

                if (!cancelled) {
                    setSourceLinksByKey(nextLinks);
                }
            } catch {
                if (!cancelled) {
                    setSourceLinksByKey({});
                }
            }
        };

        void loadSourceLinks();

        return () => {
            cancelled = true;
        };
    }, [selectedCountry, firebase.ready]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!open && !isVisible) return null;

    const countryOptions = options || [];
    const activeCountry = countryOptions.find((option) => option.country === selectedCountry) || null;

    return (
        <>
            <div
                className={`fixed inset-0 z-[9998] bg-white/50 transition-all duration-200 ${isVisible ? 'opacity-100 backdrop-blur-sm' : 'opacity-0 backdrop-blur-0'}`}
                onClick={onClose}
            />
            <div dir="ltr" className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white rounded-lg shadow-lg max-h-[70vh] z-[9999] font-['Geist'] text-sm overflow-hidden flex flex-col transition-all duration-200 direction-ltr ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.985]'} ${selectedCountry ? 'w-auto min-w-[18rem] max-w-[60vw]' : 'w-[18rem]'}`}>
                <div className="flex items-center px-0 pb-3 shrink-0 border-b border-gray-200">
                    <div className="flex items-center gap-3 min-w-0">
                        {selectedCountry ? (
                            <button
                                type="button"
                                onClick={() => setSelectedCountry("")}
                                className='text-gray-500 hover:text-black font-["Geist"] text-sm'
                            >
                                ←
                            </button>
                        ) : null}
                        {selectedCountry ? <FlagIcon country={selectedCountry} /> : null}
                        <h3 className='font-["Geist"] text-base font-bold'>
                            {selectedCountry ? activeCountry?.countryNameEn : "Add a source"}
                        </h3>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pt-1">
                    {!selectedCountry ? (
                        <div className="grid grid-cols-2 gap-[1px] bg-gray-200">
                            {countryOptions.map((option) => (
                                <button
                                    key={option.country}
                                    type="button"
                                    onClick={() => setSelectedCountry(option.country)}
                                    className="w-full flex items-center gap-2 text-left p-2 bg-white hover:bg-gray-100"
                                >
                                    <FlagIcon country={option.country} />
                                    <span className='font-["Geist"] text-sm text-black truncate'>{option.countryNameEn}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="pt-1 divide-y divide-gray-100">
                            {(activeCountry?.sources || []).map((source, index) => {
                                const sourceKey = `${activeCountry.country}:${source.source}`;
                                const hasData = Boolean(
                                    sourceLinksByKey[sourceKey] ||
                                    currentSources?.[sourceKey]?.headlines?.length
                                );

                                const row = (
                                    <button
                                        key={sourceKey}
                                        type="button"
                                        disabled={!hasData}
                                        onClick={() => {
                                            if (!hasData) return;
                                            onSelect({ country: activeCountry.country, source: source.source });
                                            onClose();
                                        }}
                                        className={`w-full flex items-center gap-3 text-left px-2 py-3 rounded-xs opacity-0 translate-y-1 animate-[fadeInUp_0.1s_ease-out_forwards] ${hasData ? 'hover:bg-gray-50' : 'cursor-default'}`}
                                        style={{ animationDelay: `${Math.min(index * 0.02, 0.18)}s` }}
                                    >
                                        <FaviconOrPlaceholder
                                            sourceOption={{ ...source, country: activeCountry.country }}
                                            currentSources={currentSources}
                                            sourceLinksByKey={sourceLinksByKey}
                                        />
                                        <span className="min-w-0 flex items-center gap-2">
                                            <span className={`font-["Geist"] text-sm truncate ${hasData ? 'text-black' : 'text-gray-500 line-through'}`}>{source.name}</span>
                                            {source.originalName && source.originalName !== source.name && hasNonLatinCharacters(source.originalName) ? (
                                                <>
                                                    <span className="h-4 w-px bg-gray-300 shrink-0" />
                                                    <span className={`text-xs truncate ${hasData ? 'text-gray-900' : 'text-gray-500 line-through'}`}>{source.originalName}</span>
                                                </>
                                            ) : null}
                                        </span>
                                    </button>
                                );

                                if (!hasData) {
                                    return (
                                        <CustomTooltip
                                            key={sourceKey}
                                            title={`The headlines from this source aren't updating. We need to look into it.`}
                                            placement="top"
                                        >
                                            <div>{row}</div>
                                        </CustomTooltip>
                                    );
                                }

                                return row;
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function MixAddSourceCard({ onOpen }) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className="order-last col-span-1 flex items-center justify-center bg-neutral-100 text-gray-400 rounded-lg cursor-pointer hover:bg-white transition-all transform text-3xl hover:shadow-xl min-h-[200px]"
        >
            <div className="animate-pulse">+</div>
        </button>
    );
}

function MixMainSection({ locale, sources, activeSourceKeys, pageDate, isVerticalScreen, onHideSource, onOpenPicker, loading }) {
    const orderedSources = activeSourceKeys
        .map((key) => sources[key])
        .filter(Boolean);

    return (
        <div className={`custom-scrollbar ${isVerticalScreen ? 'gap-x-6 gap-y-2 px-8 pt-8 pb-4' : 'gap-4 p-4'} flex flex-col sm:grid ${isVerticalScreen ? 'grid-cols-2' : 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 fhd:grid-cols-4 qhd:grid-cols-6'}`}>
            {orderedSources.map((sourceData) => (
                <SourceCard
                    key={sourceData.key}
                    source={sourceData.source}
                    sourceKey={sourceData.key}
                    headlines={sourceData.headlines}
                    country={sourceData.country}
                    locale={locale}
                    isLoading={loading && (!sourceData.headlines || sourceData.headlines.length === 0)}
                    pageDate={pageDate}
                    isVerticalScreen={isVerticalScreen}
                    sources={sources}
                    sourceDataOverride={sourceData}
                    activeWebsitesOverride={activeSourceKeys}
                    onClose={onHideSource}
                    disableContextMenu
                    renderWhenEmpty
                    preferRandomTypography
                />
            ))}
            <MixAddSourceCard onOpen={onOpenPicker} />
        </div>
    );
}

function MixResetTimerButton({ locale, pageDate, liveHref }) {
    const date = useTime((state) => state.date);
    const setDate = useTime((state) => state.setDate);
    const clearManualInteraction = useTime((state) => state.clearManualInteraction);
    const isPresent = new Date() - date < 60 * 1000 * 5;
    const tooltip = locale === 'heb' ? 'בחזרה לעכשיו' : 'Reset To Now';
    const placement = locale === 'heb' ? 'left' : 'right';

    const button = (
        <CustomTooltip title={tooltip} arrow open={!isPresent} placement={placement}>
            <IconButton
                size="small"
                onClick={() => {
                    if (isToday(date)) {
                        setDate(new Date());
                        clearManualInteraction();
                    }
                }}
                sx={{ color: isPresent ? 'lightgray' : 'blue' }}
            >
                <Restore fontSize="small" />
            </IconButton>
        </CustomTooltip>
    );

    if (!isToday(date) && pageDate) {
        return <InnerLink href={liveHref}>{button}</InnerLink>;
    }

    return button;
}

function MixSideSlider({ locale, activeSourceKeys, sources, pageDate, selections, bundleSlug }) {
    const searchParams = useSearchParams();
    const date = useTime((state) => state.date);
    const setDate = useTime((state) => state.setDate);
    const setManualDate = useTime((state) => state.setManualDate);
    const lastManualInteractionAt = useTime((state) => state.lastManualInteractionAt);
    const pauseTranslations = useTranslate((state) => state.pauseTemporarily);
    const { isMobile } = useMobile();
    const today = new Date();
    const minutes = date.getHours() * 60 + date.getMinutes();
    const currentMinutes = today.getHours() * 60 + today.getMinutes();
    const day = date ? date.toDateString() : today.toDateString();
    const isTodayView = day === today.toDateString();
    const liveHref = createUrlWithSources(buildMixPath({ locale, bundleSlug }), selections);

    useEffect(() => {
        if (!pageDate) {
            setDate(new Date());
            return;
        }

        const nextDate = new Date(pageDate);
        const timeParam = searchParams.get("time");
        const matchedTime = typeof timeParam === "string" ? timeParam.match(/^(\d{1,2}):(\d{2})$/) : null;
        if (matchedTime) {
            nextDate.setHours(Number(matchedTime[1]), Number(matchedTime[2]), 0, 0);
        } else {
            nextDate.setHours(16, 0, 0, 0);
        }
        setDate(nextDate);
    }, [pageDate, searchParams, setDate]);

    useEffect(() => {
        if (pageDate) return;
        const manualHoldActive = () => (
            lastManualInteractionAt &&
            Date.now() - lastManualInteractionAt < 2 * 60 * 1000
        );
        const tick = () => {
            if (manualHoldActive()) return;
            setDate(new Date());
        };

        const interval = setInterval(tick, 60 * 1000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                tick();
            }
        };
        const handleFocus = () => tick();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
        };
    }, [pageDate, lastManualInteractionAt, setDate]);

    const updateDate = (nextMinutes) => {
        if (isTodayView && nextMinutes > currentMinutes) {
            nextMinutes = currentMinutes;
        }
        pauseTranslations(1000);
        const anchorDate = pageDate ? new Date(pageDate) : new Date();
        anchorDate.setHours(Math.floor(nextMinutes / 60), nextMinutes % 60, 0, 0);
        setManualDate(anchorDate);
    };

    if (isMobile) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 flex items-center py-2 px-1 gap-2">
                <MixResetTimerButton locale={locale} pageDate={pageDate} liveHref={liveHref} />
                <MixSlider orientation="horizontal" size="small" min={0} max={24 * 60 - 1} step={1} onChange={(_, value) => updateDate(value)} value={minutes} sx={{ height: 4, flex: 1 }} />
            </div>
        );
    }

    return (
        <div className={`flex h-full w-full flex-col items-center ${locale === 'heb' ? 'border-l' : 'border-r'} border-gray-200 py-3 px-2 box-border`}>
            <MixResetTimerButton locale={locale} pageDate={pageDate} liveHref={liveHref} />
            <div className="flex flex-1 min-h-0 items-center justify-center py-3">
                <CustomTooltip title={locale === 'heb' ? 'ציר הזמן' : 'Timeline'} followCursor placement={locale === 'heb' ? 'left' : 'right'}>
                    <MixSlider
                        orientation="vertical"
                        size="small"
                        min={0}
                        max={24 * 60 - 1}
                        step={1}
                        onChange={(_, value) => updateDate(value)}
                        value={minutes}
                        sx={{ width: 4, height: '100%' }}
                    />
                </CustomTooltip>
            </div>
        </div>
    );
}

const MixSlider = styled(Slider)(() => ({
    color: 'navy',
    '& .MuiSlider-thumb': {
        width: 10,
        height: 10,
        backgroundColor: 'black',
        transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
        '&.Mui-active': {
            width: 16,
            height: 16,
        },
    },
    '& .MuiSlider-rail': {
        opacity: 0.5,
        backgroundColor: 'lightblue',
        width: '5px',
    },
    '& .MuiSlider-track': {
        backgroundColor: 'gray',
        border: 'none',
    },
    '& .MuiSlider-mark': {
        backgroundColor: 'white',
        width: '5px',
        height: '3px',
        borderRadius: 0,
        opacity: 1,
    },
}));

export default function MixPageContent({ locale, title, initialSelections, initialSources, options, pageDate, bundleSlug }) {
    const { isMobile, isHydrated } = useMobile();
    const { isVerticalScreen } = useVerticalScreen();
    const pathname = usePathname();
    const initialSelectionSignature = useMemo(
        () => serializeSourcesParam(initialSelections || []),
        [initialSelections]
    );
    const [pickerOpen, setPickerOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [selections, setSelections] = useState(initialSelections || []);
    const [activeSourceKeys, setActiveSourceKeys] = useState(() => (initialSelections || []).map((selection) => getSelectionKey(selection)));
    const { sources, loading } = useMixSourcesManager(selections, initialSources, pageDate);

    useEffect(() => {
        setSelections(initialSelections || []);
        setActiveSourceKeys((initialSelections || []).map((selection) => getSelectionKey(selection)));
    }, [initialSelectionSignature]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (typeof window === "undefined") return;
        const nextUrl = createUrlWithSources(pathname, selections);
        window.history.replaceState(null, "", nextUrl);
    }, [pathname, selections]);

    const visibleKeys = useMemo(
        () => activeSourceKeys.filter((key) => Boolean(sources[key])),
        [activeSourceKeys, sources]
    );

    const addSelection = (selection) => {
        const selectionKey = getSelectionKey(selection);
        setSelections((prev) => {
            if (prev.some((item) => getSelectionKey(item) === selectionKey)) return prev;
            return [...prev, selection];
        });
        setActiveSourceKeys((prev) => (prev.includes(selectionKey) ? prev : [...prev, selectionKey]));
    };

    const hideSource = (selectionKey) => {
        setSelections((prev) => prev.filter((selection) => getSelectionKey(selection) !== selectionKey));
        setActiveSourceKeys((prev) => prev.filter((key) => key !== selectionKey));
    };

    return (
        <>
            {!isHydrated && (
                <div className="absolute inset-0 z-50">
                    <Loader />
                </div>
            )}
            <FirstVisitModal openAbout={() => setAboutOpen(true)} country="us" locale={locale} pageDate={pageDate} />
            <AboutMenu open={aboutOpen} onClose={() => setAboutOpen(false)} />
            <MixSourcePicker open={pickerOpen} onClose={() => setPickerOpen(false)} locale={locale} options={options} onSelect={addSelection} currentSources={sources} />
            <div id="main" style={{ paddingBottom: "var(--footer-offset, 3rem)" }} className={`absolute flex flex-col sm:flex-row w-full h-full overflow-auto sm:overflow-hidden ${locale === 'heb' ? 'direction-rtl' : 'direction-ltr'}`}>
                {isMobile && (
                    <MixSideSlider locale={locale} activeSourceKeys={visibleKeys} sources={sources} pageDate={pageDate} selections={selections} bundleSlug={bundleSlug} />
                )}
                {!isVerticalScreen && !isMobile && (
                    <div className="hidden sm:flex shrink-0 w-[48px]">
                        <MixSideSlider locale={locale} activeSourceKeys={visibleKeys} sources={sources} pageDate={pageDate} selections={selections} bundleSlug={bundleSlug} />
                    </div>
                )}
                <div className="flex flex-col flex-[1] sm:flex-[1] md:flex-[2] lg:flex-[3] 2xl:flex-[4]">
                    <MixTopBar locale={locale} title={title} selections={selections} setPickerOpen={setPickerOpen} bundleSlug={bundleSlug} pageDate={pageDate} sources={sources} />
                    <MixMainSection
                        locale={locale}
                        sources={sources}
                        activeSourceKeys={visibleKeys}
                        pageDate={pageDate}
                        isVerticalScreen={isVerticalScreen}
                        onHideSource={hideSource}
                        onOpenPicker={() => setPickerOpen(true)}
                        loading={loading}
                    />
                    {loading ? <div className='px-4 pb-2 font-["Geist"] text-xs text-gray-400'>Loading sources...</div> : null}
                    <MixDateNavigator locale={locale} bundleSlug={bundleSlug} pageDate={pageDate} selections={selections} />
                </div>
            </div>
        </>
    );
}
