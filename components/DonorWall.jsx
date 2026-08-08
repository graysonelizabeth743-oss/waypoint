export default function DonorWall({ donors }) {
  if (!donors) return null;
  const recent = donors.recent || [];

  return (
    <section id="donors" className="bg-cream py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-display text-3xl md:text-4xl mb-2">{donors.title}</h2>
        <p className="text-ink/60 max-w-xl mb-10">{donors.subtitle}</p>
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {recent.map((d, i) => (
            <li key={i} className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-sage w-16 shrink-0">{d.time}</span>
                <div>
                  <span className="font-body font-medium">{d.name}</span>
                  {d.note && <span className="text-ink/50 text-sm"> — {d.note}</span>}
                </div>
              </div>
              <span className="font-mono text-sm text-clay shrink-0">${d.amount}</span>
            </li>
          ))}
          {recent.length === 0 && (
            <li className="py-6 text-center text-sm text-ink/40 italic">No donors yet.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
