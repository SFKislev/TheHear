'use client'

import AddSourceButton from "./Source/AddSourceButton";
import SourceCard from "./Source/SourceCard";
import MobileSummary from "./MobileSummary";
import { countries } from "@/utils/sources/countries";
import useWebsitesManager from "@/utils/useWebsites";
import useSourcesManager from "@/utils/database/useSourcesManager";
import useMobile from "@/components/useMobile";
import { useActiveWebsites } from "@/utils/store";


export default function MainSection({ sources, country, locale, pageDate, initialSummaries, yesterdaySummary, daySummary, isVerticalScreen }) {
    const { sources: managedSources, loading: isLoading } = useSourcesManager(country, sources, !Boolean(pageDate));
    useWebsitesManager(country, managedSources)
    const { isMobile } = useMobile();
    const activeWebsites = useActiveWebsites(state => state.activeWebsites);

    return (
        <div className={`custom-scrollbar
                        ${isVerticalScreen ? 'gap-x-6 gap-y-2 px-8 pt-8 pb-4' : 'gap-4 p-4'}
                        flex flex-col sm:grid
                        ${isVerticalScreen ? 'grid-cols-2' : 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 fhd:grid-cols-4 qhd:grid-cols-6'}
                        direction-${countries[country].languageDirection}
                        `}>
            {/* Mobile Summary - shows only on mobile, at the top */}
            {isMobile && (
                <div className="sm:hidden mb-2">
                    <MobileSummary {...{ locale, country, pageDate, initialSummaries, yesterdaySummary, daySummary }} />
                    <div className="border-b border-gray-200 mt-0"></div>
                </div>
            )}
            
            {Object.keys(managedSources).map((source) => (
                    <SourceCard
                        key={source}
                        headlines={managedSources[source].headlines}
                        {...{ source, country, locale, isLoading, pageDate, isVerticalScreen, sources: managedSources }}
                    />
            ))}
            <AddSourceButton {...{ locale, country, sources: managedSources }} />
        </div>
    );
}
