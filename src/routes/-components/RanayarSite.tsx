import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Zap,
  BatteryCharging,
  Gauge,
  ArrowRight,
  Play,
  ShieldCheck,
  Wrench,
  Factory,
  Award,
  HeadphonesIcon,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { allMedia, getCategory } from "@/content";
import { Img } from "@/components/media/img";
import { GalleryStrip } from "@/components/media/gallery-strip";
import { PlantSlider } from "@/components/media/plant-slider";
import { Lightbox } from "@/components/media/lightbox";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StatCounter } from "@/components/stat-counter";
import { image } from "@/lib/media";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

const capabilities = [
  {
    icon: Factory,
    title: "In-house R&D + Manufacturing",
    desc: "From concept to production under one roof.",
  },
  {
    icon: BatteryCharging,
    title: "Battery & BMS Engineering",
    desc: "In-house pack design, testing and battery management systems.",
  },
  {
    icon: Gauge,
    title: "Range & Performance Testing",
    desc: "Every platform validated on real Indian roads before it ships.",
  },
  { icon: Wrench, title: "Custom Fleet Builds", desc: "Cargo and passenger EVs tailored to your route." },
  {
    icon: HeadphonesIcon,
    title: "After-sales Support",
    desc: "Nationwide service and parts network.",
  },
  { icon: Award, title: "Certified Processes", desc: "ISO-aligned quality and traceability." },
];

const testimonials = [
  {
    quote:
      "The BESTIVA fleet has been the most reliable EV we've deployed. Service response is outstanding.",
    name: "Anwar Sheikh",
    company: "Fleet Manager, CityMove",
  },
  {
    quote:
      "RAFANDER's range held up exactly as promised across a full delivery shift — no surprises, no range anxiety.",
    name: "Rakesh Menon",
    company: "Head of Ops, Vayu Logistics",
  },
  {
    quote:
      "Our E-Cart Loaders cut fuel cost to zero on the yard run. Charging is simple and uptime has been excellent.",
    name: "Priya Iyer",
    company: "Plant Manager, Meridian Foods",
  },
];

const partners = ["MakeInIndia", "ARAI", "ISO 9001", "BIS", "ICAT", "FAME II"];

const heroBenefits = [
  { icon: Zap, label: "Zero tailpipe emissions" },
  { icon: ShieldCheck, label: "Low total cost of ownership" },
  { icon: HeadphonesIcon, label: "Nationwide after-sales support" },
];

/** Pulls the "Range NNN km" figure out of a spec string, if present. */
function parseRangeKm(specs: string[] | undefined): number | undefined {
  for (const s of specs ?? []) {
    const match = /range\s+(\d+)\s*km/i.exec(s);
    if (match) return Number(match[1]);
  }
  return undefined;
}

/**
 * Animated range bar — fills from 0 to the product's real range once it
 * scrolls into view. Works inside the horizontally-pinned EV showcase too:
 * IntersectionObserver checks the element's on-screen position after GSAP's
 * transform, so it still fires as each panel scrolls into the frame.
 */
