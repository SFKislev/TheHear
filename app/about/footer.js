// SSR component - static footer content
export default function Footer() {
    return (
        <footer className="w-full bg-gray-100 py-3">
            <div className="w-full md:w-[70%] md:min-w-[800px] md:max-w-[1200px] mx-auto px-5">
                <div className="flex items-center gap-4 text-xs text-gray-600">
                    {/* Nonprofit Info */}
                    <span><span className="font-medium">The Hear</span> operates under a nonprofit organization</span>

                    {/* Desktop-only elements */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Vertical Divider */}
                        <div className="w-px h-4 bg-gray-300"></div>

                        {/* Contact Info */}
                        <a
                            href="mailto:info@the-hear.com"
                            className="text-blue-500 hover:text-blue-700"
                        >
                            info@the-hear.com
                        </a>

                        {/* Vertical Divider */}
                        <div className="w-px h-4 bg-gray-300"></div>

                        {/* Get Involved */}
                        <a
                            href="mailto:info@the-hear.com"
                            className="hover:text-blue border-b border-dotted border-gray-500 hover:border-blue text-blue"
                        >
                            Get Involved
                        </a>

                        {/* Vertical Divider */}
                        <div className="w-px h-4 bg-gray-300"></div>
                    </div>

                    {/* Year */}
                    <span>&copy; {new Date().getFullYear()}</span>
                </div>
            </div>
        </footer>
    );
} 