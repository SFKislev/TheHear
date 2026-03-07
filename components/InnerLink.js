'use client'

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { LinearProgress } from "@mui/material";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useRouter as useCompatRouter } from "next/compat/router";
import { trackEngagedUser, hasNavigatedAway } from "@/utils/analytics";

export default function InnerLink({ href, locale, children, prefetch, className }) {
    const [showProgress, setShowProgress] = useState(false);
    const pathname = usePathname();
    const compatRouter = useCompatRouter();
    const timeoutRef = useRef(null);
    const initialPathnameRef = useRef(pathname || compatRouter?.asPath || "");

    const currentPath = pathname || compatRouter?.asPath || compatRouter?.pathname || initialPathnameRef.current;

    useEffect(() => {
        if (showProgress) {
            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set a timeout to hide the progress bar after 3 seconds as a fallback
            // This prevents it from getting stuck indefinitely
            timeoutRef.current = setTimeout(() => {
                setShowProgress(false);
            }, 3000);

            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }
    }, [showProgress]);

    // Hide progress bar when App Router pathname changes.
    useEffect(() => {
        if (showProgress && pathname && pathname !== initialPathnameRef.current) {
            const hideTimeout = setTimeout(() => {
                setShowProgress(false);
            }, 200);

            return () => clearTimeout(hideTimeout);
        }
    }, [pathname, showProgress]);

    // Hide progress bar when Pages Router navigation completes.
    useEffect(() => {
        if (!compatRouter?.events) return undefined;

        const hideProgress = () => {
            setShowProgress(false);
        };

        compatRouter.events.on("routeChangeComplete", hideProgress);
        compatRouter.events.on("routeChangeError", hideProgress);

        return () => {
            compatRouter.events.off("routeChangeComplete", hideProgress);
            compatRouter.events.off("routeChangeError", hideProgress);
        };
    }, [compatRouter]);

    const handleClick = () => {
        // Track navigation if user is moving to a different page from their entry page
        if (hasNavigatedAway(href)) {
            trackEngagedUser('page_navigation', {
                from: currentPath,
                to: href,
                locale: locale || 'unknown'
            });
        }

        // Don't prevent default - let Next.js handle the navigation
        initialPathnameRef.current = currentPath;
        setShowProgress(true);
    };

    return (
        <>
            <span onClickCapture={handleClick} className={className || "cursor-pointer inline-block"}>
                <Link href={href} hrefLang={locale} prefetch={prefetch}>
                    {children}
                </Link>
            </span>
            {showProgress && typeof window !== 'undefined' && createPortal(
                <div className="fixed inset-0 w-full h-full z-[9999] pointer-events-none">
                    <div className="absolute inset-0 bg-white bg-opacity-40 animate-pulse transition-all duration-200" />
                    <div className="fixed top-0 left-0 w-full">
                        <LinearProgress color="inherit" sx={{ opacity: 0.8, backgroundColor: 'white', height: '2px' }} />
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
