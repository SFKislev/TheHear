'use client'

import CustomTooltip from "@/components/CustomTooltip";
import { TopBarButton } from "@/components/IconButtons";
import PopUpCleaner from "@/components/PopUp";
import { getSourceData, getSourceOrder } from "@/utils/sources/getCountryData";
import { useOrder, useActiveWebsites } from "@/utils/store";
import { List } from "@mui/icons-material";
import { Suspense, useMemo, useState } from "react";
import { createPortal } from "react-dom";


export default function SourcesToggle({ country, locale, sources }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="relative">
                <CustomTooltip title="Select news sources" placement="left">
                    <TopBarButton onClick={() => setOpen(p => !p)}>
                        <List />
                    </TopBarButton>
                </CustomTooltip>
            </div>
            {open && typeof window !== 'undefined' && createPortal(
                <>
                    <PopUpCleaner open={open} close={() => setOpen(false)} />
                    <Suspense>
                        <SourcesGrid {...{ open, country, locale, sources, close: () => setOpen(false) }} />
                    </Suspense>
                </>,
                document.body
            )}
        </>
    );
}

export function SourcesGrid({ open, country, locale, sources, centered }) {
    const activeWebsites = useActiveWebsites(state => state.activeWebsites)
    const setActiveWebsites = useActiveWebsites(state => state.setActiveWebsites)
    const order = useOrder(state => state.order);

    const sourceOrder = useMemo(() => getSourceOrder(country, order), [country, order]);

    const orderedSources = sourceOrder.map(id => {
        const sourceData = getSourceData(country, id);
        const hasData = Boolean(sources[id] && sources[id].headlines.length > 0);
        return {
            id,
            description: sourceData.description,
            active: activeWebsites.includes(id),
            name: sourceData.name,
            website: sources[id] ? sources[id].headlines[0].link : '',
            hasData,
        }
    });

    const toggleSource = (source) => {
        const newWebsites = activeWebsites.includes(source)
            ? activeWebsites.filter(website => website !== source)
            : [...activeWebsites, source];
        setActiveWebsites(newWebsites);
    };

    const availableSourceIds = orderedSources.filter(source => source.hasData).map(source => source.id);
    const allSelected = availableSourceIds.length > 0 && availableSourceIds.every(id => activeWebsites.includes(id));
    const someSelected = availableSourceIds.some(id => activeWebsites.includes(id));

    const toggleSelectAll = () => {
        if (allSelected) {
            // Deselect all available sources
            setActiveWebsites(activeWebsites.filter(id => !availableSourceIds.includes(id)));
        } else {
            // Select all available sources
            const newWebsites = [...new Set([...activeWebsites, ...availableSourceIds])];
            setActiveWebsites(newWebsites);
        }
    };

    if (!open) return null;
    return (
        <div className={`fixed ${centered ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : `top-[120px] ${locale === 'heb' ? 'left-4' : 'right-4'}`} bg-white rounded-lg shadow-lg p-4 h-[65vh] w-[55vw] z-[9999]`}>
            <div className="h-full overflow-y-auto custom-scrollbar direction-ltr pr-4">
                <table className="border border-white text-sm">
                    <thead className="border-b border-dashed border-gray-300">
                        <tr className="text-left">
                            <th className="p-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = someSelected && !allSelected;
                                        }}
                                        onChange={toggleSelectAll}
                                        title="Select all sources"
                                        className="accent-black"
                                    />
                                    <span>Active</span>
                                </div>
                            </th>
                            <th className="p-2">Source</th>
                            <th className="p-2">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderedSources.map((source, i) => {
                            const SourceRow = (
                                <tr 
                                    key={source.id} 
                                    className={`border-b border-dashed border-gray-300 ${!source.hasData ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}`}
                                    onClick={() => source.hasData && toggleSource(source.id)}
                                >
                                    <td className='mt-8 p-4'>
                                        <input
                                            type="checkbox"
                                            checked={source.active}
                                            disabled={!source.hasData}
                                            onChange={() => {}} // Handled by row click
                                            title={!source.hasData ? 'No current data available' : ''}
                                            className="cursor-pointer accent-black"
                                        />
                                    </td>
                                    <td className={`mt-8 p-2 ${!source.hasData ? 'text-gray-500' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <img src={`https://www.google.com/s2/favicons?sz=64&domain=${source.website || 'example.com'}`}
                                                width={16} height={16} alt=""
                                                style={{ verticalAlign: 'middle', opacity: source.hasData ? 1 : 0.5 }}
                                            />
                                            {source.name}
                                        </div>
                                    </td>
                                    <td className={`mt-8 p-2 py-4 ${!source.hasData ? 'text-gray-500' : ''}`}>
                                        {source.description}
                                    </td>
                                </tr>
                            );

                            // Wrap inactive sources with tooltip
                            if (!source.hasData) {
                                return (
                                    <CustomTooltip 
                                        key={source.id}
                                        title={`The headlines from this source aren't updating. We need to look into it.`}
                                        placement="top"
                                    >
                                        {SourceRow}
                                    </CustomTooltip>
                                );
                            }

                            return SourceRow;
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}