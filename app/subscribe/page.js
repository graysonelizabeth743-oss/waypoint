"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // <-- adjust to match your project's path

export default function SubscribePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const normalized = email.trim().toLowerCase();

    try {
      // Look the email up directly in the users collection.
      // Requires `allow read: if true` (or an equivalent list rule) on
      // /users in firestore.rules — see the note in chat about the
      // privacy tradeoff this involves.
      const q = query(collection(db, "users"), where("email", "==", normalized));
      const snap = await getDocs(q);

      if (!snap.empty) {
        // Email belongs to an existing account -> send to login, prefilled,
        // instead of treating this as a new subscription.
        router.push(`/admin?email=${encodeURIComponent(normalized)}`);
        return;
      }

      await addDoc(collection(db, "subscribers"), {
        email: normalized,
        subscribedAt: serverTimestamp(),
      });
      setSubscribed(true);
    } catch (err) {
      console.error("Subscription failed:", err);
      setError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (subscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6 text-center">
        <div>
          <h1 className="font-display text-2xl mb-2">Thanks for subscribing to Waypoint!</h1>
          <p className="text-sm text-ink/60">We'll keep you posted on relief updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/60 border border-ink/15 rounded-sm p-8"
      >
        <h1 className="font-display text-2xl mb-1">Subscribe</h1>
        <p className="text-xs text-ink/50 font-mono mb-6">Get updates from Waypoint Relief.</p>

        <label className="block mb-6">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {error && <p className="text-xs text-clay font-mono mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-xs font-mono uppercase px-4 py-3 bg-ink text-parchment rounded-sm disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
