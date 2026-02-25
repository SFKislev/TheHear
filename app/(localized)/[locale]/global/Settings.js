'use client'

import CustomTooltip from "@/components/CustomTooltip";
import { List, SettingsRounded } from "@mui/icons-material";
import { Collapse } from "@mui/material";
import { useState } from "react";
import { useGlobalSort } from "@/utils/store";

export default function Settings({ locale }) {
    const [open, setOpen] = useState(false)
    const { globalSort, setGlobalSort } = useGlobalSort()
    const [sourcesDialogOpen, setSourcesDialogOpen] = useState(false)
    const [isSortExpanded, setIsSortExpanded] = useState(false)

    const handleSortTypeChange = (newSortType) => {
        setGlobalSort(newSortType)
    }

    const handleLanguageChange = (newLocale) => {
        if (newLocale === locale) return
        if (!window) return
        window.location.href = window.location.pathname.replace(`/${locale}/`, `/${newLocale}/`);
    }

    const handleSourcesDialogOpen = (newSourcesDialogOpen) => {
        setSourcesDialogOpen(newSourcesDialogOpen)
    }

    const sortOptions = [
        { label: "AI", value: "ai", title: "An AI reads and sorts the headlines, acting as a live editor" },
        { label: "COHESION", value: "cohesion", title: "Sorts countries by the degree the different sources agree on what the main story is" },
        { label: "RECENCY", value: "recency", title: "Recent overviews at the top" },
        { label: "POPULATION", value: "population", title: "Sorts countries by population size" },
        { label: "SOFT POWER", value: "softPower", title: "Sorts countries according to Brand Finance's 'Soft Power Index'" },
        { label: "PRESS FREEDOM", value: "pressFreedom", title: "Sorts countries according to the World Press Freedom Index by RSF" },
    ]

    const languageOptions = [
        { label: "HE", value: "heb", title: "Shows headlines in Hebrew" },
        { label: "EN", value: "en", title: "Shows headlines in English" },
    ]

    const visibleSortOptions = isSortExpanded ? sortOptions : sortOptions.filter(option => 
        ['ai', 'cohesion', 'recency'].includes(option.value)
    )

    return (
        <div className="flex items-center">
            <CustomTooltip title="Settings" arrow>
                <button 
                    className={`p-1 hover:bg-gray-100 rounded-full ${locale === 'heb' && open ? 'pl-4' : ''}`}
                    onClick={() => setOpen(prev => !prev)}
                >
                    <SettingsRounded sx={{ color: open ? "blue" : "inherit" }} className="!text-base" />
                </button>
            </CustomTooltip>

            <Collapse in={open} orientation="horizontal">
                <div className={`flex items-center ${locale === 'heb' ? 'flex-row-reverse' : ''}`}>
                    {locale === 'heb' ? (
                        <>
                            <button
                                onClick={() => setSourcesDialogOpen(true)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <List className="text-base" />
                            </button>

                            <div className="mx-2 h-full border-l border-gray-300" />

                            <div className="h-6 flex items-center">
                                <div className="inline-flex h-full border border-gray-300 divide-x">
                                    {languageOptions.map(languageOption => (
                                        <CustomTooltip key={languageOption.value} title={languageOption.title} placement="bottom" arrow>
                                            <button
                                                onClick={() => handleLanguageChange(languageOption.value)}
                                                className={`px-1.5 py-0.5 text-xs ${locale === languageOption.value ? "bg-gray-300" : "hover:bg-gray-100"}`}
                                            >
                                                {languageOption.label}
                                            </button>
                                        </CustomTooltip>
                                    ))}
                                </div>
                            </div>

                            <div className="mx-2 h-full border-l border-gray-300" />
                        </>
                    ) : null}

                    <div className="flex items-center" dir="ltr">
                        {locale !== 'heb' && <div className="mx-2 h-full border-l border-gray-300" />}

                        <span className="text-xs whitespace-nowrap text-[#707070] mr-2 hover:text-blue-500">
                            SORT BY
                        </span>

                        <div className="h-6 flex">
                            <div className="inline-flex h-full border border-gray-300 divide-x">
                                {visibleSortOptions.map(sortOption => (
                                    <CustomTooltip key={sortOption.value} title={sortOption.title} placement="bottom" arrow>
                                        <button
                                            onClick={() => handleSortTypeChange(sortOption.value)}
                                            className={`px-1.5 py-0.5 text-xs ${globalSort === sortOption.value ? "bg-gray-300" : "hover:bg-gray-100"}`}
                                        >
                                            {sortOption.label}
                                        </button>
                                    </CustomTooltip>
                                ))}
                                <button
                                    onClick={() => setIsSortExpanded(!isSortExpanded)}
                                    className="px-1.5 py-0.5 text-xs hover:bg-gray-100"
                                >
                                    {isSortExpanded ? '−' : '+'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {locale !== 'heb' ? (
                        <>
                            <div className="mx-2 h-full border-l border-gray-300" />

                            <div className="h-6 flex items-center">
                                <div className="inline-flex h-full border border-gray-300 divide-x">
                                    {languageOptions.map(languageOption => (
                                        <CustomTooltip key={languageOption.value} title={languageOption.title} placement="bottom" arrow>
                                            <button
                                                onClick={() => handleLanguageChange(languageOption.value)}
                                                className={`px-1.5 py-0.5 text-xs ${locale === languageOption.value ? "bg-gray-300" : "hover:bg-gray-100"}`}
                                            >
                                                {languageOption.label}
                                            </button>
                                        </CustomTooltip>
                                    ))}
                                </div>
                            </div>

                            <div className="mx-2 h-full border-l border-gray-300" />

                            <button
                                onClick={() => setSourcesDialogOpen(true)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <List className="text-base" />
                            </button>
                        </>
                    ) : null}
                </div>
            </Collapse>
        </div>
    )
}