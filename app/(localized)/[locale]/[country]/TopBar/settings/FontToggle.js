'use client'

import { TextFields } from "@mui/icons-material";
import { useMemo, useEffect } from "react";
import CustomTooltip from "@/components/CustomTooltip";
import { getTypographyOptions } from "@/utils/typography/typography";
import { TopBarButton } from "@/components/IconButtons";
import { useFont, useRightPanel } from "@/utils/store";

export default function FontToggle({ country, isRightPanelCollapsed, pageDate }) {
    const { font, setFont } = useFont();
    const { isCollapsed, backupFont, setCollapsed, setBackupFont } = useRightPanel();

    const fontOptions = useMemo(() => {
        const options = [...getTypographyOptions(country).options, "random"];
        return options;
    }, [country]);

    // Handle collapsed state changes
    useEffect(() => {
        if (isRightPanelCollapsed && !isCollapsed) {
            // Panel just collapsed - backup current font and switch to random
            if (font !== "random") {
                setBackupFont(font);
            }
            setFont("random");
            setCollapsed(true);
        } else if (!isRightPanelCollapsed && isCollapsed) {
            // Panel just expanded - restore backup font if available
            if (backupFont !== null && backupFont !== "random") {
                setFont(backupFont);
                setBackupFont(null);
            }
            setCollapsed(false);
        }
    }, [isRightPanelCollapsed, isCollapsed, font, backupFont, setFont, setBackupFont, setCollapsed]);

    const handleNextFont = () => {
        let currentIndex = fontOptions.indexOf(font)
        if (currentIndex === -1) currentIndex = 0;
        const nextIndex = (currentIndex + 1) % fontOptions.length;
        const nextFont = fontOptions[nextIndex];
        setFont(nextFont);
        
        // If panel is collapsed and user changes to non-random font, update backup
        if (isRightPanelCollapsed && nextFont !== "random") {
            setBackupFont(nextFont);
        }
    };

    const toolTip = font === "random" ? "Font Salad" : "Change headlines font";

    // Color scheme: blue for regular pages, amber-800 for date pages when font salad is active
    const isDatePage = !!pageDate;
    const activeColor = isDatePage ? '#D97706' : 'blue';

    return (
        <div className="flex flex-col items-center">
            <CustomTooltip title={toolTip} placement="bottom">
                <TopBarButton onClick={handleNextFont}>
                    <TextFields sx={{ color: font === "random" ? activeColor : "inherit" }} />
                </TopBarButton>
            </CustomTooltip>
        </div>
    );
}