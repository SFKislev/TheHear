'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { add, sub } from "date-fns";
import useFirebase from "@/utils/database/useFirebase";
import { getWebsiteName } from "@/utils/sources/getCountryData";
import { getMixSourceDescriptor, getSelectionKey } from "@/utils/mix/config";
import { useTime } from "@/utils/store";

function dedupeHeadlines(headlines) {
    const deduped = new Map();

    for (const headline of headlines || []) {
        if (!headline?.id) continue;
        deduped.set(headline.id, headline);
    }

    return Array.from(deduped.values()).sort((a, b) => b.timestamp - a.timestamp);
}

function normalizeHeadline(firebase, country, docOrHeadline) {
    const headline = docOrHeadline.id && docOrHeadline.timestamp
        ? docOrHeadline
        : firebase.prepareData(docOrHeadline);

    return {
        ...headline,
        id: `${country}:${headline.id}`,
        sourceCountry: country,
        sourceKey: getWebsiteName(country, headline.website_id),
    };
}

function createSourceMap(selections, sourcesByCountry) {
    const nextSources = {};

    for (const selection of selections || []) {
        const descriptor = getMixSourceDescriptor(selection.country, selection.source);
        if (!descriptor) continue;

        const key = getSelectionKey(selection);
        const countryHeadlines = sourcesByCountry[selection.country] || [];
        nextSources[key] = {
            ...descriptor,
            headlines: dedupeHeadlines(countryHeadlines.filter((headline) => headline.sourceKey === selection.source)),
        };
    }

    return nextSources;
}

async function fetchCountryWindow(firebase, country, pageDate) {
    const collectionRef = firebase.getCountryCollectionRef(country, "headlines");
    const fromTime = pageDate ? sub(pageDate, { days: 1 }) : sub(new Date(), { days: 2 });
    const toTime = pageDate ? add(pageDate, { days: 1 }) : new Date();

    const queryRef = firebase.firestore.query(
        collectionRef,
        firebase.firestore.where("timestamp", ">=", fromTime),
        firebase.firestore.where("timestamp", "<=", toTime),
        firebase.firestore.orderBy("timestamp", "desc"),
        firebase.firestore.limit(pageDate ? 750 : 500),
    );

    const snapshot = await firebase.firestore.getDocs(queryRef);
    if (snapshot.empty) return [];

    return dedupeHeadlines(snapshot.docs.map((doc) => normalizeHeadline(firebase, country, doc)));
}

export default function useMixSourcesManager(selections, initialSources, pageDate) {
    const firebase = useFirebase();
    const firebaseRef = useRef(firebase);
    const setDate = useTime((state) => state.setDate);
    const ready = firebase.ready;
    const selectionKeys = useMemo(() => (selections || []).map((selection) => getSelectionKey(selection)), [selections]);
    const countries = useMemo(() => [...new Set((selections || []).map(({ country }) => country))], [selections]);
    const sourcesByCountryRef = useRef({});
    const unsubscribeRef = useRef({});
    const [loading, setLoading] = useState(false);
    const [sources, setSources] = useState(initialSources || {});

    const hasAnyLoadedHeadline = (sourceMap) => {
        return Object.values(sourceMap || {}).some((source) => (source?.headlines || []).length > 0);
    };

    useEffect(() => {
        firebaseRef.current = firebase;
    }, [firebase]);

    useEffect(() => {
        const nextCountryMap = {};
        for (const selection of selections || []) {
            const key = getSelectionKey(selection);
            const sourceData = initialSources?.[key];
            if (!sourceData) continue;

            if (!nextCountryMap[selection.country]) {
                nextCountryMap[selection.country] = [];
            }
            nextCountryMap[selection.country].push(...(sourceData.headlines || []));
        }
        for (const country of Object.keys(nextCountryMap)) {
            nextCountryMap[country] = dedupeHeadlines(nextCountryMap[country]);
        }

        sourcesByCountryRef.current = nextCountryMap;
        setSources(createSourceMap(selections, nextCountryMap));
    }, [initialSources, selections]);

    useEffect(() => {
        if (!ready) return;
        if (countries.length === 0) {
            setSources({});
            return;
        }

        let cancelled = false;

        const syncCountries = async () => {
            const missingCountries = countries.filter((country) => !sourcesByCountryRef.current[country]);
            const shouldShowGlobalLoading = missingCountries.length > 0 && !hasAnyLoadedHeadline(createSourceMap(selections, sourcesByCountryRef.current));

            if (shouldShowGlobalLoading) {
                setLoading(true);
            }

            if (missingCountries.length > 0) {
                const results = await Promise.all(
                    missingCountries.map(async (country) => [country, await fetchCountryWindow(firebaseRef.current, country, pageDate)])
                );

                if (cancelled) return;

                for (const [country, headlines] of results) {
                    sourcesByCountryRef.current[country] = headlines;
                }
            }

            setSources(createSourceMap(selections, sourcesByCountryRef.current));
            if (shouldShowGlobalLoading) {
                setLoading(false);
            }
        };

        void syncCountries();

        return () => {
            cancelled = true;
        };
    }, [ready, countries, pageDate, selections]);

    useEffect(() => {
        for (const [country, unsubscribe] of Object.entries(unsubscribeRef.current)) {
            if (!countries.includes(country) || pageDate) {
                unsubscribe();
                delete unsubscribeRef.current[country];
            }
        }

        if (!ready || pageDate) return;

        for (const country of countries) {
            if (unsubscribeRef.current[country]) continue;
            const firebaseApi = firebaseRef.current;
            const headlinesCollection = firebaseApi.getCountryCollectionRef(country, "headlines");
            const recentWindowStart = sub(new Date(), { days: 2 });
            const queryRef = firebaseApi.firestore.query(
                headlinesCollection,
                firebaseApi.firestore.where("timestamp", ">=", recentWindowStart),
                firebaseApi.firestore.orderBy("timestamp", "desc"),
                firebaseApi.firestore.limit(30),
            );

            unsubscribeRef.current[country] = firebaseApi.firestore.onSnapshot(queryRef, (snapshot) => {
                if (snapshot.empty) return;

                const incoming = snapshot.docs.map((doc) => normalizeHeadline(firebaseApi, country, doc));
                const previous = sourcesByCountryRef.current[country] || [];
                const merged = dedupeHeadlines([...incoming, ...previous]);
                sourcesByCountryRef.current[country] = merged;
                setSources(createSourceMap(selections, sourcesByCountryRef.current));
                setDate(new Date());
            });
        }

        return () => {
            for (const unsubscribe of Object.values(unsubscribeRef.current)) {
                unsubscribe();
            }
            unsubscribeRef.current = {};
        };
    }, [ready, countries, pageDate, selections, setDate]);

    useEffect(() => {
        setSources(createSourceMap(selections, sourcesByCountryRef.current));
    }, [selectionKeys, selections]);

    return { sources, loading };
}
