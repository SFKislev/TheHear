import UniversalFooter from "@/components/UniversalFooter";
import { notFound, redirect } from "next/navigation";
import MixFonts from "../../_components/MixFonts";
import MixPageContent from "../../_components/MixPageContent";
import { getMergedSelections, getMixBundle, getMixPageTitle, getMixSourceOptions, mixBundles } from "@/utils/mix/config";
import { getMixInitialSources, parseMixDateParam } from "@/utils/mix/fetchSources";

export const revalidate = 604800;

export async function generateStaticParams() {
    return Object.keys(mixBundles).flatMap((bundle) => [
        { locale: "en", bundle },
        { locale: "heb", bundle },
    ]);
}

export default async function MixBundleDatePage({ params, searchParams }) {
    const { locale, bundle, date } = await params;
    const resolvedSearchParams = await searchParams;

    if (!getMixBundle(bundle)) {
        notFound();
    }

    const pageDate = parseMixDateParam(date);
    if (!pageDate) {
        redirect(`/${locale}/mix/${bundle}`);
    }

    const selections = getMergedSelections(bundle, resolvedSearchParams?.sources);
    const initialSources = await getMixInitialSources(selections, pageDate);
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
                pageDate={pageDate}
                bundleSlug={bundle}
            />
            <UniversalFooter locale={locale} pageType="mix-date" date={pageDate} />
        </>
    );
}
