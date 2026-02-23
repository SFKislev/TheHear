'use client'

import { useEffect, useState } from 'react';
import { firebaseConfig } from './firebaseConfig';
import { endOfDay, sub } from 'date-fns';
import { countries } from '../sources/countries';

let cachedFirestore;
let cachedDb;
let cachedLoadPromise;

export default function useFirebase() {
  const [firestore, setFirestore] = useState(cachedFirestore);
  const [db, setDb] = useState(cachedDb);
  const [ready, setReady] = useState(Boolean(cachedFirestore && cachedDb));

  useEffect(() => {
    const loadFirebase = async () => {
      if (cachedFirestore && cachedDb) {
        setDb(cachedDb);
        setFirestore(cachedFirestore);
        setReady(true);
        return;
      }

      if (!cachedLoadPromise) {
        cachedLoadPromise = (async () => {
          const { getApps, getApp, initializeApp } = await import('firebase/app');
          const _firestore = await import('firebase/firestore');
          const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
          const _db = _firestore.getFirestore(app);
          cachedFirestore = _firestore;
          cachedDb = _db;
          return { _firestore, _db };
        })();
      }

      const { _firestore, _db } = await cachedLoadPromise;
      setDb(_db);
      setFirestore(_firestore);
      setReady(true);
    }
    if (!firestore || !db) {
      loadFirebase();
    } else {
      setReady(true);
    }
  }, [firestore, db]);


  // ----------------- Helpers -----------------
  // ---------------------------------------------

  const getCountryCollectionRef = (countryName, collectionName) => {
    const countriesCollection = firestore.collection(db, '- Countries -');
    const countryDoc = firestore.doc(countriesCollection, countries[countryName].id);
    return firestore.collection(countryDoc, collectionName);
  }


  const prepareData = (doc) => {
    const data = doc.data();
    const cleanedData = JSON.parse(JSON.stringify(data));
    const timestamp = new Date(data.timestamp.seconds * 1000);
    return { id: doc.id, ...cleanedData, timestamp };
  }


  // ----------------- Summaries -----------------
  // ---------------------------------------------

  const getCountryDaySummaries = async (countryName, day, daysInclude = 1) => {
    const summariesCollection = getCountryCollectionRef(countryName, 'summaries');

    const theDay = endOfDay(day);
    const dayBefore = sub(theDay, { days: daysInclude });
    const q = firestore.query(
      summariesCollection,
      firestore.where('timestamp', '>=', dayBefore),
      firestore.where('timestamp', '<=', theDay),
      firestore.orderBy('timestamp', 'desc'),
    );

    let summaries = await firestore.getDocs(q);
    if (summaries.empty) return [];
    summaries = summaries.docs.map(doc => prepareData(doc));
    return summaries;
  }

  const getRecentSummaries = async (countryName, fromTime) => {
    const summariesCollection = getCountryCollectionRef(countryName, 'summaries');
    const q = firestore.query(
      summariesCollection,
      firestore.where('timestamp', '>', fromTime),
      firestore.orderBy('timestamp', 'desc'),
    );
    let summaries = await firestore.getDocs(q);
    if (summaries.empty) return [];
    summaries = summaries.docs.map(doc => prepareData(doc));
    return summaries;
  }

  const subscribeToSummaries = (countryName, callback) => {
    const summariesCollection = getCountryCollectionRef(countryName, 'summaries');
    const q = firestore.query(
      summariesCollection,
      firestore.orderBy('timestamp', 'desc'),
      firestore.limit(1),
    );
    return firestore.onSnapshot(q, snapshot => {
      if (snapshot.empty) return;
      const summaries = snapshot.docs.map(doc => prepareData(doc));
      callback(summaries);
    });
  }

  // ----------------- Daily Summaries -----------------
  // ---------------------------------------------------

  const getCountryDailySummary = async (countryName, day) => {
    const date = new Date(day);
    const dateString = date.toISOString().split('T')[0];

    const dailyCollection = getCountryCollectionRef(countryName, 'dailysummaries');
    const q = firestore.query(
      dailyCollection,
      firestore.where('date', '==', dateString),
    );
    const snapshot = await firestore.getDocs(q);
    if (snapshot.empty) return null;
    return prepareData(snapshot.docs[0]);
  }

  // ---------------- Global Overviews ----------------
  // --------------------------------------------------

  const subscribeToGlobalOverviews = (callback) => {
    const globalOverviewsRef = firestore.collection(db, '- metadata -', 'globalOverviews', 'overviews');
    const q = firestore.query(globalOverviewsRef, firestore.orderBy('timestamp', 'desc'), firestore.limit(1));

    return firestore.onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
      if (!snapshot.empty) {
        const data = prepareData(snapshot.docs[0]);

        data.overview = data.english?.overview || data.english || null;
        data.english = {
          headline: data.english?.headline || '',
          overview: data.english?.overview || ''
        };
        data.hebrew = {
          headline: data.hebrew?.headline || '',
          overview: data.hebrew?.overview || ''
        };
        callback(data);
      }
    });
  }

  return {
    ready,
    db, firestore,
    getCountryCollectionRef,
    prepareData,
    getCountryDaySummaries,
    getRecentSummaries,
    subscribeToSummaries,
    getCountryDailySummary,
    subscribeToGlobalOverviews
  }
}
