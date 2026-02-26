import DynamicLogoSmall from "@/components/Logo-small";
import UniversalFooter from "@/components/UniversalFooter";
import ContactForm from "./ContactForm";
import { createMetadata, LdJson } from "./metadata";

export async function generateMetadata() {
    return createMetadata();
}

export const dynamic = "force-static";

export default function ContactPage() {
    return (
        <>
            <LdJson />
            <main
                className="min-h-screen flex items-center justify-center px-5 bg-white"
                style={{ paddingBottom: "var(--footer-offset, 3rem)" }}
            >
                <div className="w-full max-w-[600px]">
                    <div className="mb-3">
                        <DynamicLogoSmall locale="en" showDivider={false} alwaysVisible />
                    </div>
                    <h1 className="font-['Geist'] text-xl md:text-3xl text-black font-bold mb-6">Contact</h1>

                    <section className="mb-8">
                        <p className="font-['Geist'] text-xs text-gray-800 leading-6">
                            Use this form to contact <b>The Hear</b>. Feedback, queries, issue reports or rights-related requests are welcome. 
                        </p>
                    </section>

                    <section className="mb-4 border-t border-gray-300 pt-6">
                        <ContactForm />
                    </section>
                </div>
            </main>
            <UniversalFooter locale="en" pageType="about" />
        </>
    );
}
