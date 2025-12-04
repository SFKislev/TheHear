export default function EnglishFonts() {
    return (
        <>
            {/* Preload critical fonts for better performance */}
            <link rel="preload" href="/fonts/Futura_PT_Medium.otf" as="font" type="font/otf" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/Futura_PT_Bold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/FuturaPT-bold-italic.otf" as="font" type="font/otf" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/Plantin Bold Condensed.otf" as="font" type="font/otf" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/cheltenham-cond-normal-700.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
            <link rel="preload" href="/fonts/helvetica-bold.otf" as="font" type="font/otf" crossOrigin="anonymous" />

            <style>{`
				:root {
					--font-futura: 'Futura PT', sans-serif;
					--font-futura-italic: 'Futura PT', sans-serif;
					--font-futura-bold: 'Futura PT', sans-serif;
					--font-helvetica: 'Helvetica-Bold', Arial, sans-serif;
                    --font-cheltenham: 'Cheltenham', serif;
					--font-plantin-condensed: 'Plantin Condensed', serif;
				}

                /* Futura PT - Medium (500) */
                @font-face {
                    font-family: 'Futura PT';
                    src: url('/fonts/Futura_PT_Medium.otf') format('opentype');
                    font-weight: 500;
                    font-style: normal;
                    font-display: swap;
                }

                /* Futura PT - Bold (700) */
                @font-face {
                    font-family: 'Futura PT';
                    src: url('/fonts/Futura_PT_Bold.otf') format('opentype');
                    font-weight: 700;
                    font-style: normal;
                    font-display: swap;
                }

                /* Futura PT - Bold Italic (700) */
                @font-face {
                    font-family: 'Futura PT';
                    src: url('/fonts/FuturaPT-bold-italic.otf') format('opentype');
                    font-weight: 700;
                    font-style: italic;
                    font-display: swap;
                }

                /* Plantin Condensed - Bold (700) */
                @font-face {
                    font-family: 'Plantin Condensed';
                    src: url('/fonts/Plantin Bold Condensed.otf') format('opentype');
                    font-weight: 700;
                    font-style: normal;
                    font-display: swap;
                }

                @font-face {
                    font-family: 'Cheltenham';
                    src: url('/fonts/cheltenham-cond-normal-700.ttf') format('truetype');
                    font-weight: 700;
                    font-style: normal;
                    font-display: swap;
                }

                @font-face {
                    font-family: 'Helvetica-Bold';
                    src: url('/fonts/helvetica-bold.otf') format('opentype');
                    font-weight: 700;
                    font-style: normal;
                    font-display: swap;
                }
			`}</style>
        </>
    );
}

export const Typography_English = [
    {
        fontFamily: 'var(--font-futura)',
        fontSize: '2.5rem',
        lineHeight: 1.15,
        fontWeight: 500,
        direction: 'ltr',
    },
    {
        fontFamily: 'var(--font-futura-italic)',
        fontSize: '2.1rem',
        lineHeight: 1.15,
        fontWeight: 400,
        fontStyle: 'italic',
        direction: 'ltr',
    },
    {
        fontFamily: 'var(--font-futura-bold)',
        fontSize: '2.3rem',
        lineHeight: 1.15,
        fontWeight: 700,
        direction: 'ltr',
    },
    {
        fontFamily: 'var(--font-plantin-condensed)',
        fontSize: '2.3rem',
        lineHeight: 1.1,
        fontWeight: 400,
        direction: 'ltr',
    },
    {
        fontFamily: 'var(--font-helvetica)',
        fontSize: '2.1rem',
        lineHeight: 1.2,
        fontWeight: 700,
        direction: 'ltr',
    },
    {
        fontFamily: 'var(--font-cheltenham)',
        fontSize: '2.8rem',
        lineHeight: 1.1,
        fontWeight: 700,
        direction: 'ltr',
    },
];
