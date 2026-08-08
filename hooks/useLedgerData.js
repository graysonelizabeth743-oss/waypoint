"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // <-- adjust to match your project's path
import siteData from "@/data/site-data.json"; // <-- same default JSON the homepage already uses

// Falls back to whatever's in site-data.json under "ledger" — same default
// content LedgerDataManager seeds Firestore with, no separate copy to drift.
const defaultLedger = siteData.ledger;

export function useLedgerData() {
  const [source, setSource] = useState("default");
  const [dbLedger, setDbLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = doc(db, "settings", "ledger");
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        const remote = snap.data();
        if (snap.exists() && remote) {
          setSource(remote.source === "db" ? "db" : "default");
          setDbLedger(remote.ledger || defaultLedger);
        }
        // If the doc doesn't exist yet, just fall through — this hook is
        // read-only (no seeding), since anonymous visitors can't write per
        // the Firestore rules anyway. The admin page's LedgerDataManager
        // handles seeding on its first load.
        setLoading(false);
      },
      (err) => {
        console.error("Ledger read error, showing default data:", err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const ledger = source === "db" ? dbLedger || defaultLedger : defaultLedger;
  return { ledger, loading, error };
}
