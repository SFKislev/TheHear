import Document, { Head, Html, Main, NextScript } from "next/document";
import { fontVariables } from "@/app/fonts";

function getLocaleAttributes(pathname) {
    if (pathname.startsWith("/heb/")) {
        return { lang: "he", dir: "rtl" };
    }

    return { lang: "en", dir: "ltr" };
}

export default class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx);
        const pathname = ctx.req?.url || "";
        const { lang, dir } = getLocaleAttributes(pathname);

        return {
            ...initialProps,
            htmlLang: lang,
            htmlDir: dir
        };
    }

    render() {
        return (
            <Html lang={this.props.htmlLang} dir={this.props.htmlDir} className={fontVariables}>
                <Head>
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "Organization",
                                url: "https://www.thehear.org",
                                logo: "https://www.thehear.org/RoundLogo-S.png"
                            })
                        }}
                    />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
