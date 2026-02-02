'use client'

import CustomTooltip from "@/components/CustomTooltip";
import { TopBarButton } from "@/components/IconButtons";
import { SettingsRounded, InfoOutlined } from "@mui/icons-material";
import dynamic from "next/dynamic";
import { useTranslate } from "@/utils/store";
import Link from "next/link";

const TranslateToggle = dynamic(() => import("./settings/TranslateToggle"));

export function SettingsButton({ locale, country, sources, isRightPanelCollapsed, userCountry, pageDate, settingsOpen, setSettingsOpen }) {
    const translate = useTranslate(state => state.translate);
    
    // Calculate conditions here where we have access to props
    const isSpecialCase = (locale === 'heb' && country === 'israel') ||
                        (locale === 'en' && (country === 'us' || country === 'uk' || country === 'kenya'));

    // Force the hiding based on direct check as a fallback
    const shouldHideTranslate = isSpecialCase ||
        (locale === 'heb' && country === 'Israel') ||
        (locale === 'en' && (country === 'US' || country === 'UK' || country === 'Kenya'));

    // Check if translation is active
    const isTranslationActive = translate.length > 0;

    // Color scheme: sky for regular pages, amber for date pages
    const isDatePage = !!pageDate;
    const buttonClasses = isDatePage
        ? "bg-amber-50 hover:bg-amber-100"
        : "bg-sky-100 hover:bg-sky-200";

    return (
        <>
            <div className={`flex items-center ${buttonClasses} rounded-md px-3 py-2 gap-4`}>
                {!shouldHideTranslate && (
                    <TranslateToggle
                        {...{ locale, country, sources, userCountry, pageDate }}
                        tooltipTitle={isTranslationActive ?
                            (locale === 'heb' ? "מתורגם" : "Translated") :
                            (locale === 'heb' ? "תרגם כותרות" : "Translate headlines")}
                    />
                )}
                <CustomTooltip title={locale === 'heb' ? "אודות The Hear" : "About the Hear"} arrow>
                    <TopBarButton size="small" component={Link} href="/about">
                        <InfoOutlined />
                    </TopBarButton>
                </CustomTooltip>
                <CustomTooltip title={locale === 'heb' ? "הגדרות" : "Settings"} arrow>
                    <TopBarButton size="small" onClick={() => setSettingsOpen(prev => !prev)}>
                        <SettingsRounded sx={{ color: settingsOpen ? "black" : "inherit" }} />
                    </TopBarButton>
                </CustomTooltip>
            </div>
        </>
    );
}
