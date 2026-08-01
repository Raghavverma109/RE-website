# About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `/about` page for Ranayara Group — hero with animated stats, group companies grid, vision/mission, core values, a journey timeline, and certification badges — reachable via the header's "About" tab, matching the site's existing visual language and performance patterns.

**Architecture:** One new route (`src/routes/about.tsx`) composed from small presentational components, following the exact pattern already established by the catalog pages: `<SiteHeader>` + content + `<SiteFooter>`, its own `head()` for SEO. The homepage's count-up stat (currently inline, coupled to a page-specific GSAP ScrollTrigger) is extracted into a self-triggering `<StatCounter>` — it detects its own scroll-into-view via `IntersectionObserver`, so both the homepage and the About page use one implementation with zero external wiring. Page content (companies, values, timeline, stats) lives as local arrays in `about.tsx`, matching how `capabilities`/`testimonials`/`partners` already live directly in `RanayarSite.tsx` — this is page copy, not catalog product data, so it does not belong in `src/content`.

**Tech Stack:** TanStack Start/Router, React 19, TypeScript strict, Tailwind CSS v4, lucide-react icons, existing `useSmoothScroll()` hook for reveal-on-scroll, Vitest.

## Global Constraints

- **Import alias:** `@/` maps to `./src/`. Always use it.
- **TypeScript `strict: true`.** No `any`.
- **Hero image key:** `site/about-hero.webp`, resolved via `hasImage()`/`image()` from `@/lib/media`. The file does not exist yet — the hero MUST render a working dark-gradient fallback when it's absent (same pattern as `CatalogCard`'s icon fallback for photo-less products), and MUST automatically switch to the real photo the moment the file is added, with no code change.
- **Certification badges are styled text**, not logo images — no real ISO/IATF logo files exist. Matches the homepage's existing "Certifications & Partners" section, which already renders `partners` (MakeInIndia, ARAI, ISO 9001, etc.) as styled text, not images.
- **Company name spelling is "Ranayara Group"** throughout this page — deliberately distinct from "RANAYARA Engineering," the brand used elsewhere on the site. Do not "fix" this to match.
- **Visual language:** reuse the color tokens already in `src/styles.css` (`brand`, `brand-accent`, `ink`, `charcoal`, `secondary`, `background`) and existing card/hover patterns (`rounded-2xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg`). No new visual system.
- **Reveal-on-scroll** via the existing `.reveal` class + `useSmoothScroll()` — same mechanism every other page uses, not a new animation approach.
- **Mobile-first responsive**: every grid/two-column section stacks to one column below `sm`/`lg` breakpoints, matching existing section patterns in `RanayarSite.tsx`.
- **Commit after every task.**

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `src/components/stat-counter.tsx` | `<StatCounter>` — self-triggering animated count-up tile. Replaces the homepage's inline `Stat`/`useCountUp`. |
| `src/components/about/company-card.tsx` | `<CompanyCard>` — group company name + optional location. |
| `src/components/about/value-card.tsx` | `<ValueCard>` — icon + title + description. |
| `src/components/about/timeline.tsx` | `<Timeline>` — vertical year/title/description list. |
| `src/routes/about.tsx` | `/about` page, all 6 sections. |

**Modified:**

| Path | Change |
|---|---|
| `src/routes/-components/RanayarSite.tsx` | Replace inline `Stat`/`useCountUp` + `statsRef`/`statsVisible` GSAP wiring with `<StatCounter>` (4 call sites); header's "About" nav item becomes a real link. |
| `src/components/layout/site-header.tsx` | `{ id: "about", label: "About" }` gains `to: "/about"`, same treatment `"Catalog"` already has. |

