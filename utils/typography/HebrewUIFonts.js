export default function HebrewUIFonts() {
    return (
        <>
            <link rel="preload" href="/fonts/frank-re-medium-aaa.otf" as="font" type="font/otf" crossOrigin="anonymous" />

            <style>{`
                :root {
                    --font-frank-re: 'FrankRe';
                }

                @font-face {
                    font-family: 'FrankRe';
                    src: url('/fonts/frank-re-medium-aaa.otf') format('opentype');
                    font-display: swap;
                }
            `}</style>
        </>
    );
}
