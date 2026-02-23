'use client';

import CustomTooltip from "@/components/CustomTooltip";
import { TopBarButton } from "@/components/IconButtons";
import { useTranslate } from "@/utils/store";
import { Translate } from "@mui/icons-material";
import { useEffect, useState } from "react";

export default function TranslateToggle({ sources, pageDate, tooltipTitle = "Translate to English", tooltipAlwaysOpen = false, tooltipSlotProps }) {
    const translate = useTranslate(state => state.translate);
    const setTranslate = useTranslate(state => state.setTranslate);
    const [on, setOn] = useState(false);

    // Sync the toggle state with the actual translation state
    useEffect(() => {
        // If any sources are being translated, the toggle should be on
        setOn(translate.length > 0);
    }, [translate]);

    const handleClick = () => {
        setTranslate(on ? [] : Object.keys(sources));
        setOn(!on);
    }

    // Color scheme: blue for regular pages, amber-800 for date pages when active
    const isDatePage = !!pageDate;
    const activeColor = isDatePage ? '#92400e' : '#0000FF';
    
    return (
        <CustomTooltip
            title={tooltipTitle}
            placement="bottom"
            open={tooltipAlwaysOpen ? true : undefined}
            disableHoverListener={tooltipAlwaysOpen}
            disableFocusListener={tooltipAlwaysOpen}
            disableTouchListener={tooltipAlwaysOpen}
            slotProps={tooltipSlotProps}
        >
            <TopBarButton onClick={handleClick}>
                <Translate sx={{ color: on ? activeColor : '' }} />
            </TopBarButton>
        </CustomTooltip>
    );
}
