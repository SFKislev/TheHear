import UniversalFooter from "@/components/UniversalFooter";
import { notFound } from "next/navigation";
import MixFonts from "../_components/MixFonts";
import MixPageContent from "../_components/MixPageContent";
import { getMergedSelections, getMixBundle, getMixPageTitle, getMixSourceOptions, mixBundles } from "@/utils/mix/config";
import { getMixInitialSources } from "@/utils/mix/fetchSources";

export const revalidate = 900;
export const dynamicParams = false;

export async function generateStaticParams() {
    return Object.keys(mixBundles).flatMap((bundle) => [
        { locale: "en", bundle },
        { locale: "heb", bundle },
    ]);
}

export default async function MixBundlePage({ params, searchParams }) {
    const { locale, bundle } = await params;
    const resolvedSearchParams = await searchParams;

    if (!getMixBundle(bundle)) {
        notFound();
    }

    const selections = getMergedSelections(bundle, resolvedSearchParams?.sources);
    const initialSources = await getMixInitialSources(selections);
    const fontCountries = [...new Set(selections.map(({ country }) => country))];

    return (
        <>
            <MixFonts countries={fontCountries} />
            <MixPageContent
                locale={locale}
                title={getMixPageTitle(locale, bundle)}
                initialSelections={selections}
                initialSources={initialSources}
                options={getMixSourceOptions()}
                bundleSlug={bundle}
            />
            <UniversalFooter locale={locale} pageType="mix-live" />
        </>
    );
}
