type TimelineItem = { year: string; title: string; desc: string };

/**
 * Vertical timeline — one node per entry, connected by a single rule down the
 * left edge. Stacks fine on mobile since it was never horizontal to begin
 * with (a horizontal timeline would need its own overflow/scroll handling
 * that a 5-entry list doesn't justify).
 */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative border-l-2 border-brand/15 pl-8">
      {items.map((item, i) => (
        <div key={item.year} className={`reveal relative ${i > 0 ? "mt-10" : ""}`}>
          <div className="absolute -left-[calc(2rem+7px)] top-1 h-3.5 w-3.5 rounded-full border-2 border-brand bg-white" />
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
            {item.year}
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold text-ink">{item.title}</h3>
          <p className="mt-1 text-sm text-charcoal">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
