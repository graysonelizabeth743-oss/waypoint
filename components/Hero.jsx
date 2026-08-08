export default function Hero({ hero, trustMarks }) {
  return (
    <section id="top" className="bg-cream text-ink">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-coral mb-6">
            <span className="h-2 w-2 rounded-full bg-coral" />
            {hero.eyebrow}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-[3.4rem] font-semibold leading-[1.08] max-w-xl text-ink">
            {hero.headline}
          </h1>

          <p className="mt-6 max-w-lg text-base md:text-lg text-ink/65 leading-relaxed">
            {hero.subhead}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="/donate"
              className="rounded-full bg-coral px-7 py-3.5 text-sm font-semibold text-cream shadow-md shadow-coral/20 hover:bg-coral-deep transition-colors flex items-center gap-2"
            >
              <span aria-hidden="true">♥</span> {hero.primaryCta}
            </a>
            <a
              href="#ledger"
              className="rounded-full border border-ink/20 px-7 py-3.5 text-sm font-semibold text-ink hover:border-coral hover:text-coral transition-colors"
            >
              {hero.secondaryCta}
            </a>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-xs text-ink/50">
            {trustMarks.map((mark) => (
              <div key={mark.label} className="flex items-center gap-1.5">
                <span className="text-sage">✓</span>
                {mark.label}
              </div>
            ))}
          </div>
        </div>

        {/* Original illustration — a supply route, not a real photo */}
        <div className="relative rounded-3xl bg-gradient-to-br from-coral-light/40 via-cream to-sage/10 border border-ink/10  aspect-[4/3] flex items-center justify-center overflow-hidden">
          <img src="gaza.jpg" className="w-full h-full bg-cover" />
        </div>
      </div>
    </section>
  );
}
