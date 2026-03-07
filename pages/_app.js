import "@/app/globals.css";
import LazyAnalytics from "@/components/LazyAnalytics";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { fontVariables } from "@/app/fonts";
import EnglishFonts from "@/utils/typography/EnglishFonts";
import HebrewFonts from "@/utils/typography/HebrewFonts";

export default function App({ Component, pageProps }) {
    return (
        <div className={fontVariables}>
            <EnglishFonts />
            <HebrewFonts />
            <LazyAnalytics />
            <ServiceWorkerRegistration />
            <Component {...pageProps} />
        </div>
    );
}
