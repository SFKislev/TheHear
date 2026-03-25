import { checkRTL } from "@/utils/utils";
import { useEffect, useMemo, useRef, useState } from "react";

function TranslationSkeleton({ skeletonIsRTL = false }) {
    const directionClassName = skeletonIsRTL ? 'skeleton-origin-rtl' : 'skeleton-origin-ltr';

    return (
        <div className="space-y-1.5 pt-0.5">
            <div className={`h-[1.05rem] rounded-sm bg-neutral-200/90 animate-skeleton-width ${directionClassName}`} style={{ width: '90%' }} />
            <div className={`h-[1.05rem] rounded-sm bg-neutral-200/90 animate-skeleton-width animation-delay-100 ${directionClassName}`} style={{ width: '78%' }} />
            <div className={`h-[1.05rem] rounded-sm bg-neutral-200/90 animate-skeleton-width animation-delay-200 ${directionClassName}`} style={{ width: '64%' }} />
        </div>
    );
}

export default function Headline({ headline, typography, isLoading, isPresent, skeletonIsRTL = false }) {
    const [animationDuration, setAnimationDuration] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const prevTextRef = useRef(null);
    const hasMountedRef = useRef(false);
    const animationTimerRef = useRef(null);
    const textSignature = useMemo(() => {
        if (!headline) return '';
        return String(headline.headline || '').trim();
    }, [headline]);

    // Generate random animation duration only when displayed headline text changes.
    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            prevTextRef.current = textSignature;
            return;
        }

        if (textSignature && textSignature !== prevTextRef.current) {
            prevTextRef.current = textSignature;
            // Red-to-black fade duration (0.7-3.2 seconds)
            const randomDuration = Math.random() * 2.5 + 0.7;
            setAnimationDuration(randomDuration);
            setIsAnimating(true);
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
            }
            animationTimerRef.current = setTimeout(() => {
                setIsAnimating(false);
            }, randomDuration * 1000);
        }
    }, [textSignature]);

    useEffect(() => {
        return () => {
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
            }
        };
    }, []);

    if (isLoading) {
        return <TranslationSkeleton skeletonIsRTL={skeletonIsRTL} />;
    }

    if (!headline.headline || headline.headline == '') return null;
    const txt = headline.headline;
    const isRTL = checkRTL(txt);
    
    // Check if link points to our own domain - if so, don't make it clickable
    const isInternalLink = headline.link && (
        headline.link.includes('thehear.org') || 
        headline.link.includes('www.thehear.org') ||
        headline.link.startsWith('/') // Relative URLs
    );
    
    const headlineContent = (
        <div className="relative">
            <h3
                className={`${isAnimating ? 'animate-headline' : ''} w-full text-lg font-semibold break-words line-clamp-6`}
                style={{ 
                    ...typography, 
                    width: '100%', 
                    direction: isRTL ? 'rtl' : 'ltr',
                    animationDuration: isAnimating && animationDuration ? `${animationDuration}s` : '0s'
                }}
            >
                {txt}
            </h3>
        </div>
    );
    
    // Only wrap in link if it's a valid external URL
    if (headline.link && !isInternalLink) {
        return (
            <a href={headline.link} target="_blank" rel="noopener noreferrer">
                {headlineContent}
            </a>
        );
    }
    
    // Return headline without link if no valid external URL
    return headlineContent;
}
