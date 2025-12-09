import { endOfDay, sub, endOfMonth, startOfMonth } from "date-fns";
import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getDoc, limit, onSnapshot, orderBy, query, where, getFirestore } from "firebase/firestore";
import { cache } from "react";

import { firebaseConfig } from './firebaseConfig';
import { countries } from "../sources/countries";


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export function getCountryCollectionRef(countryName, collectionName) {
  const countriesCollection = collection(db, '- Countries -');

  const countryID = countries[countryName].english;
  const countryDoc = doc(countriesCollection, countryID);
  return collection(countryDoc, collectionName);
}


function prepareData(doc) {
  const data = doc.data();
  const cleanedData = JSON.parse(JSON.stringify(data));
  const timestamp = new Date(data.timestamp.seconds * 1000);
  return { id: doc.id, ...cleanedData, timestamp };
}


// ----------------- Headlines -----------------
// ---------------------------------------------

function prepareHeadline(doc) {
  const data = doc.data();
  const cleanedData = JSON.parse(JSON.stringify(data));
  const timestamp = new Date(data.timestamp.seconds * 1000);

  // Validate link - only allow full URLs starting with http:// or https://
  // Reject relative URLs (like /sports/article.html) that could become internal links
  let validatedLink = cleanedData.link;
  if (validatedLink && typeof validatedLink === 'string') {
    if (!validatedLink.startsWith('http://') && !validatedLink.startsWith('https://')) {
      validatedLink = ''; // Invalid link - clear it
    }
  }

  return {
    id: doc.id,
    headline: cleanedData.headline,
    subtitle: cleanedData.subtitle,
    link: validatedLink,
    timestamp: timestamp,
    website_id: cleanedData.website_id,
    image: cleanedData.image,
  };
}

export const getCountryDayHeadlines = cache(async (countryName, day, daysInclude = 1) => {
  const headlinesCollection = getCountryCollectionRef(countryName, 'headlines');

  const theDay = endOfDay(day);
  const dayBefore = sub(theDay, { days: daysInclude });
  const q = query(
    headlinesCollection,
    where('timestamp', '>=', dayBefore),
    where('timestamp', '<=', theDay),
    orderBy('timestamp', 'desc'),
  );

  let headlines = await getDocs(q);
  if (headlines.empty) return [];
  headlines = headlines.docs.map(headline => prepareHeadline(headline));
  return headlines;
});

export const getRecentHeadlines = async (countryName, fromTime) => {
  const headlinesCollection = getCountryCollectionRef(countryName, 'headlines');
  const q = query(
    headlinesCollection,
    where('timestamp', '>', fromTime),
    orderBy('timestamp', 'desc'),
  );
  let headlines = await getDocs(q);
  if (headlines.empty) return [];
  headlines = headlines.docs.map(headline => prepareHeadline(headline));
  return headlines;
}

export const subscribeToHeadlines = (countryName, callback) => {
  const headlinesCollection = getCountryCollectionRef(countryName, 'headlines');
  const q = query(
    headlinesCollection,
    orderBy('timestamp', 'desc'),
    limit(1),
  );
  return onSnapshot(q, snapshot => {
    if (snapshot.empty) return
    const headlines = snapshot.docs.map(doc => prepareHeadline(doc));
    callback(headlines);
  });
}

// ----------------- Summaries -----------------
// ---------------------------------------------

function prepareSummary(doc) {
  const data = doc.data();
  const cleanedData = JSON.parse(JSON.stringify(data));
  const timestamp = new Date(data.timestamp.seconds * 1000);
  return {
    id: doc.id,
    summary: cleanedData.summary,
    hebrewSummary: cleanedData.hebrewSummary,
    translatedSummary: cleanedData.translatedSummary,
    englishHeadline: cleanedData.englishHeadline,
    hebrewHeadline: cleanedData.hebrewHeadline,
    translatedHeadline: cleanedData.translatedHeadline,
    timestamp: timestamp,
  }
}

