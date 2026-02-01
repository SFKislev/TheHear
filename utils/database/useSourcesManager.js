import { useEffect, useState } from "react";
import useFirebase from "./useFirebase";
import { getWebsiteName } from "../sources/getCountryData";
import { useTime } from "../store";

export default function useSourcesManager(country, initialSources, enabled = true) {

    const [sources, setSources] = useState(initialSources);
    const firebase = useFirebase();
    const [loading, setLoading] = useState(enabled);
    const setDate = useTime(state => state.setDate);

    const updateSources = (newHeadlines) => {
        let addedCount = 0;
        setSources(prevSources => {
            const newSources = { ...prevSources };
            newHeadlines.forEach(headline => {
                const sourceName = getWebsiteName(country, headline.website_id);
                if (!newSources[sourceName]) newSources[sourceName] = { headlines: [], website_id: headline.website_id };
                if (!newSources[sourceName].headlines.find(h => h.id === headline.id)) {
                    newSources[sourceName].headlines.push(headline);
                    addedCount += 1;
                }
            });
            Object.values(newSources).forEach(source => {
                source.headlines.sort((a, b) => b.timestamp - a.timestamp);
            });
            return newSources;
        });
        return addedCount;
    }

    useEffect(() => {
        setSources(initialSources);
    }, [initialSources]);

    useEffect(() => {
        if (!enabled) return
        if (!firebase.ready) return

        getRecentHeadlines()

        const headlinesCollection = firebase.getCountryCollectionRef(country, 'headlines');
        const q = firebase.firestore.query(
            headlinesCollection,
            firebase.firestore.orderBy('timestamp', 'desc'),
            firebase.firestore.limit(1),
        );
        const unsubscribe = firebase.firestore.onSnapshot(q, snapshot => {
            if (snapshot.empty) return
            const headlines = snapshot.docs.map(doc => firebase.prepareData(doc));
            const added = updateSources(headlines);
            if (added > 0) {
                setDate(new Date());
            }
        });

        return () => {
            unsubscribe()
        };

    }, [firebase.ready, country, enabled]);


    const getRecentHeadlines = async () => {
        setLoading(true);

        const allHeadlines = Object.values(sources).flatMap(source => source.headlines);
        const headlinesCollection = firebase.getCountryCollectionRef(country, 'headlines');
        const initialTimes = allHeadlines.map(headline => headline.timestamp)
        const lastHeadlineTime = new Date(Math.max(...initialTimes));
        const q = firebase.firestore.query(
            headlinesCollection,
            firebase.firestore.where('timestamp', '>=', lastHeadlineTime),
            firebase.firestore.orderBy('timestamp', 'desc'),
        );
        let newHeadlines = await firebase.firestore.getDocs(q);

        setLoading(false);
        if (newHeadlines.empty) return;
        newHeadlines = newHeadlines.docs.map(headline => firebase.prepareData(headline));
        const added = updateSources(newHeadlines);
        if (added > 0) {
            setDate(new Date())
        }
    }

    return { sources, loading }
}
