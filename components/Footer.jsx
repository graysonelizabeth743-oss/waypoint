export default function Footer({ site, footer }) {
  return (
    <footer id="donate" className="bg-ink text-parchment">
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-10 mb-14">
          <div>
            <span className="font-display text-xl">{site.name}</span>
            <p className="mt-3 text-sm text-parchment/60 leading-relaxed max-w-sm">
              {footer.description}
            </p>
            <a
              href={`mailto:${site.email}`}
              className="inline-block mt-4 text-sm text-amber hover:underline"
            >
              {site.email}
            </a>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-parchment/50 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {footer.links.quick.map((link) => (
                <li key={link}>
                  <a href="#" className="text-parchment/75 hover:text-amber transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-parchment/50 mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              {footer.links.legal.map((link) => (
                <li key={link}>
                  <a href="#" className="text-parchment/75 hover:text-amber transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="dashed-rule text-parchment/20 mb-6" />

        <div className="flex flex-col sm:flex-row justify-between gap-3 text-xs font-mono text-parchment/40">
          <span>© {site.year} {site.name}. All rights reserved.</span>
          <span>Demonstration project — coursework use only, not a real charity.</span>
        </div>
      </div>
    </footer>
  );
}
