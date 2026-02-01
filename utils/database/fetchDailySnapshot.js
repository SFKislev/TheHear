import { format } from 'date-fns';
import { countries } from '../sources/countries';

/**
 * Fetches a daily snapshot JSON file from Firebase Storage
 * @param {string} country - Country code (lowercase, e.g., 'us', 'israel')
 * @param {Date} date - Date object for the snapshot
 * @returns {Promise<Object|null>} Object with headlines, summaries, and dailySummary, or null if not found
 */
export async function fetchDailySnapshot(country, date) {
    try {
        // Convert date to JSON filename format (yyyy-MM-dd)
        const dateStr = format(date, 'yyyy-MM-dd');

        // Get properly capitalized country name (e.g., 'israel' -> 'Israel', 'germany' -> 'Germany')
        const countryName = countries[country]?.english || country.charAt(0).toUpperCase() + country.slice(1);

        // Construct the Firebase Storage URL with proper capitalization
        const url = `https://storage.googleapis.com/headline-collector-c9bec.firebasestorage.app/daily-snapshots/${countryName}/${countryName}-${dateStr}.json`;

        // Determine if this is a recent date (today or yesterday) that might still be updating
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isRecentDate = dateStr === today.toISOString().split('T')[0] ||
                            dateStr === yesterday.toISOString().split('T')[0];

        // Fetch the JSON file with timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response;
        try {
            response = await fetch(url, {
                // Use ISR-friendly caching: short revalidate for recent dates, long for historical
                cache: 'force-cache',
                next: { revalidate: isRecentDate ? 900 : 86400 },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.warn(`[fetchDailySnapshot] Timeout fetching JSON for ${country} on ${dateStr}`);
            } else {
                console.error(`[fetchDailySnapshot] Network error fetching JSON for ${country} on ${dateStr}:`, error);
            }
            return null;
        }

        if (!response.ok) {
            // Only warn on unexpected status codes (404 is expected for missing snapshots)
            if (response.status !== 404) {
                console.warn(`[fetchDailySnapshot] Unexpected status ${response.status} for ${country} ${dateStr}`);
            }
            return null;
        }

        const json = await response.json();

        // Validate the JSON structure
        if (!json.data) {
            console.warn(`[fetchDailySnapshot] Invalid JSON structure for ${country} ${dateStr} - missing 'data' field`);
            return null;
        }

        // Convert timestamps from {seconds, nanoseconds} to Date objects
        // This matches exactly what prepareData() does in useFirebase.js
        const headlines = (json.data.headlines || []).map(h => {
            let timestamp;
            try {
                if (h.timestamp && typeof h.timestamp === 'object' && h.timestamp.seconds) {
                    timestamp = new Date(h.timestamp.seconds * 1000);
                } else if (h.timestamp) {
                    timestamp = new Date(h.timestamp);
                } else {
                    timestamp = null;
                }
            } catch (e) {
                timestamp = null;
            }
            return { ...h, timestamp };
        });

        const summaries = (json.data.summaries || []).map(s => {
            let timestamp;
            try {
                if (s.timestamp && typeof s.timestamp === 'object' && s.timestamp.seconds) {
                    timestamp = new Date(s.timestamp.seconds * 1000);
                } else if (s.timestamp) {
                    timestamp = new Date(s.timestamp);
                } else {
                    timestamp = null;
                }
            } catch (e) {
                timestamp = null;
            }
            return { ...s, timestamp };
        });

        const dailySummary = json.data.dailySummary ? (() => {
            let timestamp;
            try {
                if (json.data.dailySummary.timestamp && typeof json.data.dailySummary.timestamp === 'object' && json.data.dailySummary.timestamp.seconds) {
                    timestamp = new Date(json.data.dailySummary.timestamp.seconds * 1000);
                } else if (json.data.dailySummary.timestamp) {
                    timestamp = new Date(json.data.dailySummary.timestamp);
                } else {
                    timestamp = null;
                }
            } catch (e) {
                timestamp = null;
            }
            return { ...json.data.dailySummary, timestamp };
        })() : null;

        return {
            headlines,
            summaries,
            dailySummary,
            // Include metadata for debugging/logging
            metadata: {
                country: json.country,
                date: json.date,
                generatedAt: json.generatedAt,
                timezone: json.timezone,
                stats: json.stats
            }
        };
    } catch (error) {
        console.error(`[fetchDailySnapshot] Error fetching snapshot for ${country} on ${format(date, 'yyyy-MM-dd')}:`, error);
        return null;
    }
}

/**
 * Fetches daily snapshot with automatic fallback to Firestore
 * @param {string} country - Country code
 * @param {Date} date - Date object
 * @param {Function} firestoreFallback - Function to call if JSON fetch fails
 * @returns {Promise<Object>} Data from JSON or Firestore
 */
export async function fetchDailySnapshotWithFallback(country, date, firestoreFallback) {
    // Try JSON first
    const jsonData = await fetchDailySnapshot(country, date);

    if (jsonData) {
        console.log(`[fetchDailySnapshot] ✅ Loaded from JSON: ${country} ${format(date, 'yyyy-MM-dd')}`);
        return jsonData;
    }

    // Fallback to Firestore
    console.log(`[fetchDailySnapshot] ⚠️ JSON not available, falling back to Firestore: ${country} ${format(date, 'yyyy-MM-dd')}`);

    if (typeof firestoreFallback === 'function') {
        return await firestoreFallback();
    }

    throw new Error('JSON not available and no Firestore fallback provided');
}
