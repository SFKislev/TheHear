import PopUpCleaner from "@/components/PopUp";
import { Archive, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getCountryLaunchDate } from "@/utils/launchDates";

export default function HistoryMenu({ open, close, locale, country }) {
    if (!open) return null;

    const launchDate = getCountryLaunchDate(country);
    
    // Get country name with proper formatting
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
            <PopUpCleaner open={open} close={close} />
            <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none" style={{ direction: 'ltr' }}>
                <div className="bg-white shadow-xl rounded-xs p-6 pt-4 border border-gray-200 pointer-events-auto">
                <div className="w-64 bg-white rounded-sm text-sm">
                    <div className="text-sm underline underline-offset-4 font-bold mb-4 font-['Geist'] flex justify-start items-start">
                        <Archive size={16} className="mr-2 mt-0.5" />
                        The Archives
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {Object.keys(yearGroups).reverse().map(year => (
                            <div key={year} className="mb-3">
                                <div className="font-['Geist'] font-bold text-xs text-gray-800 mb-2">{year}</div>
                                <div className="grid grid-cols-3 gap-1">
                                    {yearGroups[year].map(month => (
                                        <Link
                                            key={`${month.year}-${month.month}`}
                                            href={`/${locale}/${country}/history/${month.year}/${month.month.toString().padStart(2, '0')}`}
                                            className="flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 hover:shadow-md rounded font-mono"
                                            onClick={close}
                                        >
                                            <span className="mr-1">{month.month.toString().padStart(2, '0')}</span> <span className="text-gray-400 text-[10px]">({month.monthName})</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-2 mt-2">
                                                 <div className="text-xs font-['Geist'] text-gray-500">
                             The Hear archives main headlines as they unfolded. It started tracking {getCountryDisplayName(country)} in {launchDate.toLocaleDateString('en', { month: 'short', year: 'numeric' })}.
                         </div>
                    </div>
                </div>
                </div>
            </div>
        </>
    );
}
