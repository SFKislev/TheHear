export const DEFAULT_LAUNCH_DATE = new Date('2024-07-04');

// Per-country launch dates - actual dates when data became available.
export const COUNTRY_LAUNCH_DATES = {
    'israel': new Date('2024-07-04'),
    'germany': new Date('2024-07-28'),
    'us': new Date('2024-07-31'),
    'italy': new Date('2024-08-28'),
    'russia': new Date('2024-08-29'),
    'iran': new Date('2024-08-29'),
    'france': new Date('2024-08-29'),
    'lebanon': new Date('2024-08-29'),
    'poland': new Date('2024-08-30'),
    'uk': new Date('2024-09-05'),
    'india': new Date('2024-09-05'),
    'ukraine': new Date('2024-09-05'),
    'spain': new Date('2024-09-05'),
    'netherlands': new Date('2024-09-05'),
    'china': new Date('2024-09-06'),
    'japan': new Date('2024-09-07'),
    'turkey': new Date('2024-09-07'),
    'uae': new Date('2024-09-08'),
    'palestine': new Date('2024-09-10'),
    'finland': new Date('2025-11-01'),
    'kenya': new Date('2025-11-05')
};

export const getCountryLaunchDates = () => COUNTRY_LAUNCH_DATES;

export const getCountryLaunchDate = (country) => (
    COUNTRY_LAUNCH_DATES[country] || DEFAULT_LAUNCH_DATE
);
