import { checkRTL } from "@/utils/utils";
import { Skeleton } from "@mui/material";

export default function Subtitle({headlineData, isLoading}) {

    if (isLoading) {
        return (
            <div className="px-4 pb-6">
                <Skeleton variant="text" width={`${Math.floor(Math.random() * (50 - 10 + 1)) + 10}%`} />
            </div>
        );
    }

    if (!headlineData || !headlineData.subtitle) return null;
    
    if (headlineData.subtitle == '') return (
        <div className="px-4 pb-6">
            <Skeleton variant="text" width={`${Math.floor(Math.random() * (50 - 10 + 1)) + 10}%`} />
        </div>
    );
    
    const isRTL = checkRTL(headlineData.subtitle);
    
    return (
        <div className={`px-4 pb-2 ${isRTL ? 'text-right' : 'text-left'}`} style={{ fontSize: '0.8rem' }}>
            {headlineData.subtitle || ''}
        </div>
    );
}