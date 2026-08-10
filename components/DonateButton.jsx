// components/DonateButton.js
"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { collection, addDoc, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const RECENT_DONORS_CAP = 20;

export default function DonateButton({ siteName = "Waypoint Relief" }) {
  const [amount, setAmount] = useState("25.00");
  const [paid, setPaid] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Prevents the runtime crash if your client ID is missing
  if (!paypalClientId) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
        <strong>Configuration Error:</strong> Missing NEXT_PUBLIC_PAYPAL_CLIENT_ID env variable.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto rounded-3xl bg-amber-50 p-8 sm:p-10 border border-slate-900/10 shadow-sm text-slate-900 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3 pb-6 border-b border-slate-900/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-xs font-mono uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          Direct Aid Dispatch
        </div>

        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Support {siteName}
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Your contribution goes directly into our active ledger to deploy immediate relief.
        </p>
      </div>

      {paid ? (
        /* Success State */
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white text-xl font-bold">
            ♥
          </span>
          <h3 className="text-2xl font-semibold">Donation Confirmed</h3>
          <p className="text-sm text-slate-700">
            Thank you for deploying <strong className="text-rose-500">${amount}</strong> into relief operations.
          </p>
        </div>
      ) : (
        <>
          {/* Preset Amounts */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-widest text-slate-500">
              Select Amount (USD)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["10.00", "25.00", "50.00", "100.00"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all border ${
                    amount === preset
                      ? "bg-rose-500 text-white border-rose-500 shadow-sm scale-[1.02]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-2">
            <label htmlFor="custom-amount" className="block text-xs font-mono uppercase tracking-widest text-slate-500">
              Or Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
                $
              </span>
              <input
                id="custom-amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (parseFloat(val) < 0) return;
                  setAmount(val);
                }}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* PayPal Integration Container */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="text-center text-xs font-mono uppercase tracking-widest text-slate-400">
              Secure Checkout via PayPal & Cards
            </div>

            <PayPalScriptProvider
              options={{
                clientId: paypalClientId,
                currency: "USD",
                intent: "capture",
              }}
            >
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "gold",
                  shape: "pill",
                  label: "donate",
                  height: 48,
                }}
                forceReRender={[amount]}
                createOrder={(data, actions) => {
                  const finalAmount = amount && parseFloat(amount) >= 1 ? amount : "1.00";
                  return actions.order.create({
                    purchase_units: [
                      {
                        description: `Donation to ${siteName}`,
                        amount: {
                          currency_code: "USD",
                          value: finalAmount,
                        },
                      },
                    ],
                  });
                }}
                onApprove={async (data, actions) => {
                  setErrorMsg(null);
                  try {
                    // 1. Capture order strictly on client-side
                    const details = await actions.order.capture();
                    const capture = details.purchase_units[0].payments.captures[0];
                    const payer = details.payer;

                    const donatedAmount = Number(capture.amount.value);
                    const payerName = payer
                      ? `${payer.name?.given_name || ""} ${payer.name?.surname || ""}`.trim()
                      : "Anonymous";
                    const payerEmail = payer?.email_address || null;

                    // 2. Save raw payment audit record log
                    await addDoc(collection(db, "donations"), {
                      orderId: details.id,
                      captureId: capture.id,
                      amount: donatedAmount,
                      currency: capture.amount.currency_code,
                      payerEmail,
                      payerName,
                      status: details.status,
                      description: `Donation to ${siteName}`,
                      createdAt: serverTimestamp(),
                    });

                    // 3. Update public settings & manage cap within atomic
                    //    transaction. NOTE: settings/ledger and settings/donors
                    //    are nested docs — { source, ledger: {...} } and
                    //    { source, donors: {...} } — so the fields being
                    //    updated MUST use the nested path ("ledger.cycleRaised",
                    //    "donors.recent"), not top-level keys. Writing to a
                    //    top-level key instead silently creates a stray field
                    //    nothing reads, and gets rejected by the security
                    //    rules (which check the nested cycleRaised strictly
                    //    increased).
                    const donorsRef = doc(db, "settings", "donors");
                    const ledgerRef = doc(db, "settings", "ledger");

                    await runTransaction(db, async (transaction) => {
                      const ledgerDoc = await transaction.get(ledgerRef);
                      const ledgerData = ledgerDoc.exists() ? ledgerDoc.data() : {};
                      const currentTotal = ledgerData.ledger?.cycleRaised || 0;

                      const donorsDoc = await transaction.get(donorsRef);
                      const donorsData = donorsDoc.exists() ? donorsDoc.data() : {};
                      let recentDonors = donorsData.donors?.recent || [];

                      // Add the new donor to the front of the array.
                      // donatedAt is a plain number (Date.now()), not
                      // serverTimestamp() — Firestore doesn't allow that
                      // sentinel inside array elements. DonorWall computes
                      // "X min ago" from this number on render.
                      const newDonorEntry = {
                        name: payerName,
                        amount: donatedAmount,
                        note: `Donation to ${siteName}`,
                        donatedAt: Date.now(),
                      };

                      recentDonors = [newDonorEntry, ...recentDonors].slice(
                        0,
                        RECENT_DONORS_CAP
                      );

                      // Commit atomic updates, at the correct nested paths.
                      transaction.update(ledgerRef, {
                        "ledger.cycleRaised": currentTotal + donatedAmount,
                      });

                      transaction.update(donorsRef, {
                        "donors.recent": recentDonors,
                      });
                    });

                    setAmount(String(donatedAmount));
                    setPaid(true);
                  } catch (err) {
                    console.error("Firestore Transaction Error: ", err);
                    setErrorMsg(
                      "Donation captured successfully, but ledger synchronization failed."
                    );
                  }
                }}
                onError={(err) => {
                  console.error("PayPal Execution Error: ", err);
                  setErrorMsg("Could not process payment via PayPal. Please try again.");
                }}
              />
            </PayPalScriptProvider>
          </div>
        </>
      )}
    </div>
  );
}
