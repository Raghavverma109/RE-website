import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, trigger: boolean, duration: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, trigger, duration]);

  return value;
}

/**
 * One animated count-up stat tile.
 *
 * Triggers itself the first time it scrolls into view, via its own
 * IntersectionObserver — unlike the original homepage-only version, the
 * parent page does not need to wire up a ref + GSAP ScrollTrigger just to
 * tell this component when to start counting.
 */
export function StatCounter({
  target,
  suffix,
  label,
  duration = 1600,
  className,
  valueClassName = "text-brand",
  labelClassName = "text-charcoal",
}: {
  target: number;
  suffix?: string;
  label: string;
  duration?: number;
  className?: string;
  /** Color/weight for the big number — override on dark backgrounds. */
  valueClassName?: string;
  /** Color/weight for the label — override on dark backgrounds. */
  labelClassName?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const value = useCountUp(target, visible, duration);

  return (
    <div ref={ref} className={className ?? "text-center"}>
      <div className={`font-display text-2xl font-bold sm:text-4xl md:text-5xl ${valueClassName}`}>
        {value}
        {suffix}
      </div>
      <div className={`mt-2 text-sm uppercase tracking-widest ${labelClassName}`}>{label}</div>
    </div>
  );
}
