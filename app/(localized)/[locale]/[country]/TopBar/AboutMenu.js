import React, { useState } from 'react';
import Divider from '@mui/material/Divider';
import ReadMore from './ReadMore';
import { useParams } from 'next/navigation';
import PopUpCleaner from '@/components/PopUp';

export default function AboutMenu({ open, onClose }){
    const { locale } = useParams()
    const [expanded, setExpanded] = useState(false);
    const shortText = `<strong class="font-medium">The Hear</strong> is a news observatory and archive. </br>It displays the main headlines of many newspapers, side by side, unfiltered and in real time.
  </br>`;

    if (!open) return null;

    const handleClose = () => {
        setExpanded(false);
        if (onClose) onClose();
    };

    const handleModalClick = () => {
        window.open('/about', '_blank');
    };

    return (
        <>
            <PopUpCleaner open={open} close={handleClose} />
            <div
                className={`fixed inset-0 flex items-center justify-center z-[9999] direction-ltr bg-black/20`}
                onClick={handleClose}
            >
                <div 
                    className="w-[400px] bg-white p-6 max-h-[80vh] overflow-auto shadow-xl border border-gray-100 rounded-xs cursor-pointer"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d1d5db transparent'
                    }}
                    onClick={handleModalClick}
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
                    <Divider className="w-full" />
                    <ReadMore expanded={expanded} onToggle={() => setExpanded(!expanded)} />
                </div>
            </div>
        </>
    );
};