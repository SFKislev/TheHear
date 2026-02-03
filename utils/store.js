import { create } from "zustand";

export const useTime = create(set => ({
    date: new Date(),
    lastManualInteractionAt: null,
    setDate: (date) => set({ date }),
    setManualDate: (date) => set({ date, lastManualInteractionAt: Date.now() }),
    clearManualInteraction: () => set({ lastManualInteractionAt: null }),
}));

export const useFont = create(set => ({
    font: Math.round(Math.random() * 5),
    setFont: (font) => set({ font }),
}));

export const useRightPanel = create(set => ({
    isCollapsed: false,
    backupFont: null,
    setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    setBackupFont: (font) => set({ backupFont: font }),
}));

export const useOrder = create(set => ({
    order: 'default',
    setOrder: (order) => set({ order }),
}));

export const useTranslate = create(set => ({
    translate: [],
    setTranslate: (sourceNames) => set({ translate: sourceNames }),
    toggleTranslate: (sourceName) => set(state => {
        if (state.translate.includes(sourceName)) {
            return { translate: state.translate.filter(name => name !== sourceName) }
        }
        return { translate: [...state.translate, sourceName] }
    }),
    clearTranslations: () => set({ translate: [] }),

    useLocalLanguage: false,
    toggleLocalLanguage: () => set(state => ({ useLocalLanguage: !state.useLocalLanguage })),
}));

export const useActiveWebsites = create(set => ({
    activeWebsites: [],
    setActiveWebsites: (websites) => set({ activeWebsites: websites }),
}));

// Helper function to get initial filtered countries from localStorage (browser only)
const getInitialFilteredCountries = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('filteredCountries');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
    }
    return [];
};

export const useGlobalSort = create(set => ({
    globalSort: 'ai',
    setGlobalSort: (sort) => set({ globalSort: sort }),
    pinnedCountries: [],
    setPinnedCountries: (countries) => set({ pinnedCountries: countries }),
    allExpanded: true,
    setAllExpanded: (expanded) => set({ allExpanded: expanded }),
    filteredCountries: getInitialFilteredCountries(),
    setFilteredCountries: (countries) => set({ filteredCountries: countries }),
    toggleCountryFilter: (country) => set(state => ({
        filteredCountries: state.filteredCountries.includes(country) 
            ? state.filteredCountries.filter(c => c !== country)
            : [...state.filteredCountries, country]
    })),
}));

export const useGlobalCountryCohesion = create(set => ({
    globalCountryCohesion: {},
    setGlobalCountryCohesion: (country, cohesion) => set(state => ({ globalCountryCohesion: { ...state.globalCountryCohesion, [country]: cohesion } })),
}));

export const useGlobalCountryTimestamps = create(set => ({
    globalCountryTimestamps: {},
    setGlobalCountryTimestamp: (country, timestamp) => set(state => ({ globalCountryTimestamps: { ...state.globalCountryTimestamps, [country]: timestamp } })),
}));
