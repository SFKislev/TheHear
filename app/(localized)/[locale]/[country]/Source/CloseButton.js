'use client'
import { XIcon } from "lucide-react";
import { useActiveWebsites } from "@/utils/store";
export default function CloseButton({ isRTL, name }) {
    const setActiveWebsites = useActiveWebsites(state => state.setActiveWebsites)
    const activeWebsites = useActiveWebsites(state => state.activeWebsites)

    const click = () => {
        setActiveWebsites(activeWebsites.filter(website => website !== name))
    }

    return (
        <div className={`close-button absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-1 transition-all opacity-0 duration-100 cursor-pointer hover:opacity-100 text-neutral-500 hover:text-neutral-800 transition-colors`}
            onClick={click}>
            <XIcon size="18" />
        </div>
    );
}