'use client';

import { useEffect, useState } from "react";

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

function getSummaryCards() {
    return Array.from(document.querySelectorAll("[data-summary-card]"));
}

export default function FeedSummaryNav({ summaryId, locale, direction }) {
    const [hasPrevious, setHasPrevious] = useState(false);
    const [hasNext, setHasNext] = useState(false);

    useEffect(() => {
        const syncNavigation = () => {
            const summaryCards = getSummaryCards();
            const currentIndex = summaryCards.findIndex((card) => card.getAttribute("data-summary-id") === String(summaryId));

            if (currentIndex === -1) {
                setHasPrevious(false);
                setHasNext(false);
                return;
            }

            setHasPrevious(currentIndex > 0);
            setHasNext(currentIndex < summaryCards.length - 1);
        };

        syncNavigation();
        const timeoutId = setTimeout(syncNavigation, 100);

        return () => clearTimeout(timeoutId);
    }, [summaryId]);

    const scrollToOffset = (offset) => {
        const summaryCards = getSummaryCards();
        const currentIndex = summaryCards.findIndex((card) => card.getAttribute("data-summary-id") === String(summaryId));

        if (currentIndex === -1 || summaryCards.length === 0) return;

        const targetIndex = (currentIndex + offset + summaryCards.length) % summaryCards.length;
        const targetCard = summaryCards[targetIndex];

        if (targetCard) {
            targetCard.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    };

    if (direction === "previous") {
        return hasPrevious ? (
            <div className="flex justify-center mb-2 -mt-2">
                <button
                    onClick={() => scrollToOffset(-1)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                    title={locale === "heb" ? "גלול לסיכום הקודם" : "Scroll to previous summary"}
                    aria-label={locale === "heb" ? "גלול לסיכום הקודם" : "Scroll to previous summary"}
                >
                    {UP_SVG}
                </button>
            </div>
        ) : null;
    }

    return hasNext ? (
        <div className="flex justify-center mt-4 -mb-2">
            <button
                onClick={() => scrollToOffset(1)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                title={locale === "heb" ? "גלול לסיכום הבא" : "Scroll to next summary"}
                aria-label={locale === "heb" ? "גלול לסיכום הבא" : "Scroll to next summary"}
            >
                {DOWN_SVG}
            </button>
        </div>
    ) : null;
}
