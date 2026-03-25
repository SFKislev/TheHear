import { countries } from "@/utils/sources/countries";
import { sources as countrySourcesRegistry } from "@/utils/sources/getCountryData";

export const USER_MIX_TITLE = {
    en: "Your source bundle",
    heb: "חבילת המקורות שלך",
};

export const mixBundles = {
    editors: {
        title: {
            en: "Editors' bundle",
            heb: "חבילת העורכים",
        },
        sources: [
            { country: "us", source: "nytimes" },
            { country: "iran", source: "tasnimnews" },
            { country: "israel", source: "haaretz" },
        ],
    },
    iranwar: {
        title: {
            en: "Iran War",
            heb: "מלחמת איראן",
        },
        sources: [
            { country: "us", source: "nytimes" },
            { country: "us", source: "foxnews" },
            { country: "iran", source: "iranintl" },
            { country: "iran", source: "tasnimnews" },
            { country: "israel", source: "haaretz" },
            { country: "israel", source: "ynet" },
            { country: "lebanon", source: "lbci" },
            { country: "lebanon", source: "almanar" },
        ],
    },
};

export const DEFAULT_MIX_SELECTIONS = [
    { country: "us", source: "nytimes" },
    { country: "us", source: "cnn" },
    { country: "uk", source: "bbc" },
    { country: "germany", source: "bild" },
    { country: "italy", source: "la_repubblica" },
    { country: "france", source: "lemonde" },
];

export function getMixBundle(slug) {
    return mixBundles[slug] || null;
}

export function getMixBundleSelections(slug) {
    const bundle = getMixBundle(slug);
    return bundle?.sources || [];
}

export function getMixPageTitle(locale, bundleSlug) {
    if (!bundleSlug) {
        return USER_MIX_TITLE[locale] || USER_MIX_TITLE.en;
    }

    const bundle = getMixBundle(bundleSlug);
    if (!bundle) return USER_MIX_TITLE[locale] || USER_MIX_TITLE.en;

    return bundle.title?.[locale] || bundle.title?.en || USER_MIX_TITLE.en;
}

export function getSelectionKey({ country, source }) {
    return `${country}:${source}`;
}

export function parseSourcesParam(value) {
    if (!value || typeof value !== "string") return [];

    const seen = new Set();
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
            const [country, source] = item.split(":");
            if (!country || !source) return null;
            if (!countries[country]) return null;

            const countryData = countrySourcesRegistry.countries[country];
            if (!countryData?.sources?.[source]) return null;

            const key = `${country}:${source}`;
            if (seen.has(key)) return null;
            seen.add(key);

            return { country, source };
        })
        .filter(Boolean);
}

export function serializeSourcesParam(selections) {
    return dedupeSelections(selections)
        .map(({ country, source }) => `${country}:${source}`)
        .join(",");
}

export function dedupeSelections(selections) {
    const seen = new Set();
    const nextSelections = [];

    for (const selection of selections || []) {
        if (!selection?.country || !selection?.source) continue;
        const key = getSelectionKey(selection);
        if (seen.has(key)) continue;
        seen.add(key);
        nextSelections.push({ country: selection.country, source: selection.source });
    }

    return nextSelections;
}

export function getMergedSelections(bundleSlug, sourcesParam) {
    const bundleSelections = getMixBundleSelections(bundleSlug);
    const userSelections = parseSourcesParam(sourcesParam);
    if (userSelections.length > 0) return dedupeSelections(userSelections);
    if (bundleSelections.length > 0) return dedupeSelections(bundleSelections);
    return dedupeSelections(DEFAULT_MIX_SELECTIONS);
}

export function getMixSourceDescriptor(country, source) {
    const countryData = countrySourcesRegistry.countries[country];
    const sourceData = countryData?.sources?.[source];
    if (!sourceData) return null;

    return {
        key: getSelectionKey({ country, source }),
        country,
        source,
        countryNameEn: countries[country]?.english || country,
        countryNameHe: countries[country]?.hebrew || country,
        languageDirection: countries[country]?.languageDirection || "ltr",
        name: sourceData.name,
        description: sourceData.description,
        translations: sourceData.translations || {},
    };
}

export function getMixSourceOptions() {
    return Object.keys(countries)
        .map((country) => {
            const countryData = countrySourcesRegistry.countries[country];
            const defaultOrder = countryData?.orders?.default || Object.keys(countryData?.sources || {});
            const sourceEntries = defaultOrder
                .filter((source) => Boolean(countryData?.sources?.[source]))
                .map((source) => ({
                    source,
                    name: countryData.sources[source].translations?.en || countryData.sources[source].name || source,
                    originalName: countryData.sources[source].name || source,
                }));

            if (sourceEntries.length === 0) return null;

            return {
                country,
                countryNameEn: countries[country]?.english || country,
                countryNameHe: countries[country]?.hebrew || country,
                languageDirection: countries[country]?.languageDirection || "ltr",
                sources: sourceEntries,
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.countryNameEn.localeCompare(b.countryNameEn));
}

export function buildMixPath({ locale, bundleSlug, pageDate }) {
    const base = bundleSlug ? `/${locale}/mix/${bundleSlug}` : `/${locale}/mix`;
    if (!pageDate) return base;

    const day = String(pageDate.getDate()).padStart(2, "0");
    const month = String(pageDate.getMonth() + 1).padStart(2, "0");
    const year = pageDate.getFullYear();

    return bundleSlug
        ? `${base}/${day}-${month}-${year}`
        : `${base}/date/${day}-${month}-${year}`;
}
