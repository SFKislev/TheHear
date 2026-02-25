import Summary from "./Summary";

export default function SummariesList({ summaries, activeSummaryId, locale, country}) {

    const lastSummary = summaries[summaries.length - 1]

    return (
        <div className={`custom-scrollbar h-full flex flex-col h-full p-2 ${locale === 'heb' ? 'pl-4' : 'pr-4'}`}>
            {summaries.slice(0, -1).map((summary, i) => (
                <div key={i} className={`${summary.id === activeSummaryId ? 'block' : 'hidden'} sm:block`}>
                    <Summary key={i} summary={summary} country={country} active={summary.id === activeSummaryId} locale={locale} />
                </div>
            ))}
            {lastSummary && (
                <div className='hidden sm:block'>
                    <Summary summary={lastSummary} country={country} active={lastSummary.id === activeSummaryId} locale={locale} yesterday={true} />
                </div>
            )}
        </div>
    )
}