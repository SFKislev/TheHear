'use client';

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import InnerLink from "@/components/InnerLink";
import { countries } from "@/utils/sources/countries";
import { createDateString } from "@/utils/utils";
import FlagIcon from "@/components/FlagIcon";
import HebrewFonts from "@/utils/typography/HebrewFonts";
import { getCountryLaunchDate } from "@/utils/launchDates";
import { Archive, Info, X } from "lucide-react";

const labels = {
    about: { en: 'about', heb: 'אודות' },
    methodology: { en: 'Methodology', heb: 'מתודולוגיה' },
    global: { en: 'global view', heb: 'כותרות גלובליות' },
    countries: { en: 'change country', heb: 'בחר מדינה' },
    selectCountry: { en: 'select country', heb: 'בחר מדינה' },
    archives: { en: 'the archives', heb: 'הארכיונים' },
    changeMonth: { en: 'change month', heb: 'בחר חודש' },
    live: { en: 'Live', heb: 'חי' },
    liveHeadlinesFrom: { en: 'live headlines from', heb: 'כותרות חיות מ' },
    liveGlobalNews: { en: 'live global news', heb: 'חדשות חיות מהעולם' },
    closeMenu: { en: 'Close footer menu', heb: 'סגור תפריט' },
    hideFooter: { en: 'Hide footer', heb: 'הסתר תחתית' },
};

function getLabel(key, locale, countryName) {
    if (key === 'archives' && countryName) {
        return locale === 'heb'
            ? `ארכיון ${countryName}`
            : `the ${countryName} archives`;
    }
    return locale === 'heb' ? labels[key].heb : labels[key].en;
}

function getCountryName(country, locale) {
    const data = countries[country] || {};
    return locale === 'heb' ? (data.hebrew || country) : (data.english || country);
}

