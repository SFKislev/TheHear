import Link from "next/link";
import { countries } from "@/utils/sources/countries";

// Server-side component that always renders country navigation links in HTML
export default function CountryLinksData({ locale, currentCountry, className = "country-nav-hidden" }) {
    return (
        <nav 
            id="country-links-data" 
            className={className}
            aria-label="Country navigation"
            style={{ direction: 'ltr' }}
        >
            <h2>News by Country</h2>
            <ul>
                {Object.keys(countries).map((countryCode) => (
                    <li key={countryCode}>
                        <Link
                            href={`/${locale}/${countryCode}`}
                            aria-current={countryCode === currentCountry ? 'page' : undefined}
                        >
                            {countries[countryCode].english} news in {locale === 'heb' ? 'Hebrew' : 'English'}
                        </Link>
                    </li>
                ))}
                {/* Global page link */}
                <li>
                    <Link href={`/${locale}/global`}>
                        Global news overview in {locale === 'heb' ? 'Hebrew' : 'English'}
                    </Link>
                </li>
            </ul>
        </nav>
    );
}