// Japanese fonts reduced from 6 to 1 (Noto Sans JP only) to fix 291KB render-blocking CSS
// Removed: RocknRoll One, Sawarabi Gothic, Potta One, Kiwi Maru, Dela Gothic One
export default function JapaneseFonts() {
    return (
        <>
            <style>{`
                :root {
                    --font-noto-jp: 'Noto Sans JP', sans-serif;
                }
            `}</style>
        </>
    );
}

// Now using only Noto Sans JP with multiple weight variations for visual variety
export const Typography_Japanese = [
    {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: '2.2rem',
        lineHeight: 1.15,
        fontWeight: 400,
        direction: 'ltr',
    },
    {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: '2.2rem',
        lineHeight: 1.15,
        fontWeight: 700,
        direction: 'ltr',
    },
    {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: '2.1rem',
        lineHeight: 1.2,
        fontWeight: 400,
        direction: 'ltr',
    },
    {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: '2.1rem',
        lineHeight: 1.2,
        fontWeight: 700,
        direction: 'ltr',
    },
    {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: '2.3rem',
        lineHeight: 1.1,
        fontWeight: 400,
        direction: 'ltr',
    },
    {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: '2.3rem',
        lineHeight: 1.1,
        fontWeight: 700,
        direction: 'ltr',
    }
]; 