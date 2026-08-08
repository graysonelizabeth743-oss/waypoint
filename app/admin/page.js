"use client";

import AdminGate from "@/components/AdminGate"; // <-- adjust to match your project's path
import LedgerDataManager from "@/components/LedgerDataManager"; // <-- adjust to match your project's path
import DonorDataManager from "@/components/DonorDataManager"; // <-- adjust to match your project's path

export default function AdminPage() {
  return (
    <AdminGate>
      <LedgerDataManager />
      <DonorDataManager />
    </AdminGate>
  );
}
