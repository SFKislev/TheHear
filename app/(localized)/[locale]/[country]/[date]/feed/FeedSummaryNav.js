'use client';

const UP_SVG = (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="18,15 12,9 6,15"></polyline>
    </svg>
);

const DOWN_SVG = (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="6,9 12,15 18,9"></polyline>
    </svg>
);

export default function FeedSummaryNav({ targetSummaryId, locale, direction }) {
    if (!targetSummaryId) return null;

    const href = `#summary-${targetSummaryId}`;
    const title = locale === "heb"
        ? (direction === "previous" ? "גלול לסיכום הקודם" : "גלול לסיכום הבא")
        : (direction === "previous" ? "Scroll to previous summary" : "Scroll to next summary");

    const handleClick = (event) => {
        const target = document.getElementById(`summary-${targetSummaryId}`);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    };

    if (direction === "previous") {
        return (
            <div className="flex justify-center mb-2 -mt-2">
                <a
                    href={href}
                    onClick={handleClick}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                    title={title}
                    aria-label={title}
                >
                    {UP_SVG}
                </a>
            </div>
        );
    }

    return (
        <div className="flex justify-center mt-4 -mb-2">
            <a
                href={href}
                onClick={handleClick}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                title={title}
                aria-label={title}
            >
                {DOWN_SVG}
            </a>
        </div>
    );
}
