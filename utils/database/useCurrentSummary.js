import { useEffect, useState } from "react";
import { useTime } from "@/utils/store";
import { useDaySummaries } from "./useSummariesManager";

export default function useCurrentSummary() {
    const summaries = useDaySummaries(state => state.daySummaries);
    const date = useTime(state => state.date);
    const [currentSummary, setCurrentSummary] = useState(null);

    useEffect(() => {
        if (!date || !summaries.length) {
            setCurrentSummary(null);
            return;
        }

        const sortedSummaries = [...summaries].sort((a, b) => b.timestamp - a.timestamp);
        const activeSummary = sortedSummaries.find(summary => summary.timestamp <= date);
        setCurrentSummary(activeSummary || null);
    }, [date, summaries]);

    return currentSummary;
} 
