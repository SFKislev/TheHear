import { endOfDay, sub } from "date-fns";
import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getDoc, limit, onSnapshot, orderBy, query, where, getFirestore } from "firebase/firestore";
import { unstable_cache } from "next/cache";

import { firebaseConfig } from './firebaseConfig';
import { countries } from "../sources/countries";
import { countryToAlpha2 } from "country-to-iso";


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CACHE_10_MINUTES = 60 * 10;

export const getAICountrySort = async () => {
    const sortedHeadlinesRef = collection(db, '- metadata -', 'summaryCount', 'sortedHeadlines');
    const q = query(sortedHeadlinesRef, orderBy('timestamp', 'desc'), limit(1));

    const snapshot = await getDocs(q);
    const latestSortedHeadlines = snapshot.docs[0].data();

    if (latestSortedHeadlines.sortedHeadlines && Array.isArray(latestSortedHeadlines.sortedHeadlines)) {
        const sortedOrder = latestSortedHeadlines.sortedHeadlines
            .sort((a, b) => a.rank - b.rank)
            .map(item => item.country.toLowerCase())
            .map(item => Object.keys(countries).find(c => countryToAlpha2(c) == countryToAlpha2(item)))
            .filter(item => item != undefined)
        
            Object.keys(countries).forEach(country => {
            if (!sortedOrder.includes(country)) {
                sortedOrder.push(country)
            }
        })

        return sortedOrder;
    } else {
        return [];
    }
}

// Server-side cached version for SSR
export const getAICountrySortServer = unstable_cache(async () => {
    try {
        return await getAICountrySort();
    } catch (error) {
        console.error('Error fetching AI country sort:', error);
        // Fallback to default country order
        return Object.keys(countries);
    }
}, ['getAICountrySortServer'], { tags: ['getAICountrySortServer'], revalidate: CACHE_10_MINUTES });

// Get latest summary for a specific country (FALLBACK - only used if metadata doesn't exist)
const getCountryLatestSummary = async (countryName) => {
    try {
        const countriesCollection = collection(db, '- Countries -');
        const countryID = countries[countryName].english;
        const countryDoc = doc(countriesCollection, countryID);
        const summariesCollection = collection(countryDoc, 'summaries');

        const q = query(summariesCollection, orderBy('timestamp', 'desc'), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const summaryDoc = snapshot.docs[0];
        const data = summaryDoc.data();
        const cleanedData = JSON.parse(JSON.stringify(data));
        const timestamp = new Date(data.timestamp.seconds * 1000);

        return { id: summaryDoc.id, ...cleanedData, timestamp };
    } catch (error) {
        console.error(`Error fetching summary for ${countryName}:`, error);
        return null;
    }
};

// Get latest summaries from metadata document (1-2 reads instead of 20+)
const getAllCountriesLatestSummariesFromMetadata = async () => {
    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const yesterday = sub(today, { days: 1 });
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Fetch both today and yesterday in parallel (2 reads max)
        const [todaySnapshot, yesterdaySnapshot] = await Promise.all([
            getDoc(doc(db, '- metadata -', 'summaries', 'dates', todayStr)),
            getDoc(doc(db, '- metadata -', 'summaries', 'dates', yesterdayStr))
        ]);

        // Combine summaries from both days
        const allSummaries = [];

        if (todaySnapshot.exists()) {
            const todayData = todaySnapshot.data();
            if (todayData.summaries && Array.isArray(todayData.summaries)) {
                allSummaries.push(...todayData.summaries);
            }
        }

        if (yesterdaySnapshot.exists()) {
            const yesterdayData = yesterdaySnapshot.data();
            if (yesterdayData.summaries && Array.isArray(yesterdayData.summaries)) {
                allSummaries.push(...yesterdayData.summaries);
            }
        }

        if (allSummaries.length === 0) {
            return null;
        }

        // Transform array of summaries into the expected format: { country: summary }
        // Filter to get the most recent summary per country
        const summariesByCountry = {};

        allSummaries.forEach(summary => {
            // Map capitalized country names (e.g., "UK", "Israel") to lowercase keys (e.g., "uk", "israel")
            const countryKey = Object.keys(countries).find(
                key => countries[key].english.toLowerCase() === summary.country.toLowerCase()
            );

            if (!countryKey) {
                return;
            }

            // Convert Firestore timestamp to Date object
            const timestamp = new Date(summary.timestamp.seconds * 1000);

            // Transform to match expected format
            const transformedSummary = {
                id: `${countryKey}_${summary.timestamp.seconds}`, // Generate unique ID
                timestamp,
                englishHeadline: summary.englishHeadline,
                hebrewHeadline: summary.hebrewHeadline,
                translatedHeadline: summary.translatedHeadline,
                headline: summary.englishHeadline, // Fallback
                summary: summary.summary,
                hebrewSummary: summary.hebrewSummary,
                translatedSummary: summary.translatedSummary,
                relativeCohesion: summary.relativeCohesion,
                cohesion: summary.cohesion
            };

            // Keep only the most recent summary per country
            if (!summariesByCountry[countryKey] || timestamp > summariesByCountry[countryKey].timestamp) {
                summariesByCountry[countryKey] = transformedSummary;
            }
        });

        return summariesByCountry;

    } catch (error) {
        return null;
    }
};

