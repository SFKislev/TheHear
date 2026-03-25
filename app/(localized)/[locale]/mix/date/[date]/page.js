import UniversalFooter from "@/components/UniversalFooter";
import { redirect } from "next/navigation";
import MixFonts from "../../_components/MixFonts";
import MixPageContent from "../../_components/MixPageContent";
import { getMergedSelections, getMixPageTitle, getMixSourceOptions } from "@/utils/mix/config";
import { getMixInitialSources, parseMixDateParam } from "@/utils/mix/fetchSources";

export const revalidate = 604800;

export default async function MixDatePage({ params, searchParams }) {
    const { locale, date } = await params;
    const resolvedSearchParams = await searchParams;
    const pageDate = parseMixDateParam(date);

    if (!pageDate) {
        redirect(`/${locale}/mix`);
    }

    const selections = getMergedSelections(null, resolvedSearchParams?.sources);
    const initialSources = await getMixInitialSources(selections, pageDate);
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
                pageDate={pageDate}
                bundleSlug={null}
            />
            <UniversalFooter locale={locale} pageType="mix-date" date={pageDate} />
        </>
    );
}
