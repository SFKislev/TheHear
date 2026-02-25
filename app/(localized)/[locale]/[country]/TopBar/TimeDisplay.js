'use client'

import Clock from "@/components/Clock";
import { useTime } from "@/utils/store";

export default function TimeDisplay({ locale, country }) {
    const date = useTime(state => state.date);

    return <Clock locale={locale} date={date} country={country} />;
}