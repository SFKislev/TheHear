// Chinese fonts reduced from 3 to 1 (Noto Sans SC only) to fix render-blocking CSS
// Removed: ZCOOL QingKe HuangYou, ZCOOL KuaiLe (175KB total)
export default function ChinaFonts() {
    return (
        <>
            <style>{`
                :root {
                    --font-noto-sc: 'Noto Sans SC', sans-serif;
                }
            `}</style>
        </>
    );
}

// Now using only Noto Sans SC with multiple weight/size variations for visual variety
export const Typography_China = [
    {
        fontFamily: '"Noto Sans SC", sans-serif',
        fontSize: '2.2rem',
        lineHeight: 1.15,
        fontWeight: 400,
        direction: 'ltr',
    },
    {
        fontFamily: '"Noto Sans SC", sans-serif',
        fontSize: '2.2rem',
        lineHeight: 1.15,
        fontWeight: 700,
        direction: 'ltr',
    },
    {
        fontFamily: '"Noto Sans SC", sans-serif',
        fontSize: '2.4rem',
        lineHeight: 1.1,
        fontWeight: 400,
        direction: 'ltr',
    },
    {
        fontFamily: '"Noto Sans SC", sans-serif',
        fontSize: '2.4rem',
        lineHeight: 1.1,
        fontWeight: 700,
        direction: 'ltr',
    },
    {
        fontFamily: '"Noto Sans SC", sans-serif',
        fontSize: '2.1rem',
        lineHeight: 1.2,
        fontWeight: 400,
        direction: 'ltr',
    },
    {
        fontFamily: '"Noto Sans SC", sans-serif',
        fontSize: '2.1rem',
        lineHeight: 1.2,
        fontWeight: 700,
        direction: 'ltr',
    }
]; 