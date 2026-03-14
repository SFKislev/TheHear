'use client'

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter as useCompatRouter } from "next/compat/router";

export default function InnerLink({ href, locale, children, prefetch, className }) {
    const [showProgress, setShowProgress] = useState(false);
    const timeoutRef = useRef(null);
    const pathname = usePathname();
    const compatRouter = useCompatRouter();
    const initialPathnameRef = useRef(pathname || compatRouter?.asPath || "");

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (showProgress && pathname && pathname !== initialPathnameRef.current) {
            const hideTimeout = setTimeout(() => {
                setShowProgress(false);
            }, 120);

            return () => clearTimeout(hideTimeout);
        }
    }, [pathname, showProgress]);

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
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        initialPathnameRef.current = pathname || compatRouter?.asPath || compatRouter?.pathname || "";
        setShowProgress(true);
        timeoutRef.current = setTimeout(() => {
            setShowProgress(false);
        }, 4000);
    };

    return (
        <>
            <span onClickCapture={handleClick} className={className || "cursor-pointer inline-block"}>
                <Link href={href} hrefLang={locale} prefetch={prefetch}>
                    {children}
                </Link>
            </span>
            {showProgress ? (
                <div className="fixed inset-0 z-[9999] pointer-events-none">
                    <div className="absolute inset-0 bg-white/35 animate-pulse" />
                    <div className="absolute inset-x-0 top-0">
                        <div className="h-[2px] w-full overflow-hidden bg-white/50">
                            <div className="h-full w-full origin-left animate-[inner-link-progress_1.4s_ease-out_infinite] bg-neutral-700" />
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