function formatDateLabel(date, locale) {
    if (!date) return '';
    if (locale === 'heb') {
        return date.toLocaleDateString('he-IL').replace(/\//g, '.');
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatMonthLabel(year, month, locale) {
    const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return d.toLocaleDateString(locale === 'heb' ? 'he' : 'en', { month: 'long', year: 'numeric' });
}

function isCountryAvailableForMonthlyArchive(countryCode, year, month) {
    if (!year || !month) return true;
    const launchDate = getCountryLaunchDate(countryCode);
    const launchMonthStart = new Date(launchDate.getFullYear(), launchDate.getMonth(), 1);
    const targetMonthStart = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return targetMonthStart >= launchMonthStart;
}

function getArchiveMonths(country, locale) {
    const launchDate = getCountryLaunchDate(country);
    const now = new Date();
    const months = [];
    let currentDate = new Date(launchDate.getFullYear(), launchDate.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);

    while (currentDate <= endDate) {
        months.push({
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            monthName: currentDate.toLocaleDateString(locale === 'heb' ? 'he' : 'en', { month: 'long' }),
            monthNameShort: currentDate.toLocaleDateString(locale === 'heb' ? 'he' : 'en', { month: 'short' })
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return months.reverse();
}

function getH1Text({ locale, pageType, country, date, year, month, day }) {
    const countryName = country ? getCountryName(country, locale) : '';
    if (pageType === 'live') {
        const needsThe = locale === 'en' && (country === 'us' || country === 'uk');
        const fromPart = needsThe ? `from the ${countryName}` : `from ${countryName}`;
        return locale === 'heb' ? `כותרות חיות מ${countryName}` : `Live Headlines ${fromPart}`;
    }
    if (pageType === 'feed' || pageType === 'date') {
        const dateLabel = formatDateLabel(date, locale);
        return locale === 'heb'
            ? `ארכיון כותרות מ${countryName}, ${dateLabel}`
            : `Headline Archive from ${countryName}, ${dateLabel}`;
    }
    if (pageType === 'monthly-archive') {
        const monthLabel = formatMonthLabel(year, month, locale);
        return locale === 'heb'
            ? `ארכיון חדשות מ${countryName}, ${monthLabel}`
            : `Headlines Archive from ${countryName}, ${monthLabel}`;
    }
    if (pageType === 'global-live') {
        return locale === 'heb' ? 'חדשות מהעולם בזמן אמת' : 'Live Global News';
    }
    if (pageType === 'global-archive') {
        const dateObj = date || new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        const dateLabel = formatDateLabel(dateObj, locale);
        return locale === 'heb'
            ? `ארכיון חדשות גלובלי ל־${dateLabel}`
            : `Global Headlines Archive for ${dateLabel}`;
    }
    if (pageType === 'search') {
        return locale === 'heb' ? `חיפוש כותרות ב${countryName}` : `Headline Search in ${countryName}`;
    }
    return '';
}

export default function UniversalFooter({ locale, pageType, country, date, year, month, day }) {
    const [openMenu, setOpenMenu] = useState(null);
    const [hidden, setHidden] = useState(false);
    const pathname = usePathname();
    const hideKey = useMemo(() => (pageType ? `footerHidden:${pageType}` : 'footerHidden:default'), [pageType]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const stored = window.localStorage.getItem(hideKey);
            if (stored === '1') {
                setHidden(true);
            }
        } catch {
            // Ignore storage read errors (e.g., privacy mode).
        }
    }, [hideKey]);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.setAttribute('data-footer-enhanced', 'true');
        return () => {
            document.documentElement.removeAttribute('data-footer-enhanced');
        };
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.style.setProperty('--footer-offset', hidden ? '0px' : '3rem');
    }, [hidden]);

    useEffect(() => {
        if (openMenu) {
            setOpenMenu(null);
        }
    }, [pathname]);

    const h1Text = getH1Text({ locale, pageType, country, date, year, month, day });
    const isGlobalPage = pageType === 'global-live' || pageType === 'global-archive';
    const isMonthlyArchive = pageType === 'monthly-archive';
    const countryName = country ? getCountryName(country, locale) : '';
    const months = country ? getArchiveMonths(country, locale) : [];
    const countryCodes = useMemo(() => {
        return Object.keys(countries).filter((code) => {
            if (code === 'uae') return false;
            if (!isMonthlyArchive) return true;
            return isCountryAvailableForMonthlyArchive(code, year, month);
        });
    }, [isMonthlyArchive, year, month]);
    const countryHref = (code) => isMonthlyArchive && year && month
        ? `/${locale}/${code}/history/${year}/${month}`
        : `/${locale}/${code}`;
    const archiveGroups = useMemo(() => {
        return months.reduce((groups, m) => {
            if (!groups[m.year]) groups[m.year] = [];
            groups[m.year].push(m);
            return groups;
        }, {});
    }, [months]);
    const archiveGroupsEn = useMemo(() => {
        if (!country) return {};
        const monthsEn = getArchiveMonths(country, 'en');
        return monthsEn.reduce((groups, m) => {
            if (!groups[m.year]) groups[m.year] = [];
            groups[m.year].push(m);
            return groups;
        }, {});
    }, [country]);

    if (hidden) return null;

    const currentYear = new Date().getFullYear();
    const isHeb = locale === 'heb';
    const fontClass = isHeb ? 'frank-re' : 'font-[\'Geist\']';
    const textSizeClass = isHeb ? 'text-[13px]' : 'text-xs';

    return (
        <>
            <style jsx global>{`
                html[data-footer-enhanced="true"] .footer-ssr-links {
                    display: none;
                }
                @media (max-width: 768px) {
                    .universal-footer-fixed {
                        display: none;
                    }
                }
            `}</style>
            {!hidden && (
                <div className="footer-ssr-links border-t border-gray-200 bg-white px-3 py-3 text-xs text-gray-700" dir={isHeb ? 'rtl' : 'ltr'}>
                    {h1Text && (
                        <div className="mb-2 font-medium text-gray-800">{h1Text}</div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                        {!isGlobalPage && (
                            <InnerLink href={`/${locale}/global`} locale={locale}>
                                <span className="underline underline-offset-2">{getLabel('global', locale)}</span>
                            </InnerLink>
                        )}
                        {country && (
                            <InnerLink href={`/${locale}/${country}`} locale={locale}>
                                <span className="underline underline-offset-2">
                                    {isMonthlyArchive
                                        ? (locale === 'heb'
                                            ? `${labels.liveHeadlinesFrom.heb}${countryName}`
                                            : (country === 'us' || country === 'uk'
                                                ? `${labels.liveHeadlinesFrom.en} the ${countryName}`
                                                : `${labels.liveHeadlinesFrom.en} ${countryName}`))
                                        : `${getLabel('live', locale)} ${countryName}`}
                                </span>
                            </InnerLink>
                        )}
                        <InnerLink href={`/${locale}/global`} locale={locale}>
                            <span className="underline underline-offset-2">{getLabel('liveGlobalNews', locale)}</span>
                        </InnerLink>
                        <InnerLink href="/about" locale={locale}>
                            <span className="underline underline-offset-2">
                                {getLabel('about', locale)}
                            </span>
                        </InnerLink>
                        {pageType !== 'live' && !isGlobalPage && !isMonthlyArchive && pageType !== 'search' && (
                            <InnerLink href="/methodology" locale={locale}>
                                <span className="underline underline-offset-2">
                                    {getLabel('methodology', locale)}
                                </span>
                            </InnerLink>
                        )}
                    </div>
                    {country && pageType !== 'search' && (
                        <details className="mt-3">
                            <summary className="cursor-pointer font-medium">
                                {isMonthlyArchive ? getLabel('changeMonth', locale) : getLabel('archives', locale, countryName)}
                            </summary>
                            <div className="mt-2 space-y-2">
                                {Object.keys(archiveGroupsEn).reverse().map(groupYear => (
                                    <div key={groupYear}>
                                        <div className="mb-1 font-bold text-gray-800">{groupYear}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {archiveGroupsEn[groupYear].map(monthItem => (
                                                <InnerLink
                                                    key={`${monthItem.year}-${monthItem.month}`}
                                                    href={`/${locale}/${country}/history/${monthItem.year}/${monthItem.month.toString().padStart(2, '0')}`}
                                                    locale={locale}
                                                >
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 inline-block">
                                                        <span className="mr-1">{monthItem.month.toString().padStart(2, '0')}</span>
                                                        <span className="text-gray-400 text-[10px]">({monthItem.monthNameShort})</span>
                                                    </span>
                                                </InnerLink>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {date && (
                                    <InnerLink
                                        href={`/${locale}/${country}/${createDateString(date)}/feed`}
                                        locale={locale}
                                    >
                                        <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                            Daily archive
                                        </span>
                                    </InnerLink>
                                )}
                            </div>
                        </details>
                    )}
                    {!isGlobalPage && (
                        <details className="mt-3">
                            <summary className="cursor-pointer font-medium">
                                {getLabel('countries', locale)}
                            </summary>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {countryCodes.map(code => (
                                    <InnerLink
                                        key={code}
                                        href={countryHref(code)}
                                        locale={locale}
                                    >
                                        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                            <FlagIcon country={code} />
                                            {getCountryName(code, 'en')}
                                        </span>
                                    </InnerLink>
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            )}
            {isHeb && <HebrewFonts />}
            <footer
                className={`universal-footer-fixed fixed bottom-0 left-0 right-0 h-12 w-full border-t border-gray-200 bg-white px-3 ${textSizeClass} ${fontClass} ${openMenu ? 'z-[100]' : 'z-40'}`}
                dir={isHeb ? 'rtl' : 'ltr'}
            >
            <div className={`flex h-full flex-wrap items-center gap-2 ${isHeb ? '' : 'justify-between'}`}>
                {isHeb && <div className="flex-1 min-w-0" />}
                <div className={isHeb ? 'flex h-full flex-wrap items-center gap-4' : 'contents'} dir={isHeb ? 'rtl' : undefined}>
                <div className="flex h-full flex-wrap items-center gap-2" dir={isHeb ? 'rtl' : undefined}>
                {openMenu && (
                    <button
                        type="button"
                        className="fixed inset-0 z-50 cursor-default bg-black/15"
                        aria-label={getLabel('closeMenu', locale)}
                        onClick={() => setOpenMenu(null)}
                    />
                )}
                {h1Text && (
                    <h1 className={`${textSizeClass} font-medium text-gray-700`}>
                        {h1Text}
                    </h1>
                )}
                {!isGlobalPage && !isMonthlyArchive && (
                    <>
                        <span className="text-gray-300">|</span>
                        <InnerLink href={`/${locale}/global`} locale={locale}>
                            <span className="text-gray-700 hover:text-blue bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1 inline-block">
                                {getLabel('global', locale)}
                            </span>
                        </InnerLink>
                    </>
                )}
                {pageType === 'global-archive' && (
                    <>
                        <span className="text-gray-300">|</span>
                        <InnerLink href={`/${locale}/global`} locale={locale}>
                            <span className="text-gray-700 hover:text-blue bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1 inline-block">
                                {getLabel('liveGlobalNews', locale)}
                            </span>
                        </InnerLink>
                    </>
                )}
                {country && pageType !== 'live' && (
                    <>
                        <span className="text-gray-300">|</span>
                        <InnerLink href={`/${locale}/${country}`} locale={locale}>
                            <span className="text-gray-700 hover:text-blue bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1 inline-block">
                                {isMonthlyArchive
                                    ? (locale === 'heb'
                                        ? `${labels.liveHeadlinesFrom.heb}${countryName}`
                                        : (country === 'us' || country === 'uk'
                                            ? `${labels.liveHeadlinesFrom.en} the ${countryName}`
                                            : `${labels.liveHeadlinesFrom.en} ${countryName}`))
                                    : `${getLabel('live', locale)} ${countryName}`}
                            </span>
                        </InnerLink>
                    </>
                )}
                {!isGlobalPage && (
                    <>
                        <span className="text-gray-300">|</span>
                        <div className="relative z-40">
                            <button
                                type="button"
                                className="cursor-pointer text-gray-700 hover:text-blue bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1"
                                aria-expanded={openMenu === 'countries'}
                                aria-controls="footer-countries"
                                onClick={() => setOpenMenu(openMenu === 'countries' ? null : 'countries')}
                            >
                                {getLabel('countries', locale)}
                            </button>
                        </div>
                        <div
                            id="footer-countries"
                            className={`fixed inset-0 z-[100] flex items-center justify-center ${openMenu === 'countries' ? 'max-h-screen' : 'max-h-0 pointer-events-none'} overflow-hidden`}
                            aria-hidden={openMenu !== 'countries'}
                            onClick={() => setOpenMenu(null)}
                        >
                            <div
                                className="min-w-[18rem] max-w-[80vw] w-fit rounded-xs border border-gray-100 bg-white p-3 shadow-lg text-sm font-['Geist']"
                                dir="ltr"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="grid grid-cols-2 gap-[1px] bg-gray-200">
                                    {countryCodes.map(code => (
                                            <InnerLink
                                                key={code}
                                                href={countryHref(code)}
                                                locale={locale}
                                            >
                                                <span
                                                    className="flex items-center gap-2 bg-white p-2 text-gray-600 hover:bg-gray-100 whitespace-nowrap inline-block"
                                                >
                                                    <FlagIcon country={code} />
                                                    {getCountryName(code, 'en')}
                                                </span>
                                            </InnerLink>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {country && pageType !== 'search' && (
                    <>
                        <span className="text-gray-300">|</span>
                        <div className="relative z-40">
                            <button
                                type="button"
                                className="cursor-pointer text-gray-700 hover:text-blue bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1"
                                aria-expanded={openMenu === 'archives'}
                                aria-controls="footer-archives"
                                onClick={() => setOpenMenu(openMenu === 'archives' ? null : 'archives')}
                            >
                            {isMonthlyArchive ? getLabel('changeMonth', locale) : getLabel('archives', locale, countryName)}
                            </button>
                        </div>
                        <div
                            id="footer-archives"
                            className={`fixed inset-0 z-[100] flex items-center justify-center ${openMenu === 'archives' ? 'max-h-screen' : 'max-h-0 pointer-events-none'} overflow-hidden`}
                            aria-hidden={openMenu !== 'archives'}
                            onClick={() => setOpenMenu(null)}
                        >
                            <div
                                className="min-w-[18rem] max-w-[80vw] w-fit rounded-xs border border-gray-100 bg-white p-4 shadow-lg text-sm font-['Geist']"
                                dir="ltr"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-64">
                                    <div className="text-sm underline underline-offset-4 font-bold mb-4 flex justify-start items-start">
                                        <Archive size={16} className="mr-2 mt-0.5" />
                                        The Archives
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {Object.keys(archiveGroupsEn).reverse().map(groupYear => (
                                            <div key={groupYear} className="mb-3">
                                                <div className="font-bold text-xs text-gray-800 mb-2">{groupYear}</div>
                                                <div className="grid grid-cols-3 gap-1">
                                                    {archiveGroupsEn[groupYear].map(monthItem => (
                                                        <InnerLink
                                                            key={`${monthItem.year}-${monthItem.month}`}
                                                            href={`/${locale}/${country}/history/${monthItem.year}/${monthItem.month.toString().padStart(2, '0')}`}
                                                            locale={locale}
                                                        >
                                                            <span
                                                                className="flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 hover:shadow-md rounded font-mono inline-block"
                                                            >
                                                                <span className="mr-1">{monthItem.month.toString().padStart(2, '0')}</span>
                                                                <span className="text-gray-400 text-[10px]">({monthItem.monthNameShort})</span>
                                                            </span>
                                                        </InnerLink>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {date && (
                                        <div className="border-t pt-2 mt-2">
                                            <InnerLink
                                                href={`/${locale}/${country}/${createDateString(date)}/feed`}
                                                locale={locale}
                                            >
                                                <span
                                                    className="flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 hover:shadow-md rounded inline-block"
                                                >
                                                    Daily archive
                                                </span>
                                            </InnerLink>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <span className="text-gray-300">|</span>
                <Link href="/about" hrefLang={locale} className="flex items-center justify-center text-gray-700 hover:text-blue bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1 inline-block" aria-label={getLabel('about', locale)}>
                    <Info size={14} />
                </Link>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 font-mono" dir="ltr">@{currentYear}</span>
                </div>
                <div className="flex h-full flex-wrap items-center gap-2" dir={isHeb ? 'rtl' : undefined}>
                    {pageType !== 'live' && !isGlobalPage && !isMonthlyArchive && pageType !== 'search' && (
                        <Link href="/methodology" hrefLang={locale} className="text-gray-700 hover:text-blue bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1 inline-block">
                            {getLabel('methodology', locale)}
                        </Link>
                    )}
                    {!isHeb && (
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700 p-1 flex items-center justify-center"
                            aria-label={getLabel('hideFooter', locale)}
                            onClick={() => {
                                setHidden(true);
                                if (typeof window !== 'undefined') {
                                    try {
                                        window.localStorage.setItem(hideKey, '1');
                                    } catch {
                                        // Ignore storage write errors.
                                    }
                                }
                            }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                </div>
                {isHeb && (
                    <div className="flex-1 flex justify-end items-center min-w-0">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700 p-1 flex items-center justify-center"
                            aria-label={getLabel('hideFooter', locale)}
                            onClick={() => {
                                setHidden(true);
                                if (typeof window !== 'undefined') {
                                    try {
                                        window.localStorage.setItem(hideKey, '1');
                                    } catch {
                                        // Ignore storage write errors.
                                    }
                                }
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        </footer>
        </>
    );
}