export const getCountryDaySummaries = cache(async (countryName, day, daysInclude = 1) => {
  const summariesCollection = getCountryCollectionRef(countryName, 'summaries');

  const theDay = endOfDay(day);
  const dayBefore = sub(theDay, { days: daysInclude });
  const q = query(
    summariesCollection,
    where('timestamp', '>=', dayBefore),
    where('timestamp', '<=', theDay),
    orderBy('timestamp', 'desc'),
  );

  let summaries = await getDocs(q);
  if (summaries.empty) return [];
  summaries = summaries.docs.map(doc => prepareSummary(doc));
  return summaries;
})

export const getRecentSummaries = async (countryName, fromTime) => {
  const summariesCollection = getCountryCollectionRef(countryName, 'summaries');
  const q = query(
    summariesCollection,
    where('timestamp', '>', fromTime),
    orderBy('timestamp', 'desc'),
  );
  let summaries = await getDocs(q);
  if (summaries.empty) return [];
  summaries = summaries.docs.map(doc => prepareSummary(doc));
  return summaries;
}

export const subscribeToSummaries = (countryName, callback) => {
  const summariesCollection = getCountryCollectionRef(countryName, 'summaries');
  const q = query(
    summariesCollection,
    orderBy('timestamp', 'desc'),
    limit(1),
  );
  return onSnapshot(q, snapshot => {
    if (snapshot.empty) return
    const summaries = snapshot.docs.map(doc => prepareSummary(doc));
    callback(summaries);
  });
}

// ----------------- Daily Summaries -----------------
// ---------------------------------------------------

// Lightweight function to get only the headline for metadata (fast)
export const getCountryDayHeadlineOnly = cache(async (countryName, day) => {
  try {
    // Use same collection name and date parsing as getCountryDailySummary
    let date;
    if (day instanceof Date) {
      date = day;
    } else if (typeof day === 'string') {
      // Handle DD-MM-YYYY format
      if (day.includes('-') && day.split('-').length === 3) {
        const [dayPart, monthPart, yearPart] = day.split('-');
        date = new Date(parseInt(yearPart), parseInt(monthPart) - 1, parseInt(dayPart));
      } else {
        date = new Date(day);
      }
    } else {
      date = new Date(day);
    }

    if (isNaN(date.getTime())) {
      return null;
    }

    const dateString = date.toISOString().split('T')[0];
    const dailyCollection = getCountryCollectionRef(countryName, 'dailysummaries'); // Note: lowercase 's'

    const q = query(
      dailyCollection,
      where('date', '==', dateString),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      // Return only the headlines with correct field names that getHeadline expects
      return {
        headline: data.headline,
        headlineHebrew: data.headlineHebrew,
        headline_option_1: data.headline_option_1,
        translatedHeadline: data.translatedHeadline
      };
    }
    return null;
  } catch (error) {
    // Silently return null on error - metadata will use fallback
    return null;
  }
});

export const getCountryDailySummary = cache(async (countryName, day) => {
  // console.log('getting daily summary for', countryName, day);
  let date;
  
  if (day instanceof Date) {
    date = day;
  } else if (typeof day === 'string') {
    // Handle DD-MM-YYYY format
    if (day.includes('-') && day.split('-').length === 3) {
      const [dayPart, monthPart, yearPart] = day.split('-');
      date = new Date(parseInt(yearPart), parseInt(monthPart) - 1, parseInt(dayPart));
    } else {
      date = new Date(day);
    }
  } else {
    date = new Date(day);
  }
  
  // Validate the date
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date provided to getCountryDailySummary: ${day}`);
    return null;
  }
  
  const dateString = date.toISOString().split('T')[0];

  const dailyCollection = getCountryCollectionRef(countryName, 'dailysummaries');
  const q = query(
    dailyCollection,
    where('date', '==', dateString),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return prepareData(snapshot.docs[0]);
})

export const getCountryDailySummariesForMonth = cache(async (countryName, year, month) => {
  // Create dates for the target month (month is 1-indexed)
  const startDate = new Date(year, month - 1, 1); // First day of month
  const endDate = new Date(year, month, 0); // Last day of month
  
  // Format as YYYY-MM-DD strings
  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  const dailyCollection = getCountryCollectionRef(countryName, 'dailysummaries');
  const q = query(
    dailyCollection,
    where('date', '>=', startDateString),
    where('date', '<=', endDateString),
    orderBy('date', 'desc')
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];
  
  const results = snapshot.docs.map(doc => prepareData(doc));
  
  // Additional filtering to ensure we only get the target month
  const filteredResults = results.filter(summary => {
    const summaryDate = new Date(summary.date);
    return summaryDate.getFullYear() === year && summaryDate.getMonth() === month - 1;
  });
  
  return filteredResults;
})

export const getGlobalDailySummariesForDate = cache(async (year, month, date) => {
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
  
  const globalSummaries = [];
  
  // Iterate through all countries and fetch their daily summary for this date
  const countryKeys = Object.keys(countries).filter(c => c !== 'uae' && c !== 'finland');
  
  for (const countryName of countryKeys) {
    try {
      const dailyCollection = getCountryCollectionRef(countryName, 'dailysummaries');
      const q = query(
        dailyCollection,
        where('date', '==', dateString),
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const countryData = prepareData(snapshot.docs[0]);
        globalSummaries.push({
          ...countryData,
          country: countryName
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch daily summary for ${countryName} on ${dateString}:`, error);
      // Continue with other countries even if one fails
    }
  }
  
  return globalSummaries;
})

