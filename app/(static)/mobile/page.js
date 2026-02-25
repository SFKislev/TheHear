'use client';

import React from 'react';
import FlagIcon from "@/components/FlagIcon";
import { countries } from "@/utils/sources/countries";
import DynamicLogo from "@/components/Logo";
import InnerLink from '@/components/InnerLink';

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-white p-4">
      {/* Logo */}
      <div className="flex justify-center mb-0 pt-2 mobile-logo-always-hover">
        <DynamicLogo locale="en" />
      </div>

      {/* Title */}
      <div className="text-center mb-2">
        <h1 className="text-default font-medium text-gray-800 mb-0">
          {/* <span className="text-gray-800">The Hear</span> */}
        </h1>
        <p className="text-xs text-gray-800">
          Real-time newspaper headlines, side by side
        </p>
      </div>

      {/* Countries Grid */}
                    <div className="flex justify-center">
                   <div className="grid grid-cols-2 gap-[1px] bg-gray-200 rounded-xs overflow-hidden border border-gray-200 shadow-2xl !w-[250px]" style={{width: '240px'}}>
          {Object.entries(countries).map(([id, country]) => (
            <InnerLink
              key={id}
              href={id.toLowerCase() === 'uk' ? '/en/uk' : `/en/${id}`}
              locale="en"
            >
              <div className="flex justify-start items-center gap-2 px-3 py-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                <FlagIcon country={id} />
                                 <span className="text-xs">{country.english}</span>
              </div>
            </InnerLink>
          ))}
          {/* Add empty white cell if odd number of countries */}
          {Object.keys(countries).length % 2 !== 0 && (
            <div className="bg-white"></div>
          )}
        </div>
        

      </div>
      
      {/* Add CSS to make logo always appear hovered */}
      <style jsx global>{`
        .mobile-logo-always-hover .logo-hover-container .logo-background {
          opacity: 1 !important;
        }
        .mobile-logo-always-hover .logo-hover-container .logo-text-right {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
} 