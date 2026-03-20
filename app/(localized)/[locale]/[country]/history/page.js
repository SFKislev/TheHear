import DynamicLogoSmall from "@/components/Logo-small";
import FlagIcon from "@/components/FlagIcon";
import UniversalFooter from "@/components/UniversalFooter";
import { Archive } from "lucide-react";
import { getCountryDailySummariesForMonth, getCountryMonthlyTitles } from "@/utils/database/countryData";
import { isHebrewContentAvailable } from "@/utils/daily summary utils";
import { COUNTRY_LAUNCH_DATES } from "@/utils/launchDates";
import { countries } from "@/utils/sources/countries";
import { redirect } from "next/navigation";
import { createMetadata, LdJson } from "./metadata";
import InnerLink from "@/components/InnerLink";

export const revalidate = false;
export const dynamicParams = false;

function getCountryName(country, locale) {
    const data = countries[country] || {};
    return locale === "heb" ? data.hebrew || country : data.english || country;
}

function getCountryDisplayName(countryCode) {
    const countryNames = {
        us: "the US",
        uk: "the UK",
        uae: "the UAE",
        israel: "Israel",
        germany: "Germany",
        italy: "Italy",
        russia: "Russia",
        iran: "Iran",
        france: "France",
        lebanon: "Lebanon",
        poland: "Poland",
        india: "India",
        ukraine: "Ukraine",
        spain: "Spain",
        netherlands: "the Netherlands",
        china: "China",
        japan: "Japan",
        turkey: "Turkey",
        palestine: "Palestine",
        finland: "Finland"
    };

    return countryNames[countryCode] || countryCode;
}

function getArchiveTitle(countryCode) {
    return `The ${getCountryName(countryCode, "en")} Archives`;
}

function buildMonthEntries(country, locale) {
    const launchDate = COUNTRY_LAUNCH_DATES[country];
    const currentDate = new Date();
    const months = [];

    let date = new Date(launchDate.getFullYear(), launchDate.getMonth(), 1);
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    while (date <= currentMonthStart) {
        months.push({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
            monthShort: date.toLocaleDateString("en", { month: "short" }),
            href: `/${locale}/${country}/history/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`
        });
        date.setMonth(date.getMonth() + 1);
    }

    return months.reverse();
}

function groupMonthsByYear(monthCards) {
    return monthCards.reduce((groups, monthCard) => {
        if (!groups[monthCard.year]) {
            groups[monthCard.year] = [];
        }

        groups[monthCard.year].push(monthCard);
        return groups;
    }, {});
}

async function getMonthCards(country, locale, months, monthlyTitles) {
    const cards = [];

    for (const monthEntry of months) {
        const monthlySummaries = await getCountryDailySummariesForMonth(
            country,
            monthEntry.year,
            monthEntry.month
        );

        const validSummaries = locale === "heb"
            ? monthlySummaries.filter((summary) => isHebrewContentAvailable(summary))
            : monthlySummaries;

        if (validSummaries.length === 0) {
            continue;
        }

        cards.push({
            ...monthEntry,
            totalDays: validSummaries.length,
            monthlyTitle: locale === "heb"
                ? (monthlyTitles?.[monthEntry.monthKey]?.headlineHebrew || "")
                : (monthlyTitles?.[monthEntry.monthKey]?.headline || "")
        });
    }

    return cards;
}

export async function generateStaticParams() {
    const routes = [];
    const locales = ["en", "heb"];

    Object.keys(countries).forEach((country) => {
        if (!COUNTRY_LAUNCH_DATES[country]) return;

        locales.forEach((locale) => {
            routes.push({ country, locale });
        });
    });

    return routes;
}

export async function generateMetadata({ params }) {
    const { country, locale } = await params;
    return createMetadata({ country, locale });
}

export default async function CountryHistoryHubPage({ params }) {
    const { country, locale } = await params;
    const months = buildMonthEntries(country, locale);
    const monthlyTitles = await getCountryMonthlyTitles(country);
    const monthCards = await getMonthCards(country, locale, months, monthlyTitles);
    const launchDate = COUNTRY_LAUNCH_DATES[country];

    if (locale === "heb" && monthCards.length === 0) {
        redirect(`/en/${country}/history`);
    }

    const yearGroups = groupMonthsByYear(monthCards);
    const years = Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a));
    const countryName = getCountryDisplayName(country);
    const archiveTitle = getArchiveTitle(country);
    const launchLabel = launchDate.toLocaleDateString("en", {
        month: "short",
        year: "numeric"
    });

    return (
        <>
            <LdJson country={country} locale={locale} featuredDays={[]} />

            <div className="bg-gray-50 min-h-screen pt-8 px-4" dir="ltr">
                <div className="flex flex-col items-center" dir="ltr">
                    <DynamicLogoSmall locale={locale} showDivider={false} alwaysVisible={true} mobileReducedPadding={true} />

                    <div className="bg-white border-b border-gray-500 rounded-xs p-6 pt-4 pointer-events-auto mt-4" dir="ltr">
                        <div className="w-[450px] max-w-[calc(100vw-2rem)] h-auto md:h-[65vh] bg-white rounded-sm text-sm flex flex-col" dir="ltr">
                            <div className='text-sm underline underline-offset-4 font-bold mb-4 font-["Geist"] flex justify-start items-start'>
                                <div className="mr-2 mt-0.5 flex items-center gap-2">
                                    <FlagIcon country={country} />
                                    <Archive size={16} />
                                </div>
                                {archiveTitle}
                            </div>

                            <div className="flex-1 overflow-y-auto pr-3">
                                {years.map((year) => (
                                    <div key={year} className="mb-3">
                                        <div className='font-["Geist"] font-bold text-xs text-gray-800 mb-2'>
                                            {year}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {yearGroups[year].map((monthCard) => (
                                                <InnerLink
                                                    key={monthCard.monthKey}
                                                    href={monthCard.href}
                                                    locale={locale}
                                                    className='block rounded bg-gray-100 px-3 py-2 hover:bg-gray-200 hover:shadow-md cursor-pointer font-["Geist"] text-xs text-black'
                                                >
                                                    <span className="font-mono">
                                                        {String(monthCard.month).padStart(2, "0")} <span className="text-gray-300">({monthCard.monthShort})</span>
                                                    </span>
                                                    {monthCard.monthlyTitle ? (
                                                        <>
                                                            <span className="mx-2 text-gray-400">|</span>
                                                            <span className={`leading-snug text-gray-800 ${locale === "heb" ? "frank-re text-sm" : ""}`}>
                                                                {monthCard.monthlyTitle}
                                                            </span>
                                                        </>
                                                    ) : null}
                                                </InnerLink>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="border-t pt-2 mt-2">
                                    <div className='font-["Geist"] text-xs text-gray-500'>
                                        {`The Hear archives main headlines as they unfolded. It started tracking ${countryName} in ${launchLabel}. Click a month for a list of daily archive pages.`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <UniversalFooter locale={locale} pageType="country-archive-hub" country={country} />
        </>
    );
}
