import UniversalFooter from "@/components/UniversalFooter";
import MixFonts from "./_components/MixFonts";
import MixPageContent from "./_components/MixPageContent";
import { getMergedSelections, getMixPageTitle, getMixSourceOptions } from "@/utils/mix/config";
import { getMixInitialSources } from "@/utils/mix/fetchSources";

export const revalidate = 900;

export default async function MixPage({ params, searchParams }) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;
    const selections = getMergedSelections(null, resolvedSearchParams?.sources);
    const initialSources = await getMixInitialSources(selections);
    const fontCountries = [...new Set(selections.map(({ country }) => country))];

    return (
        <>
            <MixFonts countries={fontCountries} />
            <MixPageContent
                locale={locale}
                title={getMixPageTitle(locale)}
                initialSelections={selections}
                initialSources={initialSources}
                options={getMixSourceOptions()}
                bundleSlug={null}
            />
            <UniversalFooter locale={locale} pageType="mix-live" />
        </>
    );
}
