# Waypoint Relief

An original, coursework demonstration landing page for a fictional relief-logistics
charity, built with Next.js (App Router), Tailwind CSS, and plain JavaScript.

This is **not** a clone of any real or existing site. All copy, branding, and data
are original and stored in a single JSON file so the UI is fully data-driven.

## Structure

```
app/
  layout.js       Root layout, font loading, metadata
  page.js         Assembles the page from data/site-data.json
  globals.css     Base styles, custom texture utilities
components/
  Header.jsx      Sticky nav + "dispatch ticket" status strip
  Hero.jsx        Hero section
  SupplyLedger.jsx  Signature element: itemized aid-delivery ledger + progress bar
  Process.jsx     4-step delivery process
  DonorWall.jsx   Recent contribution confirmations
  Footer.jsx      Footer + legal links
data/
  site-data.json  ALL site content: name, copy, ledger entries, donors, links, etc.
```

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Editing content

Everything visible on the page — the site name, hero copy, ledger line items,
progress numbers, recent donor entries, and footer links — comes from
`data/site-data.json`. Edit that file and the page updates automatically;
no component code needs to change.

## Design notes

- Palette: deep ink green/black, warm parchment, amber + clay accents — a
  "field dispatch / supply ledger" feel rather than a generic charity template.
- Type: Fraunces (display serif), IBM Plex Sans (body), IBM Plex Mono (data/ledger numerals).
- Signature element: the Supply Ledger table, styled like a logistics manifest
  with item codes, delivered counts, and units, paired with a funding bar.
