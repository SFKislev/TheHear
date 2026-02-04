'use client';

import { useState, useEffect } from 'react';
import { Archive } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InfoOutlined } from '@mui/icons-material';
import SearchComponent from './SearchComponent';
import ArchiveMenu from '../TopBar/settings/ArchiveMenu';
import AboutMenu from '../TopBar/AboutMenu';
import HistoryCountryNavigator from './HistoryCountryNavigator';
import EnglishFonts from '@/utils/typography/EnglishFonts';
import HebrewFonts from '@/utils/typography/HebrewFonts';
import { countries } from '@/utils/sources/countries';
import { getCountryLaunchDate } from '@/utils/launchDates';
import useMobile from '@/components/useMobile';
import Loader from '@/components/loader';

export default function HistoryContent({ locale, country }) {
    const router = useRouter();
    const { isMobile, isHydrated } = useMobile();
    const [archiveMenuOpen, setArchiveMenuOpen] = useState(false);
    const [aboutMenuOpen, setAboutMenuOpen] = useState(false);

    // Auto-update archives when page loads
    useEffect(() => {
        const updateArchives = async () => {
            try {
                console.log(`🔄 Triggering archive update check for ${country}`);
                
                const response = await fetch(`/api/update-archives/${country}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const result = await response.json();
                
                if (response.ok) {
                    if (result.updated) {
                        console.log(`✅ Archives updated for ${country}`);
                    } else {
                        console.log(`📋 Archives already up to date for ${country}`, result.message);
                    }
                } else {
                    console.warn(`⚠️ Archive update issue for ${country}:`, result.message);
                }
            } catch (error) {
                console.error(`❌ Failed to trigger archive update for ${country}:`, error);
                // Don't show error to user - this is a background operation
            }
        };

        // Trigger update in the background
        updateArchives();
    }, [country]);

    // Redirect mobile users to the root page
    useEffect(() => {
        if (isHydrated && isMobile) {
            router.replace(`/${locale}/${country}`);
        }
    }, [isMobile, isHydrated, router, locale, country]);

    // Don't render anything on mobile (will redirect)
    if (isHydrated && isMobile) {
        return null;
    }

    const countryData = countries[country] || {};
    const countryName = locale === 'heb' ? countryData.hebrew : countryData.english;
    const fullTitle = locale === 'heb' 
        ? `ארכיון חדשות ${countryName}`
        : `${countryName} News Archive`;

    // Country launch date

    const getCountryDisplayName = (countryCode) => {
        const countryNames = {
            'us': 'the US',
            'uk': 'the UK', 
            'uae': 'the UAE',
            'israel': 'Israel',
            'germany': 'Germany',
            'italy': 'Italy',
            'russia': 'Russia',
            'iran': 'Iran',
            'france': 'France',
            'lebanon': 'Lebanon',
            'poland': 'Poland',
            'india': 'India',
            'ukraine': 'Ukraine',
            'spain': 'Spain',
            'netherlands': 'the Netherlands',
            'china': 'China',
            'japan': 'Japan',
            'turkey': 'Turkey',
            'palestine': 'Palestine',
            'finland': 'Finland'
        };
        return countryNames[countryCode] || countryCode;
    };

    const launchDate = getCountryLaunchDate(country);
    
    return (
        <>
            {!isHydrated && (
                <div className="absolute inset-0 z-50">
                    <Loader />
                </div>
            )}
            <EnglishFonts />
            <HebrewFonts />
            <div style={{ paddingBottom: "var(--footer-offset, 3rem)" }} className="min-h-screen bg-white">
                {/* TopBar - copied from ArchiveTopBar.js */}
                <nav className="sticky top-0 w-full bg-white z-50 py-1 direction-ltr border-b border-gray-200">
                    <div className="px-4">
                        <div className="flex items-center h-10 justify-between">
                            {/* Left: The Hear + Country • Headlines Archive */}
                            <div className="flex items-center gap-2">
                                <Link href={`/${locale}/${country}`} className="text-sm font-medium hover:text-blue transition-colors ml-1 font-['Geist']">
                                    The Hear
                                </Link>
                                <span className="text-gray-400">•</span>
                                <h1 className={`${locale === 'heb' ? 'frank-re text-right text-[16px]' : 'font-[\"Geist\"] text-left text-sm'} flex items-center gap-2`}>
                                    <HistoryCountryNavigator country={country} locale={locale} />
                                    <span>{countryName}</span>
                                    <span className="text-gray-400">•</span>
                                    <span>{locale === 'heb' ? 'ארכיון כותרות' : 'Archive Search'}</span>
                                </h1>
                            </div>

                            {/* Right: About Icon + Live Headlines Link */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAboutMenuOpen(true)}
                                    className="text-gray-300 hover:text-gray-500"
                                >
                                    <InfoOutlined fontSize="small" />
                                </button>
                                <Link 
                                    href={`/${locale}/${country}`} 
                                    className="text-sm font-['Geist'] bg-gray-100 hover:bg-gray-200 rounded px-3 py-1 transition-colors"
                                >
                                    {countryName} - live headlines
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content - New Layout */}
                <div className="flex p-4 gap-4">
                    {/* Left: Search Component - natural height */}
                    <div className="w-1/2">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <SearchComponent locale={locale} country={country} />
                        </div>
                    </div>

                    {/* Right: Archive Menu Card */}
                    <div className="w-1/2">
                        <div className="bg-gray-50 px-6 py-4">
                            <div className="text-sm underline underline-offset-4 font-bold mb-4 font-['Geist'] flex justify-start items-start">
                                {/* <Archive size={16} className="mr-2 mt-0.5" /> */}
                                The Archives
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {(() => {
                                    const now = new Date();
                                    
                                    // Generate list of available months from launch date to current month
                                    const months = [];
                                    let currentDate = new Date(launchDate.getFullYear(), launchDate.getMonth(), 1);
                                    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);

                                    while (currentDate <= endDate) {
                                        months.push({
                                            year: currentDate.getFullYear(),
                                            month: currentDate.getMonth() + 1,
                                            monthName: currentDate.toLocaleDateString('en', { month: 'short' })
                                        });
                                        currentDate.setMonth(currentDate.getMonth() + 1);
                                    }

                                    // Group by year
                                    const yearGroups = months.reduce((groups, month) => {
                                        if (!groups[month.year]) {
                                            groups[month.year] = [];
                                        }
                                        groups[month.year].push(month);
                                        return groups;
                                    }, {});

                                    return (
                                        <>
                                            {Object.keys(yearGroups).reverse().map(year => (
                                                <div key={year} className="mb-3">
                                                    <div className="font-['Geist'] font-bold text-xs text-gray-800 mb-2">{year}</div>
                                                    <div className="grid grid-cols-3 gap-1">
                                                        {yearGroups[year].map(month => (
                                                            <Link
                                                                key={`${month.year}-${month.month}`}
                                                                href={`/${locale}/${country}/history/${month.year}/${month.month.toString().padStart(2, '0')}`}
                                                                className="flex items-center justify-center px-2 py-1 text-xs bg-gray-200 hover:bg-white hover:shadow-xl rounded font-mono"
                                                            >
                                                                <span className="mr-1">{month.month.toString().padStart(2, '0')}</span> <span className="text-gray-400 text-[10px]">({month.monthName})</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="border-t pt-2 mt-2">
                                <div className="text-xs font-['Geist'] text-gray-500">
                                    The Hear archives main headlines as they unfolded. It started tracking {getCountryDisplayName(country)} in {launchDate.toLocaleDateString('en', { month: 'short', year: 'numeric' })}.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Archive Menu */}
                <ArchiveMenu 
                    open={archiveMenuOpen} 
                    close={() => setArchiveMenuOpen(false)} 
                    locale={locale} 
                    country={country} 
                />

                {/* About Menu */}
                <AboutMenu 
                    open={aboutMenuOpen} 
                    onClose={() => setAboutMenuOpen(false)} 
                />
            </div>
        </>
    );
}
