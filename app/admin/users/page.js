"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase"; // <-- adjust to match your project's path
import AdminGate from "@/components/AdminGate"; // <-- adjust to match your project's path

function UserList() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.error("Could not load users:", err);
        setError(err);
      }
    );
    return () => unsubscribe();
  }, []);

  const toggleRole = async (u) => {
    const nextRole = u.role === "admin" ? "user" : "admin";
    setBusyId(u.id);
    try {
      await updateDoc(doc(db, "users", u.id), { role: nextRole });
    } catch (err) {
      console.error("Could not update role:", err);
      alert("Couldn't update that user's role — check the console.");
    } finally {
      setBusyId(null);
    }
  };

  if (error) {
    return (
      <p className="text-sm text-clay font-mono px-6 py-8">
        Couldn't load users: {error.message}
      </p>
    );
  }

  if (!users) {
    return <p className="text-sm text-ink/50 font-mono px-6 py-8">Loading users…</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-2xl mb-1">Manage users</h1>
      <p className="text-xs text-ink/50 font-mono mb-8">
        Grant or remove admin access. New registrations start as "user".
      </p>

      <div className="border border-ink/15 rounded-sm overflow-hidden bg-white/40">
        <div className="grid grid-cols-[1fr_100px_140px] gap-4 px-5 py-3 bg-ink text-parchment font-mono text-[11px] uppercase tracking-widest">
          <span>Email</span>
          <span>Role</span>
          <span className="text-right">Action</span>
        </div>
        {users.map((u, i) => {
          const isSelf = u.id === auth.currentUser?.uid;
          return (
            <div
              key={u.id}
              className={`grid grid-cols-[1fr_100px_140px] gap-4 px-5 py-4 items-center ${
                i % 2 === 0 ? "bg-white/50" : "bg-transparent"
              } border-t border-ink/10`}
            >
              <span className="font-body text-sm">
                {u.email} {isSelf && <span className="text-ink/40 text-xs">(you)</span>}
              </span>
              <span
                className={`font-mono text-xs uppercase ${
                  u.role === "admin" ? "text-sage" : "text-ink/50"
                }`}
              >
                {u.role || "user"}
              </span>
              <div className="text-right">
                <button
                  onClick={() => toggleRole(u)}
                  disabled={busyId === u.id || isSelf}
                  title={isSelf ? "You can't change your own role" : undefined}
                  className="text-xs font-mono uppercase px-3 py-1.5 border border-ink/20 rounded-sm hover:bg-ink/5 disabled:opacity-40"
                >
                  {busyId === u.id
                    ? "Saving…"
                    : u.role === "admin"
                    ? "Remove admin"
                    : "Make admin"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ManageUsersPage() {
  return (
    <AdminGate>
      <UserList />
    </AdminGate>
  );
}
