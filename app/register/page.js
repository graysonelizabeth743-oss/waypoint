"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; // <-- adjust to match your project's path

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Every new account starts as a plain "user" — never "admin".
      // Firestore rules must also enforce this (see README) so this can't
      // be bypassed by calling the SDK directly with role: "admin".
      await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        role: "user",
        createdAt: serverTimestamp(),
      });

      setDone(true);
    } catch (err) {
      console.error("Registration failed:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("An account with that email already exists.");
      } else if (err.code === "auth/invalid-email") {
        setError("That email address looks invalid.");
      } else {
        setError("Couldn't create the account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <div className="w-full max-w-sm bg-white/60 border border-ink/15 rounded-sm p-8 text-center">
          <h1 className="font-display text-2xl mb-2">Account created</h1>
          <p className="text-sm text-ink/60">
            You're signed in, but admin tools stay locked until an existing admin grants you
            access.
          </p>
          <a
            href="/admin"
            className="inline-block mt-6 text-xs font-mono uppercase px-4 py-3 bg-ink text-parchment rounded-sm"
          >
            Go to admin area
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm bg-white/60 border border-ink/15 rounded-sm p-8"
      >
        <h1 className="font-display text-2xl mb-1">Create account</h1>
        <p className="text-xs text-ink/50 font-mono mb-6">
          New accounts don't get admin access automatically.
        </p>

        <label className="block mb-4">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="username"
            className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Password
          </span>
          <input
            type="password"
            required
            autoComplete="new-password"
            className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="block mb-6">
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Confirm password
          </span>
          <input
            type="password"
            required
            autoComplete="new-password"
            className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>

        {error && <p className="text-xs text-clay font-mono mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-xs font-mono uppercase px-4 py-3 bg-ink text-parchment rounded-sm disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-xs text-ink/50 font-mono mt-4 text-center">
          Already have an account?{" "}
          <a href="/admin" className="underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
