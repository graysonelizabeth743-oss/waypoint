"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // <-- adjust to wherever your project exports `db` from
import SupplyLedger from "@/components/SupplyLedger"; // <-- adjust to your existing ledger display component

// One Firestore doc holds both the admin's choice of data source AND the
// editable ledger content, so every visitor sees the same thing regardless
// of who's browsing.
const SETTINGS_COLLECTION = "settings";
const SETTINGS_DOC_ID = "ledger";

// Fallback shown whenever source === "default", or if the DB is unreachable.
const defaultLedgerData = {
  title: "Gaza Relief Supply Ledger",
  subtitle: "Essential supply units delivered during this operational cycle, verified upon entry.",
  cycleGoal: 25000,
  cycleRaised: 16420,
  currency: "$",
  entries: [
    { code: "WTR-01", item: "Clean water jerrycans (5L)", delivered: 4200, unit: "cans" },
    { code: "FOD-02", item: "Emergency family food parcels", delivered: 3150, unit: "parcels" },
    { code: "MED-03", item: "Trauma & medical response kits", delivered: 1890, unit: "kits" },
    { code: "SHL-04", item: "Weatherproof shelter kits & tarps", delivered: 1120, unit: "kits" },
  ],
};

export default function LedgerDataManager() {
  const [source, setSource] = useState("default"); // "default" | "db"
  const [dbLedger, setDbLedger] = useState(null); // what's actually stored in Firestore
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
          const nextLedger = remote.ledger || defaultLedgerData;
          setSource(nextSource);
          setDbLedger(nextLedger);
          setForm((prev) => prev ?? nextLedger); // don't clobber active edits
          setLoading(false);
          return;
        }

        // Nothing there yet — seed with defaults, source starts as "default".
        const seed = { source: "default", ledger: defaultLedgerData };
        try {
          await setDoc(ref, seed);
        } catch (seedErr) {
          console.error("Could not seed settings/ledger doc:", seedErr);
        }
        setSource("default");
        setDbLedger(defaultLedgerData);
        setForm(defaultLedgerData);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore read error, falling back to default ledger:", err);
        setError(err);
        setSource("default");
        setDbLedger(defaultLedgerData);
        setForm(defaultLedgerData);
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

  // ---- admin: edit + save ledger content into the DB ----------------------
  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateEntry = (i, key, value) => {
    setForm((prev) => {
      const entries = prev.entries.map((e, idx) => (idx === i ? { ...e, [key]: value } : e));
      return { ...prev, entries };
    });
  };
  const addEntry = () =>
    setForm((prev) => ({
      ...prev,
      entries: [...prev.entries, { code: "", item: "", delivered: 0, unit: "" }],
    }));
  const removeEntry = (i) =>
    setForm((prev) => ({ ...prev, entries: prev.entries.filter((_, idx) => idx !== i) }));

  const handleSaveLedger = async (e) => {
    e.preventDefault();
    const ok = await persist({ ledger: form });
    setStatus(ok ? "saved" : "error");
    setTimeout(() => setStatus(null), 2500);
  };

  if (loading || !form) {
    return <div className="py-12 text-center font-mono text-sm text-ink/50">Loading ledger…</div>;
  }

  const effectiveLedger = source === "db" ? dbLedger || defaultLedgerData : defaultLedgerData;

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
            <h3 className="font-display text-lg">Ledger data source</h3>
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

        {/* Ledger editor — always edits the DB copy, regardless of which
            source is currently live, so admins can prep DB data before
            switching over. */}
        <form onSubmit={handleSaveLedger} className="bg-white/50 border border-ink/15 rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-ink/50">
              Edit database ledger
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
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Currency</span>
              <input
                className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
              />
            </label>
            <label className="block mb-3 sm:col-span-2">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Subtitle</span>
              <textarea
                className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
                rows={2}
                value={form.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
              />
            </label>
            <label className="block mb-3">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Cycle goal</span>
              <input
                type="number"
                className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
                value={form.cycleGoal}
                onChange={(e) => updateField("cycleGoal", Number(e.target.value))}
              />
            </label>
            <label className="block mb-3">
              <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Cycle raised</span>
              <input
                type="number"
                className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
                value={form.cycleRaised}
                onChange={(e) => updateField("cycleRaised", Number(e.target.value))}
              />
            </label>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wide text-ink/50">Entries</span>
            <button
              type="button"
              onClick={addEntry}
              className="text-xs font-mono uppercase px-2 py-1 border border-ink/20 rounded-sm hover:bg-ink/5"
            >
              + Add entry
            </button>
          </div>
          {form.entries.map((entry, i) => (
            <div key={i} className="border border-ink/10 rounded-sm p-3 mb-3 bg-cream/60">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                <input
                  className="border border-ink/20 rounded-sm px-2 py-1 text-xs font-mono"
                  placeholder="Code"
                  value={entry.code}
                  onChange={(e) => updateEntry(i, "code", e.target.value)}
                />
                <input
                  className="border border-ink/20 rounded-sm px-2 py-1 text-xs sm:col-span-2"
                  placeholder="Item"
                  value={entry.item}
                  onChange={(e) => updateEntry(i, "item", e.target.value)}
                />
                <input
                  type="number"
                  className="border border-ink/20 rounded-sm px-2 py-1 text-xs"
                  placeholder="Delivered"
                  value={entry.delivered}
                  onChange={(e) => updateEntry(i, "delivered", Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  className="border border-ink/20 rounded-sm px-2 py-1 text-xs w-32"
                  placeholder="Unit"
                  value={entry.unit}
                  onChange={(e) => updateEntry(i, "unit", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeEntry(i)}
                  className="text-xs font-mono uppercase text-clay hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </form>
      </div>

      {/* Live preview — this is what actually renders on the site */}
      <SupplyLedger ledger={effectiveLedger} />
    </div>
  );
}
