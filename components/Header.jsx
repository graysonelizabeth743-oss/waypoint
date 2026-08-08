export default function Header({ site, dispatch }) {
  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-ink/10">
      <div className="flex items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-cream">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 1.5c2.5 2.2 4 4.4 4 6.3A4 4 0 018 12a4 4 0 01-4-4.2c0-1.9 1.5-4.1 4-6.3z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            {site.name}
          </span>
        </a>
        <div className="hidden md:flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-coral"></span>
          </span>
          {dispatch.status} · {dispatch.location}
        </div>
        <nav className="hidden sm:flex items-center gap-8 text-sm text-ink/70">
          <a href="#ledger" className="hover:text-coral transition-colors">Ledger</a>
          <a href="#process" className="hover:text-coral transition-colors">How it moves</a>
          <a href="#donors" className="hover:text-coral transition-colors">Confirmations</a>
          <a href="/subscribe" className="hover:text-coral transition-colors">Subscribe</a>
        </nav>
        <a
          href="/donate"
          className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-cream shadow-sm hover:bg-coral-deep transition-colors flex items-center gap-1.5"
        >
          <span aria-hidden="true">♥</span> Donate Now
        </a>
      </div>
    </header>
  );
}
