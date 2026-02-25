'use client'

import { getSourceOrder } from "@/utils/sources/getCountryData";
import { useOrder, useActiveWebsites } from "@/utils/store";

export default function AddSourceButton({ country, sources }) {

    const order = useOrder(state => state.order)
    const activeWebsites = useActiveWebsites(state => state.activeWebsites)
    const setActiveWebsites = useActiveWebsites(state => state.setActiveWebsites)

    const addNextWebsite = () => {
        const sourceOrder = getSourceOrder(country, order);
        const availableSources = sources ? sourceOrder.filter(source => sources[source]) : sourceOrder;

        const nextSource = availableSources.find((source) => !activeWebsites.includes(source));
        const newSources = [...activeWebsites, nextSource]
            .sort((a, b) => sourceOrder.indexOf(a) - sourceOrder.indexOf(b));
        setActiveWebsites(newSources);
    };

    return (
        <div className="order-last col-span-1 flex items-center justify-center bg-neutral-100 text-gray-400 rounded-lg cursor-pointer hover:bg-white hover: transition-all transform text-3xl hover:shadow-xl min-h-[200px]"
            onClick={addNextWebsite}
        >
            <div className="animate-pulse">+</div>
        </div>
    );
} 