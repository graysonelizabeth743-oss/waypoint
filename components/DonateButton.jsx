// components/DonateButton.js
"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function DonateButton({ siteName = "Waypoint Relief" }) {
  const [amount, setAmount] = useState("25.00");
  const [paid, setPaid] = useState(false);

  // Uses your PayPal Client ID (falls back to "test" for instant rendering in dev)
  const paypalClientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";

  return (
    <div className="max-w-xl mx-auto rounded-3xl bg-cream p-8 sm:p-10 border border-ink/10 shadow-sm text-ink space-y-8">

      {/* Header Section */}
      <div className="text-center space-y-3 pb-6 border-b border-ink/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral/10 text-coral text-xs font-mono uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-coral"></span>
          </span>
          Direct Aid Dispatch
        </div>

        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
          Support {siteName}
        </h2>
        <p className="text-sm text-ink/70 max-w-md mx-auto leading-relaxed">
          Your contribution goes directly into our active ledger to deploy immediate relief. Select an amount or enter a custom value below.
        </p>
      </div>

      {paid ? (
        /* Success State */
        <div className="p-8 bg-coral/10 border border-coral/20 rounded-2xl text-center space-y-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-coral text-cream text-xl font-bold">
            ♥
          </span>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Donation Confirmed
          </h3>
          <p className="text-sm text-ink/80">
            Thank you for deploying <strong className="text-coral">${amount}</strong> into relief operations. Your support makes a direct impact.
          </p>
        </div>
      ) : (
        <>
          {/* Preset Amounts */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-widest text-ink/60">
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
                      ? "bg-coral text-cream border-coral shadow-sm scale-[1.02]"
                      : "bg-cream text-ink/80 border-ink/10 hover:border-ink/30 hover:text-ink"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-2">
            <label htmlFor="custom-amount" className="block text-xs font-mono uppercase tracking-widest text-ink/60">
              Or Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-ink/40">
                $
              </span>
              <input
                id="custom-amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 bg-white/50 border border-ink/10 rounded-xl text-lg font-semibold text-ink placeholder:text-ink/30 focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
              />
            </div>
          </div>

          {/* PayPal Integration Container */}
          <div className="pt-6 border-t border-ink/10 space-y-4">
            <div className="text-center text-xs font-mono uppercase tracking-widest text-ink/50">
              Secure Checkout via PayPal & Cards
            </div>

            <PayPalScriptProvider
              options={{
                clientId: paypalClientId,
                currency: "USD",
                intent: "capture",
                "enable-funding": "card,paylater",
              }}
            >
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "gold",
                  shape: "pill", // Matches rounded aesthetic
                  label: "donate",
                  height: 48,
                }}
                forceReRender={[amount]}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                      {
                        description: `Donation to ${siteName}`,
                        amount: {
                          currency_code: "USD",
                          value: amount && parseFloat(amount) > 0 ? amount : "25.00",
                        },
                      },
                    ],
                  });
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    await actions.order.capture();
                    setPaid(true);
                  }
                }}
                onError={(err) => {
                  console.error("PayPal Error:", err);
                }}
              />
            </PayPalScriptProvider>

            <p className="text-center text-xs text-ink/40">
              Encrypted end-to-end. No credit card details are stored on our servers.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
