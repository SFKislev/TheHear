'use client'

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import logoA from './logo/thehear-round.webp';
import logoB from './logo/thehear-round.webp';
import logoC from './logo/thehear-round.webp';
import Image from 'next/image';
import InnerLink from './InnerLink';

export default function DynamicLogoSmall({ locale, showDivider = true, mobileReducedPadding = false }) {
    const [isFakeHover, setIsFakeHover] = useState(false);

    // Add fake hover effect every 30 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            setIsFakeHover(true);

            const timeoutId = setTimeout(() => {
                setIsFakeHover(false);
            }, 5000); // Reset after 5 seconds

            return () => clearTimeout(timeoutId);
        }, 18000); // Trigger every 18 seconds (reduced from 30 seconds)

        // This return function is for the useEffect cleanup, not for the interval callback
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <div className={`logo-hover-container flex items-center justify-center relative ${mobileReducedPadding ? 'pt-2' : 'pt-8'} ${isFakeHover ? 'fake-hover' : ''}`}>
                <div className="logo-background absolute top-[62%] left-1/2 w-[210px] h-[40%] bg-[#EBEBEB] opacity-0 transform translate-y-[-50%] translate-x-[-50%] shadow-xl"
                    style={{
                        transition: 'opacity 0.2s ease',
                        transitionDelay: '.8s',
                        marginLeft: '8px',
                    }}
                />

                <div className="logo-text-right absolute left-1/2 top-[50%] pt-8 transform translate-y-[-50%] font-serif text-2xl text-black z-10 opacity-0 transition-opacity duration-100 delay-50 pointer-events-none"
                    style={{
                        fontFamily: 'CheltenhamCondensed, serif',
                        fontSize: '2rem',
                        transform: `translateX(-88px) translateY(-50%)`,
                    }}>
                    THE
                </div>

                <InnerLink locale={locale} href={`/${locale}/global`} className=''>
                    <Image className={`relative z-20 h-[85px] ${locale === 'heb' ? 'scale-x-[1]' : 'scale-x-[-1]'} object-contain pb-2 cursor-pointer`}
                        width="auto"
                        src={logoA} alt="The Hear Logo" />
                </InnerLink>

                <div className="logo-text-right pt-8 absolute left-1/2 top-[50%] transform translate-y-[-50%] font-serif text-2xl text-black z-10 opacity-0 transition-opacity duration-100 delay-500 pointer-events-none"
                    style={{
                        fontFamily: 'CheltenhamCondensed, serif',
                        fontSize: '2rem',
                        transition: 'opacity 0.1s ease',
                        transitionDelay: '0.5s',
                        transform: `translateX(48px) translateY(-50%)`,
                    }}>
                    HEAR
                </div>
            </div>
            {showDivider && (
                <div className="w-[75%] mx-auto border-b border-gray-300 mt-4" style={{height: '1px'}} />
            )}
        </>
    );
};