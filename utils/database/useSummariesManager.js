import { useEffect, useState } from "react";
import useFirebase from "./useFirebase";
import { create } from "zustand";

function scheduleWhenIdle(callback) {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        const handle = window.requestIdleCallback(callback, { timeout: 2000 });
        return () => window.cancelIdleCallback(handle);
    }

    const timeoutId = setTimeout(callback, 500);
    return () => clearTimeout(timeoutId);
}

export const useDaySummaries = create(set => ({
    daySummaries: [],
    setDaySummaries: (newSummaries) => set({ daySummaries: newSummaries })
}))

export default function useSummariesManager(country, initialSummaries, enabled = true) {

    const [summaries, setSummaries] = useState(initialSummaries);
    const firebase = useFirebase()
    const setDaySummaries = useDaySummaries(state => state.setDaySummaries)

    const addSummaries = (newSummaries) => {
        setSummaries(prev => {
            const onlyNewOnes = newSummaries.filter(newSummary => !prev.some(summary => summary.id === newSummary.id))
            return [...prev, ...onlyNewOnes]
        })
    }

    useEffect(() => {
        setSummaries(initialSummaries)
    }, [initialSummaries])

    useEffect(()=>{
        setDaySummaries(summaries)
    }, [summaries])

    useEffect(() => {
        if (!enabled) return
        if (!firebase.ready) return

        let unsubscribe = () => {};
        const cleanupIdle = scheduleWhenIdle(() => {
            getRecentSummaries()

            unsubscribe = firebase.subscribeToSummaries(country, (newSummary) => {
                addSummaries(newSummary)
            })
        })

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") getRecentSummaries()
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => {
            cleanupIdle()
            unsubscribe()
            document.removeEventListener("visibilitychange", handleVisibilityChange)
        }
    }, [firebase.ready, country, enabled])

    const getRecentSummaries = async () => {
        const latestSummariTime = summaries.length > 0 ? summaries[0].timestamp : new Date()
        const newSummaries = await firebase.getRecentSummaries(country, latestSummariTime)
        if (newSummaries.length > 0) {
            addSummaries(newSummaries)
        }
    }

    return summaries
}
