import Head from "next/head";
import FeedFonts from "@/app/(localized)/[locale]/[country]/[date]/feed/FeedFonts";
import FeedFooter from "@/app/(localized)/[locale]/[country]/[date]/feed/FeedFooter";
import FeedJsonLd from "@/app/(localized)/[locale]/[country]/[date]/feed/FeedJsonLd";
import FeedPopup from "@/app/(localized)/[locale]/[country]/[date]/feed/popup";
import FeedView from "@/app/(localized)/[locale]/[country]/[date]/feed/FeedView";
import { FEED_REVALIDATE_SECONDS, buildFeedMetadata, getFeedPageData, getFeedUrl } from "@/utils/feedPage";
import { countries } from "@/utils/sources/countries";

function toDate(value) {
    return value ? new Date(value) : null;
}

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: "blocking"
    };
}

export async function getStaticProps({ params }) {
    const { locale, country, date } = params;

    if (!(locale === "en" || locale === "heb") || !countries[country]) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            },
            revalidate: FEED_REVALIDATE_SECONDS
        };
    }

    const feedData = await getFeedPageData({ locale, country, date });

    if (feedData.redirect) {
        return {
            redirect: {
                destination: feedData.redirect,
                permanent: false
            },
            revalidate: FEED_REVALIDATE_SECONDS
        };
    }

    return {
        props: feedData,
        revalidate: FEED_REVALIDATE_SECONDS
    };
}

export default function FeedPage(props) {
    const parsedDate = toDate(props.parsedDate);
    const daySummary = props.daySummary;
    const metadata = buildFeedMetadata({
        locale: props.locale,
        country: props.country,
        date: props.date,
        daySummary
    });
    const localeCode = props.locale === "heb" ? "he_IL" : "en_US";
    const canonicalUrl = getFeedUrl(props.locale, props.country, props.date);

    return (
        <>
            <Head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
                <meta name="robots" content="index, follow" />
                <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
                <link rel="canonical" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en" href={getFeedUrl("en", props.country, props.date)} />
                <link rel="alternate" hrefLang="he" href={getFeedUrl("heb", props.country, props.date)} />
                <link rel="alternate" hrefLang="x-default" href={getFeedUrl("en", props.country, props.date)} />
                <meta property="og:title" content={metadata.title} />
                <meta property="og:description" content={metadata.description} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content="The Hear" />
                <meta property="og:locale" content={localeCode} />
                <meta property="og:image" content="https://www.thehear.org/logo192.png" />
                <meta property="og:image:width" content="192" />
                <meta property="og:image:height" content="192" />
                <meta property="og:image:alt" content="The Hear logo" />
                <meta property="og:type" content="article" />
                <meta property="article:published_time" content={parsedDate.toISOString()} />
                <meta property="article:modified_time" content={parsedDate.toISOString()} />
                <meta property="article:author" content="The Hear" />
                <meta property="article:section" content="News Archive" />
                <meta property="article:tag" content={countries[props.country]?.english || props.country} />
                <meta property="article:tag" content="news" />
                <meta property="article:tag" content="headlines" />
                <meta property="article:tag" content={props.date.replace(/-/g, ".")} />
                <meta property="article:tag" content="archive" />
                <meta property="article:tag" content="chronological" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@thehearnews" />
                <meta name="twitter:creator" content="@thehearnews" />
                <meta name="twitter:title" content={metadata.title} />
                <meta name="twitter:description" content={metadata.description} />
                <meta name="twitter:image" content="https://www.thehear.org/logo512.png" />
            </Head>

            <div className="min-h-screen bg-gray-50 pb-4">
                <FeedFonts country={props.country} />
                <FeedJsonLd
                    country={props.country}
                    locale={props.locale}
                    date={parsedDate}
                    daySummary={daySummary}
                    headlines={props.headlines}
                    initialSummaries={props.initialSummaries}
                />
                <FeedView
                    headlines={props.headlines}
                    initialSummaries={props.initialSummaries}
                    daySummary={daySummary}
                    locale={props.locale}
                    country={props.country}
                    date={parsedDate}
                    countryTimezone={props.countryTimezone}
                    isMobile={false}
                    footer={<FeedFooter locale={props.locale} country={props.country} date={parsedDate} />}
                />
                <FeedPopup country={props.country} locale={props.locale} pageDate={parsedDate} />
            </div>
        </>
    );
}
