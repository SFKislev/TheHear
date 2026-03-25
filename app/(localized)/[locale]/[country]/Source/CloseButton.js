'use client'
import { XIcon } from "lucide-react";
import { useActiveWebsites } from "@/utils/store";
export default function CloseButton({ isRTL, name, onClose, className = '' }) {
    const setActiveWebsites = useActiveWebsites(state => state.setActiveWebsites)
    const activeWebsites = useActiveWebsites(state => state.activeWebsites)

    const click = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (onClose) {
            onClose(name);
            return;
        }
        setActiveWebsites(activeWebsites.filter(website => website !== name))
    }

    return (
        <button
            type="button"
            className={`close-button absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-20 p-1 transition-all opacity-0 duration-100 cursor-pointer group-hover:opacity-100 text-neutral-500 hover:text-neutral-800 ${className}`}
            onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onClick={click}
            aria-label="Remove source"
        >
            <XIcon size="18" />
        </button>
    );
}
