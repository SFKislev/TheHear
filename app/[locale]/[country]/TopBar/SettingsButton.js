'use client'

import CustomTooltip from "@/components/CustomTooltip";
import { TopBarButton } from "@/components/IconButtons";
import { SettingsRounded, InfoOutlined } from "@mui/icons-material";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslate } from "@/utils/store";

const TranslateToggle = dynamic(() => import("./settings/TranslateToggle"));
const englishSpeakingCountries = ['us', 'canada', 'australia', 'uk', 'ireland', 'new zealand', 'south africa', 'kenya'];
const hebrewSpeakingCountries = ['israel'];
const allCountries = [...englishSpeakingCountries, ...hebrewSpeakingCountries];

export function SettingsButton({ locale, country, sources, isRightPanelCollapsed, userCountry, pageDate, settingsOpen, setSettingsOpen }) {
    const translate = useTranslate(state => state.translate);

    // Color scheme: sky for regular pages, amber for date pages
    const isDatePage = !!pageDate;
    const buttonClasses = isDatePage
        ? "bg-amber-50 hover:bg-amber-100"
        : "bg-sky-100 hover:bg-sky-200";
    const translateTooltipTitle = locale === 'heb' ? 'תרגם לעברית' : 'Translate to English';
    const shouldRecommendTranslate = !allCountries.includes(country) && userCountry !== country;
    const showTranslateReminder = shouldRecommendTranslate && translate.length === 0;

    return (
        <>
            <div className={`flex items-center ${buttonClasses} rounded-md px-3 py-2 gap-4`}>
                <TranslateToggle
                    {...{ locale, country, sources, userCountry, pageDate }}
                    tooltipTitle={translateTooltipTitle}
                    tooltipAlwaysOpen={showTranslateReminder}
                    tooltipSlotProps={{
                        tooltip: {
                            sx: {
                                bgcolor: '#111827',
                                color: '#F9FAFB',
                                border: '1px solid #F9FAFB',
                            },
                        },
                        arrow: {
                            sx: {
                                color: '#111827',
                                '&::before': {
                                    border: '1px solid #F9FAFB',
                                },
                            },
                        },
                    }}
                />
                <CustomTooltip title="About the Hear" arrow>
                    <TopBarButton size="small" component={Link} href="/about">
                        <InfoOutlined />
                    </TopBarButton>
                </CustomTooltip>
                <CustomTooltip title="Settings" arrow>
                    <TopBarButton size="small" onClick={() => setSettingsOpen(prev => !prev)}>
                        <SettingsRounded sx={{ color: settingsOpen ? "black" : "inherit" }} />
                    </TopBarButton>
                </CustomTooltip>
            </div>
        </>
    );
}
