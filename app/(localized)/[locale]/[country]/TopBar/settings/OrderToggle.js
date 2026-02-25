'use client'

import CustomTooltip from "@/components/CustomTooltip";
import { TopBarButton } from "@/components/IconButtons";
import { SwapVert } from "@mui/icons-material";
import { useState } from "react";
import OrderMenu from "./OrderMenu";
import { useOrder } from "@/utils/store";

export default function OrderToggle({locale}) {
    const { order, setOrder } = useOrder();
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <div className="flex flex-col items-center">
                <CustomTooltip title="Sort the sources" placement="bottom" arrow
                    onClick={() => setOpen(p => !p)}>
                    <TopBarButton >
                        <SwapVert />
                    </TopBarButton>
                </CustomTooltip>
            </div>
            <OrderMenu close={() => setOpen(false)} {...{ open, locale, order, setOrder }} />
        </div>
    )
}