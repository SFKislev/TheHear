import CustomTooltip from "@/components/CustomTooltip";
import { TopBarButton } from "@/components/IconButtons";
import { Language } from "@mui/icons-material";
import { useTranslate } from "@/utils/store";

export default function LanguageToggle({ pageDate }) {
    const useLocalLanguage = useTranslate(state => state.useLocalLanguage)
    const toggleLocalLanguage = useTranslate(state => state.toggleLocalLanguage)

    const toolTipText = useLocalLanguage ? 'Switch to English overviews' : 'Switch to overviews in the local language';

    // Color scheme: blue for regular pages, amber-600 for date pages when active
    const isDatePage = !!pageDate;
    const activeColor = isDatePage ? '#D97706' : 'blue';

    return (
        <CustomTooltip
            title={toolTipText}
            placement="bottom"
        >
            <TopBarButton onClick={toggleLocalLanguage}>
                <Language sx={{ color: useLocalLanguage ? activeColor : "inherit" }} />
            </TopBarButton>
        </CustomTooltip>
    );
}