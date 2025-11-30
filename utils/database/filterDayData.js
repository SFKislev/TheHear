/**
 * Creates a Date object representing a specific local time in a given timezone
 * This is surprisingly tricky in JavaScript without libraries!
 *
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:MM:SS or HH:MM:SS.mmm format
 * @param {string} timezone - IANA timezone name (e.g., "America/New_York")
 * @returns {Date} - Date object in UTC that represents the local time
 */
function createDateInTimezone(dateStr, timeStr, timezone) {
    // Parse components
    const [year, month, day] = dateStr.split('-').map(Number);
    const timeParts = timeStr.split(':');
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);
    const secondParts = (timeParts[2] || '0').split('.');
    const second = parseInt(secondParts[0]);
    const ms = secondParts[1] ? parseInt(secondParts[1].padEnd(3, '0').slice(0, 3)) : 0;

    // Method: Use two Date objects to calculate the offset
    // 1. Create a date in UTC for the same wall-clock time
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms));

    // 3. Format the UTC date as if it were in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(utcDate);
    const tzYear = parseInt(parts.find(p => p.type === 'year').value);
    const tzMonth = parseInt(parts.find(p => p.type === 'month').value);
    const tzDay = parseInt(parts.find(p => p.type === 'day').value);
    const tzHour = parseInt(parts.find(p => p.type === 'hour').value);
    const tzMinute = parseInt(parts.find(p => p.type === 'minute').value);
    const tzSecond = parseInt(parts.find(p => p.type === 'second').value);

    // 4. Calculate the difference in milliseconds
    const targetTime = Date.UTC(year, month - 1, day, hour, minute, second, ms);
    const tzTime = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, tzSecond, 0);
    const offset = targetTime - tzTime;

    // Debug logging removed for production - was bloating HTML payload

    // 5. Apply offset to get correct UTC time
    return new Date(utcDate.getTime() + offset);
}

/**
 * Filters a multi-day dataset to show only one day's content, with continuity.
 *
 * WHY THIS EXISTS:
 * - Headlines can spill across day boundaries due to timezone differences
 * - A user in Tel Aviv viewing "US 20-11-2025" might see headlines timestamped in US 21-11-2025
 * - We fetch a 3-day window (previous/current/next) but only display the requested day
 *
 * CONTINUITY FEATURE:
 * - For each news source, we include the last headline from the previous day
 * - This ensures the timeline doesn't have gaps (users see where yesterday ended)
 * - Same logic applies to summaries (include previous day's last summary)
 *
 * @param {Object} data - The data object containing headlines, summaries
 * @param {Array} data.headlines - Array of headline objects with timestamp and website_id
 * @param {Array} data.summaries - Array of summary objects with timestamp
 * @param {Date} parsedDate - The date to filter to (will be treated as local day boundaries)
 * @returns {Object} - { headlines, initialSummaries } filtered to the day + continuity items
 */
