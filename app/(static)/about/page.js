import LandingPageContent from './LandingPage_content';
import TopBar from './TopBar';
import { createMetadata, LdJson } from './metadata';
import UniversalFooter from "@/components/UniversalFooter";

export async function generateMetadata() {
    return createMetadata();
}

// Force static generation with full HTML (not streaming)
export const dynamic = 'force-static';

export default function Page() {
    // Generate random seed for typography selection (static at build time)
    // Each build will have different typography, but it's consistent for all visitors until next build
    const randomSeed = Math.floor(Math.random() * 1000);

    return (
        <>
            {/* JSON-LD structured data for SEO */}
            <LdJson />

            {/* SSR page with proper links and content */}
            <div className="min-h-screen flex flex-col">
                <TopBar />
                <main className="flex-grow" style={{ paddingBottom: "var(--footer-offset, 3rem)" }}>
                    <LandingPageContent randomSeed={randomSeed} />
                </main>
                <UniversalFooter locale="en" pageType="about" />
            </div>
        </>
    );
} 
