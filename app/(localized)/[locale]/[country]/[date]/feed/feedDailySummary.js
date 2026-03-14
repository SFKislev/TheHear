import { getHeadline, getSummaryParagraphs } from "@/utils/daily summary utils";

export default function FeedDailySummary({ locale, daySummary }) {
    if (!daySummary) return null;

    const formattedDate = new Date(daySummary.date)
        .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        })
        .replace(/\//g, ".");

    const headline = getHeadline(daySummary, locale);
    const summaryParagraphs = getSummaryParagraphs(daySummary, locale);
    const disclaimer = locale === "heb"
        ? "סקירה יומית זו נכתבה בידי בינה"
        : "This daily overview was written by an AI";

    return (
        <div className="bg-neutral-100 w-full rounded-sm">
            <div className="flex items-center justify-between relative px-6 pb-3 pt-5">
                <div className={`flex-1 ${locale === "heb" ? "frank-re text-right text-[17px]" : 'font-["Geist"] text-left text-base'} text-black font-medium`}>
                    <span className="font-mono text-base">{formattedDate}</span>
                    <span className="mx-1">{locale === "heb" ? " ⇠ " : " ⇢ "}</span>
                    <span style={{ lineHeight: "1.5rem" }}>{headline}</span>
                </div>
            </div>

            <div
                className={`px-6 pb-6 font-normal ${locale === "heb" ? "frank-re text-right text-base" : 'font-["Geist"] text-left text-sm'}`}
                style={{
                    lineHeight: "1.5"
                }}
            >
                <span
                    className={`${locale === "heb" ? "pl-2" : "pr-2"} align-middle cursor-help text-sm text-gray-600`}
                    tabIndex={0}
                    title={disclaimer}
                    aria-label={disclaimer}
                >
                    ⌨
                </span>
                {summaryParagraphs.map((paragraph, index) => (
                    <p
                        key={index}
                        className={index === 0 ? "inline" : "mt-4"}
                        style={{ marginBottom: 0 }}
                    >
                        {paragraph}
                    </p>
                ))}
            </div>
        </div>
    );
}
