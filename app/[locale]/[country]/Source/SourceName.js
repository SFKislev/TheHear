'use client'

import { Skeleton } from "@mui/material"
import CustomTooltip from "@/components/CustomTooltip"

export default function SourceName({ name, description, typography, date, isLoading, align = 'left' }) {
    const isPresent = date ? new Date() - date < 60 * 1000 * 5 : true
    const isRight = align === 'right';

    if (isLoading) {
        return (
            <div className={`flex items-center gap-2 flex-1 min-w-0 ${isRight ? 'justify-end' : ''}`}>
                <Skeleton 
                    variant="text" 
                    width={`${Math.floor(Math.random() * (80 - 40 + 1)) + 40}%`} 
                    height={typography?.fontFamily === 'var(--font-frank-re-tzar)' ? '2.1rem' : '1.5rem'}
                />
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 flex-1 min-w-0 ${isRight ? 'justify-end' : ''}`}>
            <CustomTooltip title={description} placement="top">
                <h2 className={`text-sm cursor-help w-full ${isRight ? 'text-right' : ''} ${isPresent ? 'text-blue' : 'text-gray-500'}`} style={{ 
                    ...typography, 
                    fontSize: typography.fontFamily === 'var(--font-frank-re-tzar)' ? '2.1rem' : '1.5rem' 
                }}>
                    {name}
                </h2>
            </CustomTooltip>
        </div>
    )
}
