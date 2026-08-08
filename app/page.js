import siteData from "@/data/site-data.json";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SupplyLedger from "@/components/SupplyLedger";
import Process from "@/components/Process";
import DonorWall from "@/components/DonorWall";
import Footer from "@/components/Footer";

export default function Home() {
  const { site, dispatch, hero, trustMarks, ledger, process, donors, footer } = siteData;

  return (
    <main>
      <Header site={site} dispatch={dispatch} />
      <Hero hero={hero} trustMarks={trustMarks} />
      <SupplyLedger ledger={ledger} />
      <Process process={process} />
      <DonorWall donors={donors} />
      <Footer site={site} footer={footer} />
    </main>
  );
}
