// Archive updater - keeps search data fresh with incremental updates
import { collection, doc, getDocs, query, orderBy, where, limit, getFirestore } from "firebase/firestore";
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '../database/firebaseConfig';
import { 
    downloadArchiveFile, 
    uploadArchiveFile, 
    getArchiveFileMetadata, 
    needsUpdate, 
    uploadArchiveIndex,
    downloadArchiveIndex 
} from './firebaseStorage';

// Initialize Firebase if not already done
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

/**
 * Strip document for search (same as export script)
 */
function stripDocumentForSearch(doc, type) {
    const data = doc.data();
    const timestamp = data.timestamp ? new Date(data.timestamp.seconds * 1000) : null;
    
    const stripped = {
        id: doc.id,
        type,
        timestamp: timestamp?.toISOString(),
        date: data.date || null
    };
    
    switch (type) {
        case 'headlines':
            stripped.headline = data.headline || '';
            stripped.subtitle = data.subtitle || '';
            stripped.website_id = data.website_id || '';
            // Validate link - only allow full URLs starting with http:// or https://
            let validatedLink = data.link || '';
            if (validatedLink && !validatedLink.startsWith('http://') && !validatedLink.startsWith('https://')) {
                validatedLink = ''; // Invalid link - clear it
            }
            stripped.link = validatedLink;
            break;
            
        case 'summaries':
            stripped.summary = data.summary || '';
            stripped.englishHeadline = data.englishHeadline || '';
            stripped.hebrewHeadline = data.hebrewHeadline || '';
            stripped.translatedHeadline = data.translatedHeadline || '';
            break;
            
        case 'dailysummaries':
            stripped.summary = data.summary || '';
            stripped.summaryEnglish = data.summaryEnglish || '';
            stripped.summaryHebrew = data.summaryHebrew || '';
            stripped.headline = data.headline || '';
            stripped.headlineHebrew = data.headlineHebrew || '';
            stripped.headlineLocal = data.headlineLocal || '';
            stripped.headline_option_1 = data.headline_option_1 || '';
            stripped.englishHeadline = data.englishHeadline || '';
            stripped.hebrewHeadline = data.hebrewHeadline || '';
            break;
    }
    
    return stripped;
}

/**
 * Get the latest timestamp from Firestore for a specific collection and month
 */
async function getLatestFirestoreTimestamp(country, collectionName, year, month) {
    const countriesCollection = collection(db, '- Countries -');
    const countryDoc = doc(countriesCollection, country.toUpperCase());
    const collectionRef = collection(countryDoc, collectionName);
    
    // Get month range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    try {
        const q = query(
            collectionRef,
            where('timestamp', '>=', startDate),
            where('timestamp', '<=', endDate),
            orderBy('timestamp', 'desc'),
            limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return null;
        }
        
        const latestDoc = snapshot.docs[0];
        const timestamp = latestDoc.data().timestamp;
        return timestamp ? new Date(timestamp.seconds * 1000) : null;
    } catch (error) {
        console.error(`Error getting latest timestamp for ${country}/${collectionName}:`, error);
        return null;
    }
}

/**
 * Fetch new data from Firestore since last update
 */
async function fetchNewData(country, collectionName, year, month, sinceTimestamp) {
    const countriesCollection = collection(db, '- Countries -');
    const countryDoc = doc(countriesCollection, country.toUpperCase());
    const collectionRef = collection(countryDoc, collectionName);
    
    // Get month range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    try {
        let q;
        if (sinceTimestamp) {
            q = query(
                collectionRef,
                where('timestamp', '>=', startDate),
                where('timestamp', '<=', endDate),
                where('timestamp', '>', sinceTimestamp),
                orderBy('timestamp', 'desc'),
                limit(1000) // Reasonable limit for incremental updates
            );
        } else {
            // If no since timestamp, get all for the month (first time)
            q = query(
                collectionRef,
                where('timestamp', '>=', startDate),
                where('timestamp', '<=', endDate),
                orderBy('timestamp', 'desc'),
                limit(5000) // Higher limit for initial fetch
            );
        }
        
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => stripDocumentForSearch(doc, collectionName));
        
        console.log(`📥 Fetched ${docs.length} new ${collectionName} docs for ${country} ${year}-${month.toString().padStart(2, '0')}`);
        return docs;
    } catch (error) {
        console.error(`Error fetching new data for ${country}/${collectionName}:`, error);
        return [];
    }
}

/**
 * Update a specific month's archive file
 */
