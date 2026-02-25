import Link from "next/link";
import { sub, add } from "date-fns";
import { createDateString } from '@/utils/utils';

// Server-side component that always renders date navigation links in HTML
export default function DateLinksData({ locale, country, currentDate, className = "date-nav-hidden" }) {
    const today = new Date();
    const pageDate = currentDate ? new Date(currentDate) : today;
    
    // Calculate previous and next dates
    const yesterday = sub(pageDate, { days: 1 });
    const tomorrow = add(pageDate, { days: 1 });
    
    // For current day pages, only show yesterday
    // For historical pages, show both previous and next (if next isn't in future)
    const showTomorrow = currentDate && tomorrow <= today;
    
    return (
        <nav 
            id="date-links-data" 
            className={className}
            aria-label="Daily news navigation"
            style={{ direction: 'ltr' }}
        >
            <h2>Daily News Navigation - {country}</h2>
            <ul>
                <li>
                    <Link
                        href={`/${locale}/${country}/${createDateString(yesterday)}`}
                    >
                        {yesterday.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} news from {country}
                    </Link>
                </li>
                {showTomorrow && (
                    <li>
                        <Link
                            href={`/${locale}/${country}/${createDateString(tomorrow)}`}
                        >
                            {tomorrow.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} news from {country}
                        </Link>
                    </li>
                )}
                {/* Link back to current day */}
                {currentDate && (
                    <li>
                        <Link href={`/${locale}/${country}`}>
                            Current {country} news today
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}