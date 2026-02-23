import { useEffect, useState } from "react";
import useFirebase from "./useFirebase";
import { getWebsiteName } from "../sources/getCountryData";
import { useTime } from "../store";
import { sub } from "date-fns";

export default function useSourcesManager(country, initialSources, enabled = true) {

    const [sources, setSources] = useState(initialSources);
    const firebase = useFirebase();
    const [loading, setLoading] = useState(enabled);
    const setDate = useTime(state => state.setDate);

    const updateSources = (newHeadlines) => {
        let changedCount = 0;
        setSources(prevSources => {
            const newSources = { ...prevSources };
            newHeadlines.forEach(headline => {
                const sourceName = getWebsiteName(country, headline.website_id);
                if (!newSources[sourceName]) newSources[sourceName] = { headlines: [], website_id: headline.website_id };
                const existingIndex = newSources[sourceName].headlines.findIndex(h => h.id === headline.id);

                if (existingIndex === -1) {
                    newSources[sourceName].headlines.push(headline);
                    changedCount += 1;
                } else {
                    const existing = newSources[sourceName].headlines[existingIndex];
                    const hasChanged =
                        existing.headline !== headline.headline ||
                        existing.subtitle !== headline.subtitle ||
                        existing.link !== headline.link ||
                        existing.image !== headline.image ||
                        new Date(existing.timestamp).getTime() !== new Date(headline.timestamp).getTime();
                    if (hasChanged) {
                        newSources[sourceName].headlines[existingIndex] = headline;
                        changedCount += 1;
                    }
                }
            });
            Object.values(newSources).forEach(source => {
                source.headlines.sort((a, b) => b.timestamp - a.timestamp);
            });
            return newSources;
        });
        return changedCount;
    }

    useEffect(() => {
        setSources(initialSources);
    }, [initialSources]);

    const getMaxKnownHeadlineTime = () => {
        const allHeadlines = Object.values(sources || {}).flatMap(source => source.headlines || []);
        if (allHeadlines.length === 0) return null;
        const maxMs = Math.max(...allHeadlines.map(headline => new Date(headline.timestamp).getTime()));
        return Number.isFinite(maxMs) ? new Date(maxMs) : null;
    };

    useEffect(() => {
        if (!enabled) return
        if (!firebase.ready) return

        getRecentHeadlines()

        const headlinesCollection = firebase.getCountryCollectionRef(country, 'headlines');
        const recentWindowStart = sub(new Date(), { days: 2 });
        const q = firebase.firestore.query(
            headlinesCollection,
            firebase.firestore.where('timestamp', '>=', recentWindowStart),
            firebase.firestore.orderBy('timestamp', 'desc'),
            firebase.firestore.limit(30),
        );
        const unsubscribe = firebase.firestore.onSnapshot(q, snapshot => {
            if (snapshot.empty) return
            const headlines = snapshot.docs.map(doc => firebase.prepareData(doc));
            const changed = updateSources(headlines);
            if (changed > 0) {
                setDate(new Date());
            }
        });

        return () => {
            unsubscribe()
        };

    }, [firebase.ready, country, enabled]);


    const getRecentHeadlines = async () => {
        setLoading(true);

        const maxKnownTime = getMaxKnownHeadlineTime();
        const fallbackWindowStart = sub(new Date(), { days: 2 });
        const headlinesCollection = firebase.getCountryCollectionRef(country, 'headlines');
        const sinceTime = maxKnownTime ? sub(maxKnownTime, { minutes: 30 }) : fallbackWindowStart;
        const q = firebase.firestore.query(
            headlinesCollection,
            firebase.firestore.where('timestamp', '>=', sinceTime),
            firebase.firestore.orderBy('timestamp', 'desc'),
            firebase.firestore.limit(150),
        );
        let newHeadlines = await firebase.firestore.getDocs(q);

        setLoading(false);
        if (newHeadlines.empty) return;
        newHeadlines = newHeadlines.docs.map(headline => firebase.prepareData(headline));
        const changed = updateSources(newHeadlines);
        if (changed > 0) {
            setDate(new Date())
        }
    }

    return { sources, loading }
}
