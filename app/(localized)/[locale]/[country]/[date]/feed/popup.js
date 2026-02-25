'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InnerLink from '@/components/InnerLink';
import PopUpCleaner from '@/components/PopUp';
import { countries } from '@/utils/sources/countries';
import { format, isToday } from 'date-fns';

export default function FeedPopup({ openAbout, country, locale, pageDate }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Show on every page load
        setOpen(true);
    }, []);

    if (!open) return null;

    // Always use English country name, but use 'the US' for 'us'
    let countryName = countries[country]?.english || country;
    if (country === 'us') countryName = 'the US';
    let shortText;
    if (pageDate && !isToday(pageDate)) {
        const formattedDate = format(pageDate, 'MMMM d, yyyy');
        shortText = `<span class="font-medium">the Hear</span> is an unfiltered news observatory. <br/><br/> This page is an archive of the main headlines of many newspapers from ${countryName} on <span class="font-medium">${formattedDate}</span>. <br/> This archive is best viewed with the time-machine interface, <span style="color:rgb(0, 0, 255);">here</span>.`;
    } else {
        shortText = `<span class="font-medium">the Hear</span> is an unfiltered news observatory. <br/><br/> These are the current main headlines of many newspapers from ${countryName}. This archive is best viewed with the time-machine interface, here.`;
    }

    const handleClose = () => {
        setOpen(false);
    };

    const handleContentClick = () => {
        // Navigate to the parent page (time machine view) using InnerLink
        const formattedDate = `${pageDate.getDate().toString().padStart(2, '0')}-${String(pageDate.getMonth() + 1).padStart(2, '0')}-${pageDate.getFullYear()}`;
        return `/${locale}/${country}/${formattedDate}`;
    };

    const handleReadMore = () => {
        setOpen(false);
        if (openAbout) openAbout();
    };

    return (
        <>
            <PopUpCleaner close={handleClose} />
            <div
                className={`fixed inset-0 flex items-center justify-center z-[1000] direction-ltr bg-black/20 px-4 md:px-0`}
                onClick={handleClose}
            >
                <div onClick={e => e.stopPropagation()}>
                    <InnerLink href={handleContentClick()} locale={locale}>
                        <div
                            className="w-full max-w-[400px] bg-white p-6 max-h-[80vh] overflow-auto shadow-xl border border-gray-100 rounded-xs cursor-pointer"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#d1d5db transparent'
                            }}
                        >
                    <div className="font-['Geist'] text-sm leading-6 mb-4" dangerouslySetInnerHTML={{ __html: shortText }} />
                    <video
                        className="w-full mb-4 rounded-sm"
                        autoPlay
                        loop
                        muted
                        preload="metadata"
                    >
                        <source src="/landing/TheHear-Scroll-11s-700px.webm" type="video/webm" />
                        Your browser does not support the video tag.
                    </video>
                        </div>
                    </InnerLink>
                </div>
            </div>
        </>
    );
}
