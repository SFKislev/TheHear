import { countries } from "@/utils/sources/countries";
import HistoryContent from "./HistoryContent";
import { createMetadata, SearchLdJson } from "./metadata";
import UniversalFooter from "@/components/UniversalFooter";

export const revalidate = 3600; // 1 hour
export const dynamicParams = false;

export async function generateStaticParams() {
    const countryNames = Object.keys(countries);

    // Only generate static params for English locale
    // Hebrew search routes will be redirected to English via middleware
    const routes = countryNames.map(country => ({
        country, 
        locale: 'en'
    }));
    return routes;
}

export async function generateMetadata({ params }) {
    const { country, locale } = await params;
    return createMetadata({ country, locale });
}

export default async function HistoryPage({ params }) {
    const { country, locale } = await params;

    return (
        <>
            {/* JSON-LD structured data for SEO */}
            <SearchLdJson country={country} locale={locale} />
            
            {/* Client-side interactive content - UX unchanged */}
            <HistoryContent locale={locale} country={country} />

            <UniversalFooter
                locale={locale}
                pageType="search"
                country={country}
            />
        </>
    );
}