// ========================================================================
// METADATA AGGREGATED HEADLINES - Optimized single-read approach
// ========================================================================
// This function fetches headlines from the daily metadata document which
// aggregates all headlines for a specific date into a single document.
// Benefits: 1 read instead of 200-250 reads
// Path: /- Countries -/[COUNTRYID]/metadata/[YYYY-MM-DD]
// Structure: { headlines: { 0: {...}, 1: {...}, ... } }
// ========================================================================

/**
 * Fetches headlines from the aggregated metadata document for a specific date.
 * Falls back to null if the document doesn't exist or fails.
 *
 * @param {string} countryName - The country name (e.g., 'us', 'israel')
 * @param {Date} date - The date to fetch headlines for
 * @returns {Array|null} - Array of headline objects with synthetic IDs, or null if not found
 */
export const getCountryDayHeadlinesFromMetadata = cache(async (countryName, date) => {
  try {
    // Format date as YYYY-MM-DD
    const dateString = date.toISOString().split('T')[0];

    // Get reference to the metadata document
    const metadataCollection = getCountryCollectionRef(countryName, 'metadata');
    const metadataDocRef = doc(metadataCollection, dateString);

    // Fetch the document
    const snapshot = await getDoc(metadataDocRef);

    // Return null if document doesn't exist
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    // Return null if headlines field doesn't exist or is empty
    if (!data.headlines) {
      return null;
    }

    // Headlines can be either an array (from ArrayUnion) or object (from numbered keys)
    const headlinesArray = Array.isArray(data.headlines)
      ? data.headlines
      : Object.values(data.headlines);

    // Transform to match expected headline structure with synthetic ID
    const headlines = headlinesArray.map(h => {
      // Convert Firestore timestamp to JavaScript Date
      const timestamp = h.timestamp?.seconds
        ? new Date(h.timestamp.seconds * 1000)
        : new Date(h.timestamp);

      // Generate synthetic ID from website_id + timestamp (unique combination)
      const syntheticId = `${h.website_id}_${timestamp.getTime()}`;

      // Validate link - only allow full URLs starting with http:// or https://
      let validatedLink = h.link;
      if (validatedLink && typeof validatedLink === 'string') {
        if (!validatedLink.startsWith('http://') && !validatedLink.startsWith('https://')) {
          validatedLink = ''; // Invalid link - clear it
        }
      }

      return {
        id: syntheticId,
        headline: h.headline,
        subtitle: h.subtitle,
        link: validatedLink,
        timestamp: timestamp,
        website_id: h.website_id,
        image: h.image,
      };
    });

    return headlines;

  } catch (error) {
    // Log error for debugging but return null to trigger fallback
    console.warn(`Failed to fetch metadata headlines for ${countryName} on ${date}:`, error.message);
    return null;
  }
});