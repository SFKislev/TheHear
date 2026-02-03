import Link from "next/link";
import { getCountryLaunchDate } from "@/utils/launchDates";

// Server-side component that always renders links in HTML
export default function ArchiveLinksData({ locale, country, className = "archive-nav-hidden" }) {
    const launchDate = getCountryLaunchDate(country);
    const now = new Date();
    
    // Generate list of available months from launch date to current month
    const months = [];
    let currentDate = new Date(launchDate.getFullYear(), launchDate.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);

    while (currentDate <= endDate) {
        months.push({
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            monthName: currentDate.toLocaleDateString('en', { month: 'long' })
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return (
        <nav 
            id="archive-links-data" 
            className={className}
            aria-label="Historical news archives"
            style={{ direction: 'ltr' }}
        >
            <h2>Historical News Archives - {country}</h2>
            <ul>
                {months.reverse().map(month => (
                    <li key={`${month.year}-${month.month}`}>
                        <Link
                            href={`/${locale}/${country}/history/${month.year}/${month.month.toString().padStart(2, '0')}`}
                        >
                            {month.monthName} {month.year} news archive for {country}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
