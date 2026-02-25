'use client';

import React, { useState, useEffect } from 'react';
import FlagIcon from "@/components/FlagIcon";
import useLandingHeadlines from './useLandingHeadlines';

export function RandomSampleCards() {
  const { headlines, refreshHeadlines } = useLandingHeadlines()

  useEffect(() => {
    const interval = setInterval(refreshHeadlines, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <>
      {headlines.map(({headlineData, country, source}, index) => (
        <div className="fade-in md:col-span-4" key={country + '-' + source}>
          <div 
            className={`transition-opacity duration-500`}
          >
            <div className="h-full bg-white rounded-lg shadow-sm p-4 flex flex-col justify-between">
              <div>
                <h3 
                  className="text-lg font-medium text-blue-600 mb-2"
                  style={{
                    fontFamily: 'var(--font-cheltenham)',
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    color: 'blue'
                  }}
                >
                  {source}
                </h3>
                <p 
                  className="text-xl mb-4"
                  style={{
                    fontFamily: 'var(--font-cheltenham)',
                    fontSize: '2rem',
                    // fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {headlineData.headline}
                </p>
              </div>
              
              <div className="flex items-center text-xs text-gray-500 mt-auto">
                <div className="mr-1">
                  <FlagIcon country={country} />
                </div>
                <span className="border-r border-gray-300 h-4 mx-2"></span>
                <div className="flex items-center">
                  <img
                    src={`https://www.google.com/s2/favicons?sz=64&domain=${headlineData.link}`}
                    alt={`${source} favicon`}
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                </div>
                <span className="border-r border-gray-300 h-4 mx-2"></span>
                <span>{new Date().toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}</span>
              </div>
              
              <p 
                className="text-sm text-gray-600 mt-4 font-normal"
                style={{
                  fontFamily: 'Geist, sans-serif',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  fontWeight: 400
                }}
              >
                {headlineData.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}