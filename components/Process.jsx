export default function Process({ process }) {
  return (
    <section id="process" className="bg-ink text-parchment py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-display text-3xl md:text-4xl mb-2">How a delivery moves</h2>
        <p className="text-parchment/60 max-w-xl mb-14">
          Four checkpoints, each time-stamped, from first request to confirmed handoff.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-parchment/15">
          {process.map((step, i) => (
            <div key={step.stage} className="bg-ink px-6 py-8">
              <div className="font-mono text-xs text-amber mb-4">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-xl mb-2">{step.stage}</h3>
              <p className="text-sm text-parchment/65 leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