function RangeMeter({ km, max = 150 }: { km: number; max?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFilled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pct = Math.min(100, Math.round((km / max) * 100));

  return (
    <div ref={ref} className="mt-8 max-w-xs">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-white/50">
        <span>Range on a single charge</span>
        <span className="text-brand-accent">{km} km</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-brand-accent transition-[width] duration-[1400ms] ease-out"
          style={{ width: filled ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export default function RanayarSite() {
  const evSectionRef = useRef<HTMLElement | null>(null);
  const evTrackRef = useRef<HTMLDivElement | null>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const evCategory = getCategory("ev");
  const evItems = evCategory?.items ?? [];

  // A dozen photos is the teaser; the rest live on /gallery. Keep this even so
  // the two marquee rows come out the same length. Every individual photo, not
  // one per product — with only a handful of products, featuredMedia() alone
  // doesn't have enough distinct images to fill a marquee row.
  const galleryTeaser = useMemo(() => allMedia().slice(0, 12), []);
  const teaserLightboxItems = useMemo(
    () => galleryTeaser.map((m) => ({ src: image(m.key), alt: m.alt })),
    [galleryTeaser],
  );

  useSmoothScroll();

  // EV horizontal-pinned showcase — page-specific, so it stays here rather
  // than in the shared hook.
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [gsapMod, stMod] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      const gsap = gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      let evTween: gsap.core.Tween | null = null;
      const track = evTrackRef.current;
      const section = evSectionRef.current;
      if (track && section && window.innerWidth >= 768) {
        evTween = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            end: () => "+=" + (track.scrollWidth - window.innerWidth),
            invalidateOnRefresh: true,
          },
        });
      }

      cleanup = () => {
        evTween?.scrollTrigger?.kill();
        evTween?.kill();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // Testimonials autoplay
  useEffect(() => {
    const id = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />

      {/* HERO */}
      <section
        id="top"
        className="relative flex min-h-screen items-center overflow-hidden bg-ink text-white"
      >
        {evItems[0]?.media[0] && (
          <Img
            media={evItems[0].media[0]}
            priority
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* Dark on the left where the copy sits, clear on the right so the vehicle reads plainly. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 py-32 sm:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] backdrop-blur">
              <span className="relative inline-flex h-3 w-6 items-center rounded-[3px] border border-white/40 p-[1.5px]">
                <span className="ev-charge__fill h-full rounded-[1.5px] bg-brand-accent" />
                <span className="absolute -right-[3px] h-1.5 w-1 rounded-r-sm bg-white/40" />
              </span>
              Electric mobility, made in India
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
              Engineering the future — <span className="text-brand-accent">electric, always.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              RANAYARA Engineering designs, builds and services electric two-, three- and
              cargo vehicles for Indian roads — battery to charge port, all in-house.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => scrollTo("ev")}
                className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-7 py-3.5 text-sm font-semibold text-ink shadow-[0_0_28px_-6px_var(--brand-accent)] transition-all hover:bg-white"
              >
                Explore the Lineup <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollTo("contact")}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
              >
                Enquire Now
              </button>
            </div>
            <div className="mt-10 inline-flex flex-wrap divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur sm:flex-nowrap sm:divide-x sm:divide-y-0">
              {heroBenefits.map((b) => (
                <div key={b.label} className="flex items-center gap-3 px-6 py-4">
                  <b.icon className="h-5 w-5 shrink-0 text-brand-accent" />
                  <span className="text-sm font-medium text-white/90">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/50">
          Scroll ↓
        </div>
      </section>

      {/* STATS MARQUEE */}
      <section className="border-y border-black/5 bg-secondary">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-8 px-5 py-14 sm:px-8 md:grid-cols-4">
          <StatCounter target={12} suffix="+" label="Years in operation" />
          <StatCounter target={25} suffix="K+" label="Units delivered" />
          <StatCounter target={150} suffix="+" label="Engineers on staff" />
          <StatCounter target={40} suffix="+" label="Client partners" />
        </div>
      </section>

      {/* ABOUT + THREE PILLARS */}
      <section id="about" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <div className="reveal">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Who we are
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              A vertically integrated EV manufacturer.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-charcoal">
              From battery pack to charge port, RANAYARA designs, engineers and manufactures every
              part of the electric vehicle experience under one roof — one accountable partner from
              prototype to fleet.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              {
                icon: Zap,
                title: "Electric Vehicles",
                desc: "Bikes, cargo and passenger EV platforms built for Indian roads.",
              },
              {
                icon: BatteryCharging,
                title: "Battery & Powertrain",
                desc: "In-house battery packs, BMS and motor engineering.",
              },
              {
                icon: HeadphonesIcon,
                title: "Sales & Service Network",
                desc: "Nationwide after-sales support and genuine parts.",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="reveal group flex items-start gap-5 rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <p.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold text-ink">{p.title}</h3>
                  <p className="mt-1 text-sm text-charcoal">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACILITY SLIDER */}
      <section className="bg-secondary py-24 md:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="reveal mb-12 max-w-2xl">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Our Facility
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Where every RANAYARA EV comes to life.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-charcoal">
              A look inside our manufacturing floor — engineering, assembly and testing, all
              under one roof.
            </p>
          </div>
          <div className="reveal">
            <PlantSlider />
          </div>
        </div>
      </section>

      {/* EV HORIZONTAL SHOWCASE */}
      <section id="ev" ref={evSectionRef} className="relative overflow-hidden bg-ink text-white">
        {/* Desktop: horizontal pinned track */}
        <div className="hidden md:block">
          <div ref={evTrackRef} className="flex h-screen w-max flex-nowrap">
            {/* Intro panel */}
            <div className="flex h-screen w-screen shrink-0 items-center justify-center px-16">
              <div className="max-w-2xl">
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
                  Electric Vehicle Lineup
                </div>
                <h2 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
                  One vertically integrated EV program, three platforms.
                </h2>
                <p className="mt-6 text-lg text-white/70">
                  Scroll to explore the RANAYARA EV lineup — from personal mobility to fleet-grade
                  cargo and passenger platforms.
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm text-white/50">
                  Scroll <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
            {evItems.map((p, i) => {
              const rangeKm = parseRangeKm(p.specs);
              const otherSpecs = (p.specs ?? []).filter((s) => !/^range\s+\d+\s*km/i.test(s));
              return (
                <div key={p.slug} className="flex h-screen w-screen shrink-0 items-center px-16">
                  <div className="grid w-full grid-cols-2 gap-16">
                    <div className="speed-lines relative flex items-center justify-center rounded-3xl">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand/30 to-brand-accent/10 blur-3xl" />
                      {p.media[0] && (
                        <Img
                          media={p.media[0]}
                          className="relative max-h-[70vh] w-full rounded-3xl object-cover shadow-2xl"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
                        0{i + 1} · {p.tag}
                      </div>
                      <h3 className="mt-4 font-display text-5xl font-bold leading-tight sm:text-6xl">
                        {p.name}
                      </h3>
                      <ul className="mt-8 grid grid-cols-2 gap-4">
                        {otherSpecs.map((s) => (
                          <li
                            key={s}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 backdrop-blur"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                      {rangeKm !== undefined && <RangeMeter km={rangeKm} />}
                      <button
                        onClick={() => scrollTo("contact")}
                        className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-ink transition-all hover:bg-white"
                      >
                        Request specs <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: swipeable horizontal scroll */}
        <div className="md:hidden">
          <div className="px-5 pt-16">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Electric Vehicle Lineup
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight">
              Three platforms. One EV program.
            </h2>
          </div>
          <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-16">
            {evItems.map((p, i) => (
              <div key={p.slug} className="w-[85vw] shrink-0 snap-center">
                {p.media[0] && (
                  <Img media={p.media[0]} className="h-56 w-full rounded-2xl object-cover" />
                )}
                <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-accent">
                  0{i + 1} · {p.tag}
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold">{p.name}</h3>
                <ul className="mt-4 grid grid-cols-2 gap-2">
                  {(p.specs ?? []).map((s) => (
                    <li key={s} className="rounded-lg bg-white/5 px-3 py-2 text-xs text-white/80">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OWNERSHIP / CHARGING */}
      <section id="charging" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="speed-lines reveal relative overflow-hidden rounded-3xl">
            {evItems[0]?.media[1] && (
              <Img media={evItems[0].media[1]} className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-ink/40 via-transparent to-transparent" />
          </div>
          <div className="reveal">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Built for Real Ownership
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Charging made simple, range you can trust.
            </h2>
            <p className="mt-6 text-lg text-charcoal">
              Every RANAYARA EV ships with a removable Li-ion pack, a fast-charge cycle measured in
              hours not overnight stays, and a battery management system engineered in-house for
              longevity.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Removable, swappable Li-ion battery packs",
                "Fast-charge in under 4 hours from a standard socket",
                "In-house BMS with cell-level protection",
                "Real-world range validated on Indian roads",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-charcoal">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* WHY ELECTRIC */}
      <section id="why-electric" className="bg-secondary py-24 md:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="reveal mb-14 max-w-2xl">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Why Electric
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Lower cost per kilometre, zero tailpipe emissions.
            </h2>
            <p className="mt-5 text-lg text-charcoal">
              Every platform is engineered to cut running cost and emissions without cutting
              payload, range or reliability.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Zero Tailpipe Emissions", desc: "Cleaner fleets and cleaner cities, ride after ride." },
              { name: "Lower Cost per Kilometre", desc: "A fraction of fuel cost, with far fewer moving parts to service." },
              { name: "FAME II & State Incentives", desc: "Eligible platforms priced to pass subsidy savings to you." },
            ].map((i, idx) => (
              <div
                key={i.name}
                className="reveal group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 font-display text-6xl font-bold text-brand/10 transition-colors group-hover:text-brand/20">
                  0{idx + 1}
                </div>
                <h3 className="font-display text-xl font-semibold text-ink">{i.name}</h3>
                <p className="mt-2 text-sm text-charcoal">{i.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY TEASER — the full set lives on /gallery */}
      <section id="gallery" className="overflow-hidden py-24 md:py-32">
        <div className="mx-auto mb-12 max-w-[1320px] px-5 sm:px-8">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
                Media Gallery
              </div>
              <h2 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
                Inside our floor.
              </h2>
              <p className="mt-5 max-w-xl text-lg text-charcoal">
                Photographs of the EVs we build — shot on our own shop floor.
              </p>
            </div>
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent hover:text-ink"
            >
              View full gallery
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <div className="reveal">
          <GalleryStrip media={galleryTeaser} onSelect={(i) => setLightboxIndex(i)} />
        </div>
        <div className="mx-auto mt-12 max-w-[1320px] px-5 text-center sm:px-8">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-accent"
          >
            See all photographs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Lightbox
        items={teaserLightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />

      {/* CAPABILITIES */}
      <section className="bg-ink py-24 text-white md:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="reveal mb-14 max-w-2xl">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Why choose RANAYAR
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              Capabilities that shorten your time to market.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="reveal rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all hover:border-brand-accent/50 hover:bg-white/[0.06]"
              >
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-brand-accent/15 text-brand-accent">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-white/60">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
            Client trust
          </div>
          <div className="relative min-h-[220px]">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  opacity: i === testimonialIdx ? 1 : 0,
                  pointerEvents: i === testimonialIdx ? "auto" : "none",
                }}
              >
                <p className="font-display text-2xl font-medium leading-relaxed text-ink sm:text-3xl">
                  “{t.quote}”
                </p>
                <div className="mt-8">
                  <div className="font-semibold text-ink">{t.name}</div>
                  <div className="text-sm text-charcoal">{t.company}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === testimonialIdx ? "w-8 bg-brand" : "w-4 bg-charcoal/25"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="border-y border-black/5 bg-white py-14">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-charcoal">
            Certifications & Partners
          </div>
          <div className="grid grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-3 md:grid-cols-6">
            {partners.map((p) => (
              <div
                key={p}
                className="font-display text-lg font-bold uppercase tracking-widest text-charcoal/40 transition-colors hover:text-brand"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-ink py-24 text-white md:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <div className="reveal">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Enquiry
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              Let's build what's next.
            </h2>
            <p className="mt-5 text-white/70">
              Request a brochure, a spec sheet, or a custom quote. Our team responds within one
              business day.
            </p>
            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/50">Email</div>
                  <div className="mt-1 text-sm">sales@ranayara.com</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/50">Phone</div>
                  <div className="mt-1 text-sm">+91 00000 00000</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/50">Facility</div>
                  <div className="mt-1 text-sm">RANAYARA Engineering Works, India</div>
                </div>
              </div>
            </div>
          </div>
          <form
            className="reveal rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you — we'll be in touch shortly.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Full name" name="name" required />
              <FormField label="Company" name="company" />
              <FormField label="Email" name="email" type="email" required />
              <FormField label="Phone" name="phone" type="tel" />
            </div>
            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/60">
                Interest
              </label>
              <select
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent"
              >
                <option value="" className="bg-ink">
                  Select an interest
                </option>
                <option className="bg-ink">Electric Bike</option>
                <option className="bg-ink">Cargo EV</option>
                <option className="bg-ink">Passenger E-Auto</option>
                <option className="bg-ink">Fleet / Bulk Order</option>
                <option className="bg-ink">Dealership Enquiry</option>
                <option className="bg-ink">Request Brochure / Quote</option>
              </select>
            </div>
            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/60">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent"
                placeholder="Tell us about your project..."
              />
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-accent px-6 py-3.5 text-sm font-semibold text-ink shadow-[0_0_28px_-6px_var(--brand-accent)] transition-all hover:bg-white"
            >
              Send enquiry <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/60">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-accent"
      />
    </div>
  );
}

// Note: `Play` is imported but unused — reserved for future video-card overlays.
void Play;