async function updateMonthArchive(country, monthKey, collectionType) {
    const [year, monthStr] = monthKey.split('-');
    const month = parseInt(monthStr);
    
    console.log(`🔄 Checking ${country}/${collectionType}/${monthKey} for updates...`);
    
    // Get latest timestamp from Firestore
    const latestFirestoreTimestamp = await getLatestFirestoreTimestamp(country, collectionType, parseInt(year), month);
    
    if (!latestFirestoreTimestamp) {
        console.log(`📭 No data in Firestore for ${country}/${collectionType}/${monthKey}`);
        return false;
    }
    
    // Check if update is needed
    const updateNeeded = await needsUpdate(country, monthKey, collectionType, latestFirestoreTimestamp);
    
    if (!updateNeeded) {
        console.log(`✅ ${country}/${collectionType}/${monthKey} is up to date`);
        return false;
    }
    
    // Get existing data
    let existingData = await downloadArchiveFile(country, monthKey, collectionType);
    const metadata = await getArchiveFileMetadata(country, monthKey, collectionType);
    
    // Determine since when to fetch new data
    let sinceTimestamp = null;
    if (existingData && metadata) {
        sinceTimestamp = new Date(metadata.lastUpdated);
        console.log(`📅 Fetching data since ${sinceTimestamp.toISOString()}`);
    }
    
    // Fetch new data from Firestore
    const newDocs = await fetchNewData(country, collectionType, parseInt(year), month, sinceTimestamp);
    
    if (newDocs.length === 0) {
        console.log(`📭 No new data to add for ${country}/${collectionType}/${monthKey}`);
        return false;
    }
    
    // Merge new data with existing (if any)
    let mergedData;
    if (existingData) {
        // Remove duplicates and merge
        const existingIds = new Set(existingData.map(doc => doc.id));
        const uniqueNewDocs = newDocs.filter(doc => !existingIds.has(doc.id));
        
        mergedData = [...uniqueNewDocs, ...existingData];
        console.log(`🔄 Added ${uniqueNewDocs.length} new docs to existing ${existingData.length} docs`);
    } else {
        mergedData = newDocs;
        console.log(`🆕 Created new archive with ${newDocs.length} docs`);
    }
    
    // Sort by timestamp (most recent first)
    mergedData.sort((a, b) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime;
    });
    
    // Upload updated data
    await uploadArchiveFile(country, monthKey, mergedData, collectionType);
    
    console.log(`✅ Updated ${country}/${collectionType}/${monthKey} with ${mergedData.length} total docs`);
    return true;
}

/**
 * Update current month's archives for a country
 * This is called when users visit the history page
 */
export async function updateCurrentMonthArchives(country) {
    console.log(`🔄 Updating current month archives for ${country}...`);
    
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    try {
        // Update both headlines and summaries for current month
        const headlinesUpdated = await updateMonthArchive(country, currentMonthKey, 'headlines');
        const summariesUpdated = await updateMonthArchive(country, currentMonthKey, 'summaries');
        
        // Update index if anything changed
        if (headlinesUpdated || summariesUpdated) {
            await updateArchiveIndex(country);
            console.log(`✅ Archive update complete for ${country}`);
            return true;
        } else {
            console.log(`✅ Archives already up to date for ${country}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Failed to update archives for ${country}:`, error);
        return false;
    }
}

/**
 * Update the archive index file
 */
async function updateArchiveIndex(country) {
    // This would ideally scan all archive files and build metadata
    // For now, we'll create a basic index
    const now = new Date();
    const indexData = {
        country,
        lastUpdated: now.toISOString(),
        version: '2.0',
        description: 'Search archive updated automatically'
    };
    
    await uploadArchiveIndex(country, indexData);
}

/**
 * Force full rebuild of a specific month (for maintenance)
 */
export async function rebuildMonthArchive(country, monthKey) {
    console.log(`🔄 Rebuilding ${country}/${monthKey} archive...`);
    
    const [year, monthStr] = monthKey.split('-');
    const month = parseInt(monthStr);
    
    const collections = ['headlines', 'summaries', 'dailysummaries'];
    const archiveData = {
        headlines: [],
        summaries: []
    };
    
    for (const collectionName of collections) {
        const newDocs = await fetchNewData(country, collectionName, parseInt(year), month, null);
        
        if (collectionName === 'headlines') {
            archiveData.headlines = newDocs;
        } else {
            // Combine summaries and dailysummaries
            archiveData.summaries = archiveData.summaries.concat(newDocs);
        }
    }
    
    // Sort summaries by timestamp
    archiveData.summaries.sort((a, b) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime;
    });
    
    // Upload both collections
    await uploadArchiveFile(country, monthKey, archiveData.headlines, 'headlines');
    await uploadArchiveFile(country, monthKey, archiveData.summaries, 'summaries');
    
    console.log(`✅ Rebuilt ${country}/${monthKey} archive`);
}