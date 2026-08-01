import { useEffect } from "react";

/**
 * Lenis smooth scrolling + GSAP ScrollTrigger reveal-on-scroll, wired up once
 * per page.
 *
 * Reveals any `.reveal`-classed element as it scrolls into view. The header's
 * own "scrolled past top" state is handled separately inside `<SiteHeader>` —
 * that's a header concern, not a page smooth-scroll concern.
 *
 * Call once per top-level page component. Cleans up on unmount, so navigating
 * between pages never leaves a stray Lenis/ScrollTrigger instance running.
 */
export function useSmoothScroll(): void {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, gsapMod, stMod] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lenis = new Lenis({ lerp: 0.1, smoothWheel: !reduced });
      lenis.on("scroll", ScrollTrigger.update);
      const tickerCb = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);

      const reveals = gsap.utils.toArray<HTMLElement>(".reveal");
      reveals.forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      cleanup = () => {
        ScrollTrigger.getAll().forEach((s) => s.kill());
        gsap.ticker.remove(tickerCb);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
}
