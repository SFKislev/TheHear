export default function HebrewFonts() {
    return (
        <>
            {/* Preload fonts */}
            <link rel="preload" href="/fonts/frank-re-medium-aaa.otf" as="font" type="font/otf" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/TelAviv-ModernistBold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/frank-re-tzar-regular-aaa.otf" as="font" type="font/otf" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/Mandatory-18.otf" as="font" type="font/otf" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/Mandatory-29.otf" as="font" type="font/otf" crossOrigin="anonymous" />
            
            <style>{`
                :root {
                    --font-tel-aviv: 'TelAviv';
                    --font-frank-re-tzar: 'FrankReTzar';
                    --font-frank-re: 'FrankRe';
                    --font-mandatory: 'Mandatory';
                    --font-mandatory29: 'Mandatory29';
                }
                @font-face {
                    font-family: 'TelAviv';
                    src: url('/fonts/TelAviv-ModernistBold.ttf') format('truetype');
                    font-display: swap;
                }
                @font-face {
                    font-family: 'FrankReTzar';
                    src: url('/fonts/frank-re-tzar-regular-aaa.otf') format('opentype');
                    font-display: swap;
                }
                @font-face {
                    font-family: 'FrankRe';
                    src: url('/fonts/frank-re-medium-aaa.otf') format('opentype');
                    font-display: swap;
                }
                @font-face {
                    font-family: 'Mandatory';
                    src: url('/fonts/Mandatory-18.otf') format('opentype');
                    font-display: swap;
                }
                @font-face {
                    font-family: 'Mandatory29';
                    src: url('/fonts/Mandatory-29.otf') format('opentype');
                    font-display: swap;
                }
            `}</style>
        </>
    );
}

export const Typography_Hebrew = [
    {
        fontFamily: 'var(--font-frank-re)',
        fontSize: "2.4rem",
        lineHeight: 1.1,
        fontWeight: 400,
        direction: 'rtl',
    },
    {
        fontFamily: 'var(--font-tel-aviv)',
        fontSize: '2.1rem',
        lineHeight: 1.15,
        fontWeight: 400,
        direction: 'rtl',
    },
    {
        fontFamily: 'var(--font-frank-re-tzar)',
        fontSize: '3.6rem',
        lineHeight: 1,
        fontWeight: 400,
        direction: 'rtl',
    },
    {
        fontFamily: 'var(--font-mandatory)',
        fontSize: "2.3rem",
        lineHeight: 1.2,
        fontWeight: 400,
        direction: 'rtl',
    },
    {
        fontFamily: 'var(--font-mandatory29)',
        fontSize: "2.8rem",
        lineHeight: 1.2,
        fontWeight: 400,
        direction: 'rtl',
    },
];