**Explicitly out of scope:** the actual `about-hero.webp` file (you're supplying it — see the note below), real certification logo images (no source files exist), a company-database/CMS for group companies (7 static entries, a local array is the right size for this).

---

### Task 1: `<StatCounter>` — extracted, self-triggering stat tile

**Files:**
- Create: `src/components/stat-counter.tsx`
- Modify: `src/routes/-components/RanayarSite.tsx`

**Interfaces:**
- Consumes: nothing external.
- Produces: `<StatCounter target={number} suffix?={string} label={string} duration?={number} className?={string} />`. Used by Task 5 (About hero) and by the homepage's existing stats section.

- [ ] **Step 1: Implement the component**

Create `src/components/stat-counter.tsx`:

```tsx
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
}: {
  target: number;
  suffix?: string;
  label: string;
  duration?: number;
  className?: string;
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
      <div className="font-display text-4xl font-bold text-brand sm:text-5xl">
        {value}
        {suffix}
      </div>
      <div className="mt-2 text-sm uppercase tracking-widest text-charcoal">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Replace the homepage's inline version**

In `src/routes/-components/RanayarSite.tsx`:

1. Delete the `useCountUp` function and the `Stat` function (currently just above `export default function RanayarSite()`).
2. Delete `const statsRef = useRef<HTMLDivElement | null>(null);` and `const [statsVisible, setStatsVisible] = useState(false);`.
3. In the EV-showcase `useEffect` (the one handling the horizontal pin + stats trigger), delete the entire block:
   ```tsx
   if (statsRef.current) {
     ScrollTrigger.create({
       trigger: statsRef.current,
       start: "top 80%",
       once: true,
       onEnter: () => setStatsVisible(true),
     });
   }
   ```
4. Change the stats section from:
   ```tsx
   <section ref={statsRef} className="border-y border-black/5 bg-secondary">
     <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-8 px-5 py-14 sm:px-8 md:grid-cols-4">
       <Stat target={12} suffix="+" label="Years in operation" trigger={statsVisible} />
       <Stat target={25000} suffix="+" label="Units delivered" trigger={statsVisible} />
       <Stat target={150} suffix="+" label="Engineers on staff" trigger={statsVisible} />
       <Stat target={40} suffix="+" label="Client partners" trigger={statsVisible} />
     </div>
   </section>
   ```
   to:
   ```tsx
   <section className="border-y border-black/5 bg-secondary">
     <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-8 px-5 py-14 sm:px-8 md:grid-cols-4">
       <StatCounter target={12} suffix="+" label="Years in operation" />
       <StatCounter target={25000} suffix="+" label="Units delivered" />
       <StatCounter target={150} suffix="+" label="Engineers on staff" />
       <StatCounter target={40} suffix="+" label="Client partners" />
     </div>
   </section>
   ```
5. Add the import: `import { StatCounter } from "@/components/stat-counter";`

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: clean — no leftover references to `Stat`, `useCountUp`, `statsRef`, or `statsVisible`.

```bash
npm run dev
```

Open the homepage, scroll to the stats row — confirm the four numbers still count up once, the first time the section enters view (not on every re-render, not before it's visible).

- [ ] **Step 4: Commit**

```bash
git add src/components/stat-counter.tsx src/routes/-components/RanayarSite.tsx
git commit -m "refactor: extract self-triggering StatCounter, reused by homepage and About page"
```

---

### Task 2: `<CompanyCard>`

**Files:**
- Create: `src/components/about/company-card.tsx`

**Interfaces:**
- Consumes: nothing external.
- Produces: `<CompanyCard name={string} location?={string} />`. Used by Task 5.

- [ ] **Step 1: Implement**

Create `src/components/about/company-card.tsx`:

```tsx
import { Building2, MapPin } from "lucide-react";

/**
 * One group company entry. `location` is optional — three of the seven group
 * companies were given without one, and the card must not show an empty line.
 */
export function CompanyCard({ name, location }: { name: string; location?: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
        <Building2 className="h-5 w-5" />
      </div>
      <h3 className="font-display text-base font-semibold leading-snug text-ink">{name}</h3>
      {location && (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-charcoal">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {location}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/company-card.tsx
git commit -m "feat: add CompanyCard component"
```

---

### Task 3: `<ValueCard>`

**Files:**
- Create: `src/components/about/value-card.tsx`

**Interfaces:**
- Consumes: a lucide icon component (passed in, same pattern as the homepage's `capabilities` array which passes `icon: Factory` etc.).
- Produces: `<ValueCard icon={LucideIcon} title={string} desc={string} />`. Used by Task 5.

- [ ] **Step 1: Implement**

Create `src/components/about/value-card.tsx`:

```tsx
import type { LucideIcon } from "lucide-react";

export function ValueCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-charcoal">{desc}</p>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/value-card.tsx
git commit -m "feat: add ValueCard component"
```

---

### Task 4: `<Timeline>`

**Files:**
- Create: `src/components/about/timeline.tsx`

**Interfaces:**
- Consumes: nothing external.
- Produces: `<Timeline items={{ year: string; title: string; desc: string }[]} />`. Used by Task 5.

- [ ] **Step 1: Implement**

Create `src/components/about/timeline.tsx`:

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/about/timeline.tsx
git commit -m "feat: add Timeline component"
```

---

### Task 5: `/about` route — all six sections

**Files:**
- Create: `src/routes/about.tsx`

**Interfaces:**
- Consumes: `<StatCounter>` (Task 1), `<CompanyCard>` (Task 2), `<ValueCard>` (Task 3), `<Timeline>` (Task 4), `<SiteHeader>`/`<SiteFooter>` (existing), `hasImage`/`image` from `@/lib/media`, `useSmoothScroll` (existing).
- Produces: the `/about` route Task 6's header link targets.

- [ ] **Step 1: Implement**

Create `src/routes/about.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Award, Handshake, Leaf, Lightbulb, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StatCounter } from "@/components/stat-counter";
import { CompanyCard } from "@/components/about/company-card";
import { ValueCard } from "@/components/about/value-card";
import { Timeline } from "@/components/about/timeline";
import { hasImage, image } from "@/lib/media";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

const HERO_IMAGE_KEY = "site/about-hero.webp";

const stats = [
  { target: 5, suffix: "+", label: "Years of Experience" },
  { target: 2000, suffix: "+", label: "Projects Delivered" },
  { target: 500, suffix: "+", label: "Happy Clients" },
  { target: 12, suffix: "", label: "Countries Served" },
];

const groupCompanies: { name: string; location?: string }[] = [
  { name: "Ranayara Engineering Industries Pvt Limited", location: "IMT Manesar" },
  { name: "Ranayara Engineering Industries Pvt Limited", location: "Noida" },
  { name: "Ranayara Engineering Industries Pvt Limited", location: "Pune" },
  { name: "Ranayara Engineering Industries Pvt Limited", location: "Pitampur, Indore" },
  { name: "Ranayara Infrastructure and Rama Construction Pvt Limited" },
  { name: "Ranayara Electrical Vehicle Motor Pvt Limited" },
  { name: "Ranayara Alkaline Mineral Water Pvt Limited" },
];

const coreValues = [
  {
    icon: ShieldCheck,
    title: "Quality First",
    desc: "Uncompromising commitment to quality in every product and service we deliver.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    desc: "Continuously evolving our solutions to meet tomorrow's challenges today.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    desc: "Building a greener future through eco-friendly products and practices.",
  },
  {
    icon: Handshake,
    title: "Integrity",
    desc: "Honest, transparent dealings that build lasting relationships.",
  },
];

const journey = [
  {
    year: "2022",
    title: "Foundation",
    desc: "Ranayara Engineering Industries established with focus on precision tooling.",
  },
  {
    year: "2023",
    title: "Expansion",
    desc: "Opened new facilities in Noida, Pune, and Pitampur.",
  },
  {
    year: "2024",
    title: "Diversification",
    desc: "Launched EV Motors and Infrastructure divisions.",
  },
  {
    year: "2025",
    title: "Innovation",
    desc: "Introduced Alkaline Mineral Water and expanded automation solutions.",
  },
  {
    year: "2026",
    title: "Growth",
    desc: "Continued expansion with multiple group companies operational.",
  },
];

const certifications = ["ISO 9001:2015", "ISO 14001:2015", "IATF 16949", "OHSAS 18001"];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Ranayara Group — Industrial Manufacturing Company" },
      {
        name: "description",
        content:
          "India's leading precision engineering group with 5+ years of manufacturing excellence — tool and die manufacturing, industrial automation, and electric vehicles.",
      },
      { property: "og:title", content: "About Ranayara Group" },
      {
        property: "og:description",
        content: "India's leading precision engineering group — your trusted industrial manufacturing partner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ranayar.com/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  useSmoothScroll();
  const heroHasImage = hasImage(HERO_IMAGE_KEY);

  return (
    <div className="min-h-screen bg-background text-ink">
      <SiteHeader />

      {/* HERO */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-ink text-white">
        {heroHasImage ? (
          <img
            src={image(HERO_IMAGE_KEY)}
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-brand/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/70 to-brand/60" />
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 py-32 sm:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-bold leading-[1.1] sm:text-5xl md:text-6xl">
              About Ranayara Group – Industrial Manufacturing Company
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/70">
              India's leading precision engineering group with 5+ years of manufacturing
              excellence. From tool and die manufacturing to industrial automation solutions and
              electric vehicles — we are your trusted industrial manufacturing partner.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <StatCounter
                key={s.label}
                target={s.target}
                suffix={s.suffix}
                label={s.label}
                className="text-center"
              />
            ))}
          </div>
        </div>
      </section>

      {/* GROUP COMPANIES */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
        <div className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
          Our Group
        </div>
        <h2 className="reveal font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Our Group Companies
        </h2>
        <p className="reveal mt-5 max-w-2xl text-lg text-charcoal">
          Ranayara Group comprises multiple specialized companies across India, each focused on
          delivering excellence in their respective domains.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groupCompanies.map((c, i) => (
            <div key={`${c.name}-${c.location ?? i}`} className="reveal">
              <CompanyCard name={c.name} location={c.location} />
            </div>
          ))}
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="bg-secondary py-24 md:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <div className="reveal rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Our Vision
            </div>
            <p className="text-lg leading-relaxed text-charcoal">
              To be the preferred industrial partner for global manufacturing excellence, driving
              innovation and sustainability across every sector we serve.
            </p>
          </div>
          <div className="reveal rounded-3xl border border-black/5 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Our Mission
            </div>
            <p className="text-lg leading-relaxed text-charcoal">
              To deliver precision-engineered solutions, sustainable mobility, quality
              construction, and clean air technologies that create lasting value for our
              customers and communities.
            </p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
        <h2 className="reveal font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Our Core Values
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((v) => (
            <div key={v.title} className="reveal">
              <ValueCard icon={v.icon} title={v.title} desc={v.desc} />
            </div>
          ))}
        </div>
      </section>

      {/* JOURNEY */}
      <section className="bg-secondary py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="reveal mb-12 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Our Journey
          </h2>
          <Timeline items={journey} />
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="border-y border-black/5 bg-white py-14">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <h2 className="reveal mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-charcoal">
            Certifications & Standards
          </h2>
          <div className="reveal grid grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-4">
            {certifications.map((c) => (
              <div
                key={c}
                className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-widest text-charcoal/50 transition-colors hover:text-brand"
              >
                <Award className="h-5 w-5" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 2: Regenerate the route tree and verify**

Run: `npm run dev`

Visit `http://localhost:5173/about`. Confirm:
- Hero renders a dark gradient (no photo yet) with heading, subtext, and 4 stat counters that animate once scrolled into view.
- Group Companies grid shows all 7 entries; the 3 without a location show no empty line.
- Vision/Mission blocks sit side-by-side on desktop, stacked on mobile.
- Core Values shows 4 icon cards.
- Journey shows a connected vertical timeline, 2022 → 2026 in order.
- Certifications row shows 4 styled text badges.
- Header and footer both render (via `<SiteHeader>`/`<SiteFooter>`).

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/routes/about.tsx
git commit -m "feat: add /about page with hero, companies, values, timeline, certifications"
```

---

### Task 6: Header "About" tab → real navigation link

**Files:**
- Modify: `src/components/layout/site-header.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed downstream — final wiring task.

- [ ] **Step 1: Update the nav config**

In `src/components/layout/site-header.tsx`, the `navLinks` array's type currently only allows `to?: "/catalog"`. Widen it and update the "About" entry:

```tsx
const navLinks: { id: string; label: string; to?: "/catalog" | "/about" }[] = [
  { id: "about", label: "About", to: "/about" },
  { id: "ev", label: "EV" },
  { id: "robotics", label: "Robotics" },
  { id: "ems", label: "Electronics" },
  { id: "catalog", label: "Catalog", to: "/catalog" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];
```

No other change is needed in this file — the existing `l.to ? <Link ...> : <button ...>` branching (desktop nav and mobile menu) already handles any entry that carries a `to`, exactly as it does for `"Catalog"`.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run dev
```

Click "About" in the header from the homepage — confirm it navigates to `/about` (not a same-page scroll to the homepage's brief "Who we are" section anymore). Click it again from a catalog page — confirm it still navigates to `/about` correctly (this was already working for "Catalog"; "About" now gets the same treatment).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/site-header.tsx
git commit -m "feat: point header About tab at the dedicated /about page"
```

---

### Task 7: Full verification

- [ ] **Step 1: Full check**

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

All four must pass. `npm run build` should prerender `/about` alongside every existing page (it's linked from the header on every page, so the crawler finds it automatically — no manual prerender list to maintain).

- [ ] **Step 2: Confirm prerendered output**

```bash
find .output -o -name "index.html" -path "*about*" 2>/dev/null
```

Expected: an `about/index.html` under the client build output.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: verify About page end to end"
```

---

## Follow-up work (not in this plan)

**The hero photo.** You're supplying `assets-source/images/about-hero.<ext>` (or telling me where it already lives); I then run it through the same WebP pipeline as every other image on the site (resize to ~1920px wide, convert, ~80% quality) and place it at `src/assets/images/site/about-hero.webp`. The page already renders correctly without it (dark gradient fallback) and will pick it up automatically once present — no code change needed.

**Real certification logos.** If you obtain the actual ISO/IATF/OHSAS badge artwork later, drop the files into `src/assets/images/site/` and swap the text-badge row in `src/routes/about.tsx`'s certifications section for `<Img>` calls — same pattern as any other product photo.
