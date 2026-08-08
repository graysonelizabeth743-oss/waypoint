"use client";

import { useState } from "react";

export default function Header({ site, dispatch }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "#ledger", label: "Ledger" },
    { href: "#process", label: "How it moves" },
    { href: "#donors", label: "Confirmations" },
    { href: "/subscribe", label: "Subscribe" },
  ];

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

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-8 text-sm text-ink/70">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-coral transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Mobile menu toggle — hidden from sm breakpoint up, where the full nav shows instead */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full text-ink/70 hover:text-coral transition-colors"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>

          <a
            href="/donate"
            className="rounded-full bg-coral px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-cream shadow-sm hover:bg-coral-deep transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <span aria-hidden="true">♥</span>
            <span className="hidden xs:inline">Donate Now</span>
            <span className="xs:hidden">Donate</span>
          </a>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          className="sm:hidden border-t border-ink/10 px-6 py-4 flex flex-col gap-4 text-sm text-ink/70 bg-cream/95"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="hover:text-coral transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
