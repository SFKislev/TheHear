'use client'

import { useState } from 'react';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Collapse, IconButton } from '@mui/material';
import { getHeadline, getSummaryContent } from '@/utils/daily summary utils';
import CustomTooltip from '@/components/CustomTooltip';

export default function DailySummary({ locale, daySummary }) {
    const [expanded, setExpanded] = useState(false);
    if (!daySummary) return null;

    // Format date as dd.mm.yyyy
    const formattedDate = new Date(daySummary.date)
        .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
        .replace(/\//g, '.');

    const headline = getHeadline(daySummary, locale);
    const summaryContent = getSummaryContent(daySummary, locale);

    const disclaimer = locale === 'heb' ? 'סקירה יומית זו נכתבה בידי בינה' : 'This daily overview was written by an AI';
    return (
        <div className="bg-neutral-100 w-full rounded-sm hover:shadow-xl">
            <div 
                className='flex items-center justify-between relative cursor-pointer p-4' 
                onClick={() => setExpanded(!expanded)}
            >
                <h2 className={`flex-1 ${locale === 'heb' ? 'frank-re text-right text-[17px]' : 'font-["Geist"] text-left text-base'} text-black font-medium`}>
                    <span className="font-['GeistMono'] text-base">{formattedDate}</span>
                    <span className="mx-1">{locale == 'heb' ? ' ⇠ ' : ' ⇢ '}</span>
                    <span style={{ lineHeight: '1.5rem' }}>{headline}</span>
                </h2>
                <IconButton size="small" className="ml-2 self-center animate-pulse">
                    {expanded ? 
                        <KeyboardArrowUp sx={{ color: 'black' }} /> : 
                        <KeyboardArrowDown sx={{ color: 'black' }} />
                    }
                </IconButton>
            </div>
            <Collapse in={expanded}>
                <div 
                    className={`px-4 custom-scrollbar font-normal pb-6 ${locale === 'heb' ? 'frank-re text-right text-base' : 'font-["Geist"] text-left text-sm'}`} 
                    style={{ 
                        lineHeight: '1.5',
                        maxHeight: '45vh',
                        overflowY: 'auto'
                    }}
                >
                    <CustomTooltip title={disclaimer} placement={locale === 'heb' ? 'left' : 'right'}>
                        <span className={`${locale === 'heb' ? 'pl-2' : 'pr-2'} align-middle cursor-help text-sm text-gray-600`} tabIndex={0}>⌨</span>
                    </CustomTooltip>
                    <span dangerouslySetInnerHTML={{ __html: summaryContent }} />
                </div>
            </Collapse>
        </div>
    );
}
