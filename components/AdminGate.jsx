"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; // <-- adjust to match your project's path

export default function AdminGate({ children }) {
  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out
  const [role, setRole] = useState(undefined); // undefined = checking, null = no profile / not admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Track auth state.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setRole(null);
    });
    return () => unsubscribe();
  }, []);

  // Once signed in, watch this user's role in Firestore. If no profile doc
  // exists yet (e.g. the account was created directly in the Firebase
  // console, or existed before this role system did), create one now with
  // role "user" so the DB stays in sync for every account, not just ones
  // that went through /register.
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(ref);
        if (!snap.exists() && !cancelled) {
          await setDoc(ref, {
            email: user.email,
            role: "user",
            createdAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error("Could not verify/create user profile:", err);
      }
    })();

    const unsubscribe = onSnapshot(
      ref,
      (snap) => setRole(snap.exists() ? snap.data().role : null),
      (err) => {
        console.error("Could not read user role:", err);
        setRole(null);
      }
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  // Prefill the email field if arriving from /subscribe with ?email=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("email");
    if (prefill) setEmail(prefill);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Wrong email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => signOut(auth);

  // Still resolving auth state.
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-ink/50">
        Checking access…
      </div>
    );
  }

  // Not signed in -> login form only.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white/60 border border-ink/15 rounded-sm p-8"
        >
          <h1 className="font-display text-2xl mb-1">Admin sign in</h1>
          <p className="text-xs text-ink/50 font-mono mb-6">Ledger data access is restricted.</p>

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

          <label className="block mb-6">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-ink/20 rounded-sm px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="text-xs text-clay font-mono mb-4">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-xs font-mono uppercase px-4 py-3 bg-ink text-parchment rounded-sm disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-xs text-ink/50 font-mono mt-4 text-center">
            No account?{" "}
            <a href="/register" className="underline">
              Register
            </a>
          </p>
        </form>
      </div>
    );
  }

  // Signed in, still resolving role.
  if (role === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-ink/50">
        Checking permissions…
      </div>
    );
  }

  // Signed in but not an admin.
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
        <h1 className="font-display text-2xl">Access pending</h1>
        <p className="text-sm text-ink/60 max-w-sm">
          You're signed in as {user.email}, but this account doesn't have admin access yet. Ask
          an existing admin to grant it from the user management page.
        </p>
        <button
          onClick={handleLogout}
          className="text-xs font-mono uppercase px-4 py-2 border border-ink/20 rounded-sm hover:bg-ink/5"
        >
          Sign out
        </button>
      </div>
    );
  }

  // Signed in and confirmed admin.
  return (
    <div>
      <div className="flex items-center justify-between px-6 py-3 bg-ink text-parchment text-xs font-mono">
        <div className="flex items-center gap-4">
          <span>Signed in as {user.email}</span>
          <a href="/admin/users" className="uppercase underline hover:no-underline">
            Manage users
          </a>
        </div>
        <button onClick={handleLogout} className="uppercase underline hover:no-underline">
          Sign out
        </button>
      </div>
      {children}
    </div>
  );
}
