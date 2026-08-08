"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // <-- adjust to match your project's path
import siteData from "@/data/site-data.json"; // <-- same default JSON the homepage already uses

const defaultDonors = siteData.donors;

export function useDonorData() {
  const [source, setSource] = useState("default");
  const [dbDonors, setDbDonors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = doc(db, "settings", "donors");
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        const remote = snap.data();
        if (snap.exists() && remote) {
          setSource(remote.source === "db" ? "db" : "default");
          setDbDonors(remote.donors || defaultDonors);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Donors read error, showing default data:", err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const donors = source === "db" ? dbDonors || defaultDonors : defaultDonors;
  return { donors, loading, error };
}
