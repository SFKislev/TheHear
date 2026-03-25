import { checkRTL } from "@/utils/utils";

export default function Subtitle({headlineData, isLoading, skeletonIsRTL = false}) {
    const directionClassName = skeletonIsRTL ? 'skeleton-origin-rtl' : 'skeleton-origin-ltr';

    if (isLoading) {
        return (
            <div className="px-4 pb-3 pt-0.5">
                <div className={`h-[0.7rem] rounded-sm bg-neutral-200/80 animate-skeleton-width animation-delay-150 ${directionClassName}`} style={{ width: '42%' }} />
            </div>
        );
    }

    if (!headlineData || !headlineData.subtitle) return null;
    
    if (headlineData.subtitle == '') return (
        <div className="px-4 pb-3 pt-0.5">
            <div className={`h-[0.7rem] rounded-sm bg-neutral-200/80 animate-skeleton-width animation-delay-150 ${directionClassName}`} style={{ width: '42%' }} />
        </div>
    );
    
    const isRTL = checkRTL(headlineData.subtitle);
    
    return (
        <div className={`px-4 pb-2 ${isRTL ? 'text-right' : 'text-left'}`} style={{ fontSize: '0.8rem' }}>
            {headlineData.subtitle || ''}
        </div>
    );
}
