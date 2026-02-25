'use client';

import CustomTooltip from '@/components/CustomTooltip';
import { TopBarButton } from '@/components/IconButtons';
import { AppsSharp, DynamicFeedSharp } from '@mui/icons-material';
import { useState } from 'react';

export default function ViewToggle() {
    const [view, setView] = useState('grid');
    const isGridView = view === 'grid';

    const handleToggleView = () => {
        setView(isGridView ? 'feed' : 'grid');
    };

    return (
        <CustomTooltip 
            title={isGridView ? "switch to a feed view" : "back to the grid view"}
            placement="left"
        >
            <TopBarButton onClick={handleToggleView}>
                {isGridView ? <AppsSharp /> : <DynamicFeedSharp />}
            </TopBarButton>
        </CustomTooltip>
    );
}