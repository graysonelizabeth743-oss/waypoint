"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // <-- adjust to match your project's path
import DonorWall from "@/components/DonorWall"; // <-- adjust to match your project's path

const SETTINGS_COLLECTION = "settings";
const SETTINGS_DOC_ID = "donors";

// Fallback shown whenever source === "default", or if the DB is unreachable.
const defaultDonorData = {
  title: "Recent Support",
  subtitle: "Direct contributions logged in the last 48 hours.",
  recent: [
    { name: "R. Okafor", amount: 250, note: "For clean water distribution", time: "14 min ago" },
    { name: "Anonymous", amount: 1000, note: "Match for emergency medical supplies", time: "52 min ago" },
    { name: "M. Haddad", amount: 75, note: "For family food parcels", time: "1 hr ago" },
    { name: "The Larsen Family", amount: 500, note: "Emergency shelter aid", time: "3 hr ago" },
    { name: "Anonymous", amount: 40, note: "", time: "5 hr ago" },
  ],
};

const blankDonor = { name: "", amount: 0, note: "", time: "just now" };

export default function DonorDataManager() {
  const [source, setSource] = useState("default"); // "default" | "db"
  const [dbDonors, setDbDonors] = useState(null); // what's stored in Firestore
  const [form, setForm] = useState(null); // local edit buffer
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null); // "saved" | "error" | null

  // ---- live read + one-time seed ----------------------------------------
  useEffect(() => {
    const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

    const unsubscribe = onSnapshot(
      ref,
      async (snap) => {
        const remote = snap.data();

        if (snap.exists() && remote) {
          const nextSource = remote.source === "db" ? "db" : "default";
          const nextDonors = remote.donors || defaultDonorData;
          setSource(nextSource);
          setDbDonors(nextDonors);
          setForm((prev) => prev ?? nextDonors); // don't clobber active edits
          setLoading(false);
          return;
        }

        // Nothing there yet — seed with defaults, source starts as "default".
        const seed = { source: "default", donors: defaultDonorData };
        try {
          await setDoc(ref, seed);
        } catch (seedErr) {
          console.error("Could not seed settings/donors doc:", seedErr);
        }
        setSource("default");
        setDbDonors(defaultDonorData);
        setForm(defaultDonorData);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore read error, falling back to default donors:", err);
        setError(err);
        setSource("default");
        setDbDonors(defaultDonorData);
        setForm(defaultDonorData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const persist = useCallback(async (patch) => {
    setSaving(true);
    setError(null);
    try {
      const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      await setDoc(ref, patch, { merge: true });
      return true;
    } catch (e) {
      console.error("Failed to save:", e);
      setError(e);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // ---- admin: switch which source is live --------------------------------
  const handleSourceChange = async (next) => {
    setSource(next); // optimistic
    await persist({ source: next });
  };

  // ---- admin: edit + save donor content into the DB -----------------------
  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateDonor = (i, key, value) => {
    setForm((prev) => {
      const recent = prev.recent.map((d, idx) => (idx === i ? { ...d, [key]: value } : d));
      return { ...prev, recent };
    });
  };
  const addDonor = () =>
    setForm((prev) => ({ ...prev, recent: [{ ...blankDonor }, ...prev.recent] }));
  const removeDonor = (i) =>
    setForm((prev) => ({ ...prev, recent: prev.recent.filter((_, idx) => idx !== i) }));

  const handleSaveDonors = async (e) => {
    e.preventDefault();
    const ok = await persist({ donors: form });
    setStatus(ok ? "saved" : "error");
    setTimeout(() => setStatus(null), 2500);
  };

  if (loading || !form) {
    return <div className="py-12 text-center font-mono text-sm text-ink/50">Loading donors…</div>;
  }

  const effectiveDonors = source === "db" ? dbDonors || defaultDonorData : defaultDonorData;

  return (
    <div>
      {error && (
        <div className="bg-clay/10 text-clay text-xs font-mono text-center py-2">
          Couldn't reach Firestore — showing default data. ({error.message})
        </div>
      )}

      {/* Admin controls */}
      <div className="max-w-5xl mx-auto px-6 py-8 border-b border-ink/10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h3 className="font-display text-lg">Donor data source</h3>
            <p className="text-xs text-ink/50 font-mono mt-1">
              Controls what every visitor sees on the site right now.
            </p>
          </div>
          <div className="flex border border-ink/20 rounded-sm overflow-hidden font-mono text-xs uppercase tracking-widest">
            <button
              type="button"
              onClick={() => handleSourceChange("default")}
              className={`px-4 py-2 ${source === "default" ? "bg-ink text-parchment" : "bg-white/50"}`}
            >
              Default data
            </button>
            <button
              type="button"
              onClick={() => handleSourceChange("db")}
              className={`px-4 py-2 ${source === "db" ? "bg-ink text-parchment" : "bg-white/50"}`}
            >
              Database
            </button>
          </div>
        </div>

        {/* Donor editor — always edits the DB copy, regardless of which
            source is currently live, so admins can prep donors before
            switching over. */}
        <form onSubmit={handleSaveDonors} className="bg-white/50 border border-ink/15 rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-ink/50">
              Edit database donors
            </span>
            <div className="flex items-center gap-3">
              {status === "saved" && <span className="text-xs text-sage font-mono">Saved ✓</span>}
              {status === "error" && <span className="text-xs text-clay font-mono">Save failed</span>}
              <button
                type="submit"
                disabled={saving}
                className="text-xs font-mono uppercase px-4 py-2 bg-ink text-parchment rounded-sm disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save to database"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mb-4">
            <label className="block mb-3">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Title</span>
              <input
                className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </label>
            <label className="block mb-3">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Subtitle</span>
              <input
                className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
                value={form.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
              />
            </label>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wide text-ink/50">Recent donors</span>
            <button
              type="button"
              onClick={addDonor}
              className="text-xs font-mono uppercase px-2 py-1 border border-ink/20 rounded-sm hover:bg-ink/5"
            >
              + Add donor
            </button>
          </div>
          {form.recent.map((donor, i) => (
            <div key={i} className="border border-ink/10 rounded-sm p-3 mb-3 bg-cream/60">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                <input
                  className="border border-ink/20 rounded-sm px-2 py-1 text-xs"
                  placeholder="Name (or Anonymous)"
                  value={donor.name}
                  onChange={(e) => updateDonor(i, "name", e.target.value)}
                />
                <input
                  type="number"
                  className="border border-ink/20 rounded-sm px-2 py-1 text-xs"
                  placeholder="Amount"
                  value={donor.amount}
                  onChange={(e) => updateDonor(i, "amount", Number(e.target.value))}
                />
                <input
                  className="border border-ink/20 rounded-sm px-2 py-1 text-xs sm:col-span-2"
                  placeholder="Note (optional)"
                  value={donor.note}
                  onChange={(e) => updateDonor(i, "note", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  className="border border-ink/20 rounded-sm px-2 py-1 text-xs w-40"
                  placeholder='Time label, e.g. "14 min ago"'
                  value={donor.time}
                  onChange={(e) => updateDonor(i, "time", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeDonor(i)}
                  className="text-xs font-mono uppercase text-clay hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {form.recent.length === 0 && (
            <p className="text-xs text-ink/40 italic">No donors — click "Add donor" or switch source to Default.</p>
          )}
        </form>
      </div>

      {/* Live preview — this is what actually renders on the site */}
      <DonorWall donors={effectiveDonors} />
    </div>
  );
}
