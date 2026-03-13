import "@/app/globals.css";
import LazyAnalytics from "@/components/LazyAnalytics";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { fontVariables } from "@/app/baseFonts";
import EnglishFonts from "@/utils/typography/EnglishFonts";

export default function App({ Component, pageProps }) {
    return (
        <div className={fontVariables}>
            <EnglishFonts />
            <LazyAnalytics />
            <ServiceWorkerRegistration />
            <Component {...pageProps} />
        </div>
    );
}
