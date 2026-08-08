// app/donate/page.js
import DonateButton from "@/components/DonateButton";

export default function DonatePage() {
  const site = { name: "Waypoint Relief" };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-cream flex flex-col items-center justify-center p-6 sm:p-12">
      <DonateButton siteName={site.name} />
    </main>
  );
}