export function filterToDayWithContinuity(data, parsedDate) {
    // Define day boundaries in local time
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // ============= HEADLINES =============
    // Get all headlines within the day boundaries
    const dayHeadlines = data.headlines.filter(h =>
        h.timestamp >= startOfDay && h.timestamp <= endOfDay
    );

    // Get unique news sources from ALL headlines (not just today's)
    const allSources = [...new Set(data.headlines.map(h => h.website_id))];

    // For continuity: add the last headline from previous day for each source
    const previousDayLastHeadlines = allSources.map(sourceId => {
        const sourceHeadlines = data.headlines
            .filter(h => h.website_id === sourceId && h.timestamp < startOfDay)
            .sort((a, b) => b.timestamp - a.timestamp);
        return sourceHeadlines[0]; // Most recent headline before startOfDay
    }).filter(Boolean); // Remove undefined entries (sources with no previous headlines)

    // Merge and sort all headlines by timestamp (newest first)
    const mergedHeadlines = [...dayHeadlines, ...previousDayLastHeadlines]
        .sort((a, b) => b.timestamp - a.timestamp);

    // Deduplicate by BOTH URL AND headline text (keep first occurrence = newest due to sort)
    // Only remove if BOTH the link AND headline text are identical
    // This allows headline rewording updates while preventing true duplicates
    const seenCombos = new Set();
    const headlines = mergedHeadlines.filter(h => {
        if (!h.link) return true; // Keep headlines without links
        const combo = `${h.link}|||${h.headline || ''}`; // Combine URL and headline text
        if (seenCombos.has(combo)) return false; // Skip true duplicates
        seenCombos.add(combo);
        return true;
    });

    // ============= SUMMARIES =============
    // Get all summaries within the day boundaries
    const daySummaries = data.summaries.filter(s =>
        s.timestamp >= startOfDay && s.timestamp <= endOfDay
    );

    // For continuity: add the last summary from previous day
    const previousDayLastSummary = data.summaries
        .filter(s => s.timestamp < startOfDay)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

    // Merge and sort (if previous summary exists)
    const initialSummaries = previousDayLastSummary
        ? [previousDayLastSummary, ...daySummaries].sort((a, b) => b.timestamp - a.timestamp)
        : daySummaries;

    return { headlines, initialSummaries };
}

/**
 * Filters a multi-day dataset to show STRICTLY one day's content only.
 *
 * DIFFERENCE FROM filterToDayWithContinuity:
 * - NO continuity feature - only items strictly within day boundaries
 * - Used for feed/archive pages where we want exact chronological display
 * - Does NOT include previous day's last headline/summary
 * - Filters based on country's local timezone (from metadata)
 *
 * @param {Object} data - The data object containing headlines, summaries, and metadata
 * @param {Array} data.headlines - Array of headline objects with timestamp
 * @param {Array} data.summaries - Array of summary objects with timestamp
 * @param {Object} data.metadata - Metadata object containing timezone info
 * @param {Date} parsedDate - The date to filter to (will be treated in country's timezone)
 * @returns {Object} - { headlines, initialSummaries } filtered to ONLY the requested day
 */
export function filterToStrictDay(data, parsedDate) {
    // Get timezone from metadata, fallback to UTC if not available
    const timezone = data.metadata?.timezone || 'UTC';

    // Format date as YYYY-MM-DD for the target day
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Create day boundaries in the country's timezone
    // Start: YYYY-MM-DD 00:00:00 in country timezone
    const startOfDay = createDateInTimezone(dateStr, '00:00:00', timezone);

    // End: YYYY-MM-DD 23:59:59.999 in country timezone
    const endOfDay = createDateInTimezone(dateStr, '23:59:59.999', timezone);

    // Debug logging removed for production - was bloating HTML payload

    // ============= HEADLINES =============
    // Get ONLY headlines within the day boundaries (no continuity)
    const filteredHeadlines = data.headlines
        .filter(h => h.timestamp >= startOfDay && h.timestamp <= endOfDay)
        .sort((a, b) => b.timestamp - a.timestamp);

    // Deduplicate by BOTH URL AND headline text (keep first occurrence = newest due to sort)
    // Only remove if BOTH the link AND headline text are identical
    // This allows headline rewording updates while preventing true duplicates
    const seenCombos = new Set();
    const headlines = filteredHeadlines.filter(h => {
        if (!h.link) return true; // Keep headlines without links
        const combo = `${h.link}|||${h.headline || ''}`; // Combine URL and headline text
        if (seenCombos.has(combo)) {
            return false; // Skip true duplicates
        }
        seenCombos.add(combo);
        return true;
    });

    // ============= SUMMARIES =============
    // Get ONLY summaries within the day boundaries (no continuity)
    const initialSummaries = data.summaries
        .filter(s => s.timestamp >= startOfDay && s.timestamp <= endOfDay)
        .sort((a, b) => b.timestamp - a.timestamp);

    return { headlines, initialSummaries };
}
