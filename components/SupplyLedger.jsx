function formatNumber(n) {
  return Number(n || 0).toLocaleString("en-US");
}

export default function SupplyLedger({ ledger }) {
  if (!ledger) return null;

  const entries = ledger.entries || [];
  const goal = Number(ledger.cycleGoal) || 0;
  const raised = Number(ledger.cycleRaised) || 0;
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <section id="ledger" className="bg-cream py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-2">
          <h2 className="font-display text-3xl md:text-4xl">{ledger.title}</h2>
          <span className="font-mono text-xs uppercase tracking-widest text-sage">
            {pct}% of cycle goal
          </span>
        </div>
        <p className="text-ink/60 max-w-xl mb-10">{ledger.subtitle}</p>

        {/* Funding bar styled as a filled ledger strip */}
        <div className="mb-14">
          <div className="flex justify-between font-mono text-sm mb-2">
            <span>
              {ledger.currency}
              {formatNumber(raised)} confirmed
            </span>
            <span className="text-ink/50">
              goal {ledger.currency}
              {formatNumber(goal)}
            </span>
          </div>
          <div className="h-3 w-full bg-ink/10 rounded-sm overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-clay to-amber"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Ledger entries table */}
        <div className="border border-ink/15 rounded-sm overflow-hidden bg-white/40">
          <div className="grid grid-cols-[80px_1fr_120px_100px] gap-4 px-5 py-3 bg-ink text-parchment font-mono text-[11px] uppercase tracking-widest">
            <span>Code</span>
            <span>Item</span>
            <span className="text-right">Delivered</span>
            <span className="text-right">Unit</span>
          </div>
          {entries.map((entry, i) => (
            <div
              key={entry.code || i}
              className={`grid grid-cols-[80px_1fr_120px_100px] gap-4 px-5 py-4 items-center ${
                i % 2 === 0 ? "bg-white/50" : "bg-transparent"
              } border-t border-ink/10`}
            >
              <span className="font-mono text-xs text-clay">{entry.code}</span>
              <span className="font-body text-sm">{entry.item}</span>
              <span className="font-mono text-sm text-right tabular-nums">
                {formatNumber(entry.delivered)}
              </span>
              <span className="font-mono text-xs text-right text-ink/50 uppercase">
                {entry.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
