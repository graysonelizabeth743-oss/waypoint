"use client";

import siteData from "@/data/site-data.json";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SupplyLedger from "@/components/SupplyLedger";
import Process from "@/components/Process";
import DonorWall from "@/components/DonorWall";
import Footer from "@/components/Footer";
import { useLedgerData } from "@/hooks/useLedgerData";
import { useDonorData } from "@/hooks/useDonorData";

export default function Home() {
  const { site, dispatch, hero, trustMarks, process, footer } = siteData;
  const { ledger, loading: ledgerLoading } = useLedgerData();
  const { donors, loading: donorsLoading } = useDonorData();

  return (
    <main>
      <Header site={site} dispatch={dispatch} />
      <Hero hero={hero} trustMarks={trustMarks} />
      {!ledgerLoading && <SupplyLedger ledger={ledger} />}
      <Process process={process} />
      {!donorsLoading && <DonorWall donors={donors} />}
      <Footer site={site} footer={footer} />
    </main>
  );
}