// Get latest summaries for all countries - SURGICAL REPLACEMENT with smart fallbacks
// 1. Try metadata first (2 reads for today + yesterday)
// 2. For missing countries, query their collections (1 read per missing country, filtered to last 24h)
// 3. Total worst case: 2 + N reads (where N = countries missing from metadata)
export const getAllCountriesLatestSummaries = unstable_cache(async () => {
    // Try metadata document first (efficient: 2 reads for today + yesterday)
    const metadataSummaries = await getAllCountriesLatestSummariesFromMetadata();

    if (!metadataSummaries) {
        // Complete fallback if no metadata exists at all (expensive: 20+ reads)
        const countryNames = Object.keys(countries);
        const summaryPromises = countryNames.map(async (country) => {
            const summary = await getCountryLatestSummary(country);
            return { country, summary };
        });

        const results = await Promise.all(summaryPromises);
        return results.reduce((acc, { country, summary }) => {
            if (summary) {
                acc[country] = summary;
            }
            return acc;
        }, {});
    }

    // Check for missing countries and fetch them individually
    const countryNames = Object.keys(countries);
    const missingCountries = countryNames.filter(country => !metadataSummaries[country]);

    if (missingCountries.length > 0) {
        // Fetch missing countries in parallel, but only summaries from last 24 hours
        const oneDayAgo = sub(new Date(), { days: 1 });
        const missingPromises = missingCountries.map(async (country) => {
            try {
                const countriesCollection = collection(db, '- Countries -');
                const countryID = countries[country].english;
                const countryDoc = doc(countriesCollection, countryID);
                const summariesCollection = collection(countryDoc, 'summaries');

                // Only fetch summaries from last 24 hours to avoid stale data
                const q = query(
                    summariesCollection,
                    where('timestamp', '>', oneDayAgo),
                    orderBy('timestamp', 'desc'),
                    limit(1)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const summaryDoc = snapshot.docs[0];
                    const data = summaryDoc.data();
                    const cleanedData = JSON.parse(JSON.stringify(data));
                    const timestamp = new Date(data.timestamp.seconds * 1000);

                    return { country, summary: { id: summaryDoc.id, ...cleanedData, timestamp } };
                }
            } catch (error) {
                // Silently handle errors for missing countries
            }
            return { country, summary: null };
        });

        const missingResults = await Promise.all(missingPromises);
        missingResults.forEach(({ country, summary }) => {
            if (summary) {
                metadataSummaries[country] = summary;
            }
        });
    }

    return metadataSummaries;
}, ['getAllCountriesLatestSummaries'], { tags: ['getAllCountriesLatestSummaries'], revalidate: CACHE_10_MINUTES });

// Get latest global overview
export const getGlobalOverview = unstable_cache(async () => {
    try {
        const globalOverviewsRef = collection(db, '- metadata -', 'globalOverviews', 'overviews');
        const q = query(globalOverviewsRef, orderBy('timestamp', 'desc'), limit(1));
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        
        const overviewDoc = snapshot.docs[0];
        const data = overviewDoc.data();
        const cleanedData = JSON.parse(JSON.stringify(data));
        const timestamp = new Date(data.timestamp.seconds * 1000);
        
        // Structure data similar to the client hook
        return {
            id: overviewDoc.id,
            timestamp,
            english: {
                headline: cleanedData.english?.headline || '',
                overview: cleanedData.english?.overview || ''
            },
            hebrew: {
                headline: cleanedData.hebrew?.headline || '',
                overview: cleanedData.hebrew?.overview || ''
            }
        };
    } catch (error) {
        console.error('Error fetching global overview:', error);
        return null;
    }
}, ['getGlobalOverview'], { tags: ['getGlobalOverview'], revalidate: CACHE_10_MINUTES });
