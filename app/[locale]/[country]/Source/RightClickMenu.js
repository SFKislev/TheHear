'use client'

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useFont, useOrder } from "@/utils/store";
import { getTypographyOptions } from "@/utils/typography/typography";
import OrderMenu from "../TopBar/settings/OrderMenu";
import { SourcesGrid } from "../TopBar/settings/SourcesToggle";
import PopUpCleaner from "@/components/PopUp";
import { TextFields, SwapVert, List } from "@mui/icons-material";
import { Suspense } from "react";

export default function RightClickMenu({ open, position, close, country, locale, sources }) {
    const menuRef = useRef(null);
    const { font, setFont } = useFont();
    const { order, setOrder } = useOrder();
    const [subMenu, setSubMenu] = useState(null); // 'order' | 'sources' | null

    const closeAll = useCallback(() => {
        setSubMenu(null);
        close();
    }, [close]);

    // Close on Escape
    useEffect(() => {
        if (!open && !subMenu) return;
        const handler = (e) => {
            if (e.key === 'Escape') closeAll();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, subMenu, closeAll]);

    // Clamp menu position to viewport
    useEffect(() => {
        if (!open || !menuRef.current) return;
        const rect = menuRef.current.getBoundingClientRect();
        const el = menuRef.current;
        if (rect.right > window.innerWidth) {
            el.style.left = `${window.innerWidth - rect.width - 8}px`;
        }
        if (rect.bottom > window.innerHeight) {
            el.style.top = `${window.innerHeight - rect.height - 8}px`;
        }
    }, [open, position]);

    const handleCycleFont = () => {
        const options = [...getTypographyOptions(country).options, "random"];
        let currentIndex = options.indexOf(font);
        if (currentIndex === -1) currentIndex = 0;
        const nextIndex = (currentIndex + 1) % options.length;
        setFont(options[nextIndex]);
        close();
    };

    const handleOpenOrder = () => {
        setSubMenu('order');
    };

    const handleOpenSources = () => {
        setSubMenu('sources');
    };

    const showContextMenu = open && !subMenu;
    const isActive = open || subMenu;

    if (!isActive) return null;

    const fontLabel = font === "random" ? "Font Salad" : "Headline Font";

    return typeof window !== 'undefined' ? createPortal(
        <>
            {showContextMenu && (
                <>
                    <div className="fixed inset-0 z-[9998]" onClick={close} />
                    <div
                        ref={menuRef}
                        className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 py-1 font-['Geist'] text-sm select-none"
                        style={{ top: position.y, left: position.x }}
                    >
                        <button
                            onClick={handleOpenSources}
                            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 text-left text-gray-700 hover:text-black"
                        >
                            <List sx={{ fontSize: 18 }} />
                            Select Sources
                        </button>
                        <button
                            onClick={handleOpenOrder}
                            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 text-left text-gray-700 hover:text-black"
                        >
                            <SwapVert sx={{ fontSize: 18 }} />
                            Source Order
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                            onClick={handleCycleFont}
                            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 text-left text-gray-700 hover:text-black"
                        >
                            <TextFields sx={{ fontSize: 18, color: font === "random" ? "blue" : "inherit" }} />
                            {fontLabel}
                        </button>
                    </div>
                </>
            )}
            {subMenu === 'order' && (
                <OrderMenu open={true} close={closeAll} centered {...{ locale, order, setOrder }} />
            )}
            {subMenu === 'sources' && (
                <>
                    <PopUpCleaner open={true} close={closeAll} />
                    <Suspense>
                        <SourcesGrid open={true} close={closeAll} centered {...{ country, locale, sources }} />
                    </Suspense>
                </>
            )}
        </>,
        document.body
    ) : null;
}
