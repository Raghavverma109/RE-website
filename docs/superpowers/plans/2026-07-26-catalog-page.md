# Catalog Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a filterable, SEO-friendly product catalog — a listing page, per-category listing pages, and per-product detail pages — reachable via a new "Catalog" header tab, without touching the existing homepage sections.

**Architecture:** Three new file-based routes (`/catalog`, `/catalog/$category`, `/catalog/$category/$product`) read from the existing `src/content` registry via two new pure functions (`getProduct`, `getRelatedProducts`). Category filtering is pure `<Link>` navigation between routes — the URL is the only filter state, so there is nothing to keep in sync. A shared `<CatalogCard>` component renders both grid tiles and "related products" tiles from the same `Product` data. The homepage's inline Lenis/GSAP smooth-scroll setup is extracted into a reusable `useSmoothScroll()` hook so the three new pages get the same behavior without copy-pasting ~40 lines three times. Each route sets its own `head()` (title, description, canonical, and — on the product route — `Product` JSON-LD) following the exact pattern `src/routes/index.tsx` already uses.

**Tech Stack:** TanStack Start/Router (file-based routing, SSR + prerendering already enabled), React 19, TypeScript strict, Tailwind CSS v4, GSAP + ScrollTrigger + Lenis (already a dependency, already used on the homepage), Vitest.

## Global Constraints

- **Import alias:** `@/` maps to `./src/`. Always use it.
- **TypeScript `strict: true`.** No `any`.
- **Route params are validated against the content registry**, not trusted blindly. An unknown category or product slug calls `notFound()` (from `@tanstack/react-router`) — never render a blank or broken page for a bad URL.
- **The homepage (`src/routes/-components/RanayarSite.tsx`) keeps its existing sections untouched**, except: (a) the header nav gains a real "Catalog" link, and (b) its inline Lenis/GSAP effect is replaced by the new shared `useSmoothScroll()` hook (behavior must stay identical — this is an extraction, not a rewrite).
- **Filtering is URL-driven, not client state.** No `useState` for "which category is selected" — the route param is the source of truth.
- **Follow existing visual language.** Reuse the color tokens already registered in `src/styles.css` (`brand`, `brand-accent`, `ink`, `charcoal`, `secondary`, `background`) and the card/hover patterns already used in `RanayarSite.tsx` (e.g. `rounded-2xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg`). Do not invent a new visual system.
- **Images go through the existing `<Img>` component** (`src/components/media/img.tsx`) — never a raw `<img>` for product/category photos.
- **Commit after every task.**

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `src/content/index.ts` (modified) | Adds `getProduct(categorySlug, productSlug)` and `getRelatedProducts(categorySlug, excludeSlug, limit)`. |
| `src/content/index.test.ts` (modified) | Tests for the two new functions. |
| `src/hooks/use-smooth-scroll.ts` | Extracted Lenis + GSAP ScrollTrigger + `.reveal` setup, as a mountable/unmountable hook. |
| `src/components/catalog/catalog-card.tsx` | `<CatalogCard>` — one product tile. Used in grids and in "related products". |
| `src/components/catalog/category-pills.tsx` | `<CategoryPills>` — the "All / EV / Robotics / Electronics" filter nav, active state driven by the current route. |
| `src/components/catalog/breadcrumb.tsx` | `<CatalogBreadcrumb>` — `Catalog › EV › BESTIVA` trail. |
| `src/routes/catalog/index.tsx` | `/catalog` — all products across all categories. |
| `src/routes/catalog/$category/index.tsx` | `/catalog/$category` — one category's products. |
| `src/routes/catalog/$category/$product.tsx` | `/catalog/$category/$product` — one product's detail page. |

**Modified:**

| Path | Change |
|---|---|
| `src/routes/-components/RanayarSite.tsx` | Header `navLinks` gains a real-navigation "Catalog" entry; inline Lenis/GSAP effect replaced by `useSmoothScroll()`. |

**Explicitly out of scope:** `sitemap.xml` / `robots.txt` (flagged as follow-up — see end of plan). Modal/overlay detail view (rejected during design in favor of dedicated routes, for SEO). Multi-image carousels beyond what `<Img>` + a thumbnail strip need — every product has exactly one photo today; the UI must not break with one, and must not require code changes to support more later.

---

### Task 1: Content registry lookups — `getProduct` and `getRelatedProducts`

**Files:**
- Modify: `src/content/index.ts`
- Modify: `src/content/index.test.ts`

**Interfaces:**
- Consumes: `categories` (existing), `Category`/`Product` types (existing).
- Produces: `getProduct(categorySlug: string, productSlug: string): { category: Category; product: Product } | undefined`, `getRelatedProducts(categorySlug: string, excludeSlug: string, limit?: number): Product[]`. Both used by Task 5 and Task 6's routes.

- [ ] **Step 1: Write the failing tests**

Append to `src/content/index.test.ts`:

```ts
import { getProduct, getRelatedProducts } from "./index";

describe("getProduct", () => {
  it("finds a product by category and product slug", () => {
    const found = getProduct("ev", "bestiva");
    expect(found?.category.slug).toBe("ev");
    expect(found?.product.name).toBe("RANAYARA BESTIVA");
  });

  it("returns undefined for a known category but unknown product", () => {
    expect(getProduct("ev", "does-not-exist")).toBeUndefined();
  });

  it("returns undefined for an unknown category", () => {
    expect(getProduct("nope", "bestiva")).toBeUndefined();
  });
});

describe("getRelatedProducts", () => {
  it("returns other products in the same category", () => {
    const related = getRelatedProducts("ev", "bestiva");
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((p) => p.slug !== "bestiva")).toBe(true);
  });

  it("respects the limit", () => {
    const related = getRelatedProducts("ev", "bestiva", 2);
    expect(related.length).toBeLessThanOrEqual(2);
  });

  it("returns an empty array for an unknown category", () => {
    expect(getRelatedProducts("nope", "anything")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `getProduct`/`getRelatedProducts` are not exported from `./index`.

- [ ] **Step 3: Implement**

In `src/content/index.ts`, add after the existing `allMedia` function:

```ts
/** A product together with the category it belongs to, or undefined if either slug is wrong. */
export function getProduct(
  categorySlug: string,
  productSlug: string,
): { category: Category; product: Product } | undefined {
  const category = getCategory(categorySlug);
  const product = category?.items.find((i) => i.slug === productSlug);
  return category && product ? { category, product } : undefined;
}

/**
 * Other products in the same category, for a "related products" section.
 * Derived from the registry — not a second hand-maintained list.
 */
export function getRelatedProducts(
  categorySlug: string,
  excludeSlug: string,
  limit = 3,
): Product[] {
  const category = getCategory(categorySlug);
  if (!category) return [];
  return category.items.filter((i) => i.slug !== excludeSlug).slice(0, limit);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/index.ts src/content/index.test.ts
git commit -m "feat: add getProduct and getRelatedProducts to content registry"
```

---

### Task 2: `useSmoothScroll` hook — extracted from the homepage

The homepage's `useEffect` (currently inline in `RanayarSite.tsx`) sets up Lenis smooth scrolling, registers GSAP's ScrollTrigger, and reveals any `.reveal`-classed element as it scrolls into view. The new catalog pages need identical behavior. Extracting it first (before the new pages exist) means every page — including the homepage, after this task — uses one implementation.

**Files:**
- Create: `src/hooks/use-smooth-scroll.ts`
- Modify: `src/routes/-components/RanayarSite.tsx`

**Interfaces:**
- Consumes: nothing (self-contained; dynamically imports `lenis`, `gsap`, `gsap/ScrollTrigger`, same as before).
- Produces: `useSmoothScroll(): void` — call once per page component, no arguments, no return value. Mounts on mount, tears down on unmount.

- [ ] **Step 1: Read the exact block being extracted**

In `src/routes/-components/RanayarSite.tsx`, locate the `useEffect` that starts with `// Lenis smooth scroll + GSAP horizontal pinned section` (currently spans from the dynamic `Promise.all` import through the `cleanup` assignment and the outer `return () => { cancelled = true; cleanup?.(); }`). It contains two parts:
1. **Generic setup** (Lenis instance, ScrollTrigger registration, ticker, `.reveal` reveal-on-scroll, scroll listener for header `scrolled` state) — this part is what moves into the hook.
2. **Page-specific setup** (the horizontal-pinned EV showcase `setupHorizontal()` function, and the `evTrackRef`/`evSectionRef` scroll-trigger) — this part is specific to the homepage's EV section and **stays in `RanayarSite.tsx`**, not the hook.

The `scrolled` header state also depends on the scroll listener created inside this effect — the hook must expose that, since the header background changes on scroll on every page, not just the homepage.

- [ ] **Step 2: Create the hook**

Create `src/hooks/use-smooth-scroll.ts`:

```ts
import { useEffect, useState } from "react";

/**
 * Lenis smooth scrolling + GSAP ScrollTrigger, wired up once per page.
 *
 * Extracted from the homepage so every page gets identical scroll behavior —
 * reveal-on-scroll for any `.reveal`-classed element, and a `scrolled` flag
 * for headers that change style once the page scrolls past the top.
 *
 * Call once per top-level page component. Cleans up on unmount, so navigating
 * between pages never leaves a stray Lenis/ScrollTrigger instance running.
 */
export function useSmoothScroll(): { scrolled: boolean } {
  const [scrolled, setScrolled] = useState(false);

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

      const onScroll = () => setScrolled(window.scrollY > 30);
      window.addEventListener("scroll", onScroll, { passive: true });

      cleanup = () => {
        window.removeEventListener("scroll", onScroll);
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

  return { scrolled };
}
```

- [ ] **Step 3: Update `RanayarSite.tsx` to use the hook, keeping the EV-specific horizontal scroll inline**

Replace the `[statsVisible...]`-adjacent `const [scrolled, setScrolled] = useState(false);` line and the entire old `useEffect` (the one from Step 1) with:

```tsx
  const { scrolled } = useSmoothScroll();
```

Then, immediately below it, add a **second**, smaller `useEffect` that does only the EV horizontal-pin setup (the part that must stay page-specific), reusing the existing `evTrackRef`/`evSectionRef`/`statsRef` refs already declared earlier in the component:

```tsx
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

      if (statsRef.current) {
        ScrollTrigger.create({
          trigger: statsRef.current,
          start: "top 80%",
          once: true,
          onEnter: () => setStatsVisible(true),
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
```

Add the import at the top of `RanayarSite.tsx`:

```tsx
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
```

- [ ] **Step 4: Verify nothing regressed**

```bash
npx tsc --noEmit
npm run dev
```

Open the homepage. Confirm: header background still changes on scroll, `.reveal` elements still fade/slide in, the EV section still pins and scrolls horizontally on desktop (resize below 768px to confirm it's absent on mobile, as before).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-smooth-scroll.ts src/routes/-components/RanayarSite.tsx
git commit -m "refactor: extract useSmoothScroll hook from homepage for reuse on catalog pages"
```

---

### Task 3: `<CatalogCard>` — the shared product tile

**Files:**
- Create: `src/components/catalog/catalog-card.tsx`

**Interfaces:**
- Consumes: `Product` type, `Category` type (for the `categorySlug` link target), `<Img>` from `@/components/media/img`, `Link` from `@tanstack/react-router`.
- Produces: `<CatalogCard categorySlug={string} product={Product} />`. Used by Task 5 (listing pages) and Task 6 (related products).

- [ ] **Step 1: Implement**

Create `src/components/catalog/catalog-card.tsx`:

```tsx
import { Link } from "@tanstack/react-router";
import { CircuitBoard } from "lucide-react";
import { Img } from "@/components/media/img";
import type { Product } from "@/content";

/**
 * One product tile — used in the catalog grid and in "related products".
 *
 * Products without a photo (EMS, today) render an icon tile instead of <Img>,
 * matching the icon-tile pattern already used by the homepage's capability
 * cards — not a new visual language for products that happen to lack media.
 */
export function CatalogCard({
  categorySlug,
  product,
}: {
  categorySlug: string;
  product: Product;
}) {
  const media = product.media[0];

  return (
    <Link
      to="/catalog/$category/$product"
      params={{ category: categorySlug, product: product.slug }}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-secondary">
        {media ? (
          <Img
            media={media}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <CircuitBoard className="h-10 w-10 text-brand/30" />
          </div>
        )}
      </div>
      <div className="p-5">
        {product.tag && (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
            {product.tag}
          </div>
        )}
        <h3 className="font-display text-lg font-semibold text-ink">{product.name}</h3>
        {product.desc && <p className="mt-1 text-sm text-charcoal">{product.desc}</p>}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: fails at this point, because the `/catalog/$category/$product` route doesn't exist yet for `Link`'s `to` prop to type-check against. **This is expected** — it will resolve once Task 6 creates that route. Confirm the *only* error is about the missing route (not an unrelated typo in this file) before moving on.

- [ ] **Step 3: Commit**

```bash
git add src/components/catalog/catalog-card.tsx
git commit -m "feat: add CatalogCard product tile component"
```

---

### Task 4: `<CategoryPills>` and `<CatalogBreadcrumb>`

**Files:**
- Create: `src/components/catalog/category-pills.tsx`
- Create: `src/components/catalog/breadcrumb.tsx`

**Interfaces:**
- Consumes: `categories` from `@/content`, `Link` and `useLocation` (or route match) from `@tanstack/react-router`.
- Produces: `<CategoryPills activeCategorySlug={string | undefined} />`, `<CatalogBreadcrumb trail={{ label: string; to?: "/catalog" | "/catalog/$category"; params?: Record<string, string> }[]} />`. Used by Task 5 and Task 6.

- [ ] **Step 1: Implement the pills**

Create `src/components/catalog/category-pills.tsx`:

```tsx
import { Link } from "@tanstack/react-router";
import { categories } from "@/content";

/**
 * "All | EV | Robotics | Electronics" filter nav. Each pill is a real link to
 * its own URL (/catalog or /catalog/$category) — there is no separate client
 * filter state to keep in sync with what's shown.
 */
export function CategoryPills({ activeCategorySlug }: { activeCategorySlug?: string }) {
  const pillClass = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
      active ? "bg-brand text-white" : "bg-secondary text-charcoal hover:bg-brand/10"
    }`;

  return (
    <div className="flex flex-wrap gap-3">
      <Link to="/catalog" className={pillClass(activeCategorySlug === undefined)}>
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          to="/catalog/$category"
          params={{ category: c.slug }}
          className={pillClass(activeCategorySlug === c.slug)}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Implement the breadcrumb**

Create `src/components/catalog/breadcrumb.tsx`:

```tsx
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

type Crumb = {
  label: string;
  to?: "/catalog" | "/catalog/$category";
  params?: Record<string, string>;
};

/** `Catalog › EV › BESTIVA` — the last crumb (current page) is never a link. */
export function CatalogBreadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-charcoal">
      {trail.map((crumb, i) => (
        <span key={crumb.label} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-charcoal/40" />}
          {crumb.to ? (
            <Link
              to={crumb.to}
              params={crumb.params}
              className="transition-colors hover:text-brand"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-ink">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: same pre-existing "missing route" errors as Task 3 (routes don't exist yet), nothing new introduced by these two files.

- [ ] **Step 4: Commit**

```bash
git add src/components/catalog/category-pills.tsx src/components/catalog/breadcrumb.tsx
git commit -m "feat: add CategoryPills filter nav and CatalogBreadcrumb"
```

---

### Task 5: `/catalog` and `/catalog/$category` listing routes

**Files:**
- Create: `src/routes/catalog/index.tsx`
- Create: `src/routes/catalog/$category/index.tsx`

**Interfaces:**
- Consumes: `categories`, `getCategory` from `@/content`; `<CatalogCard>`, `<CategoryPills>` from Tasks 3–4; `useSmoothScroll` from Task 2.
- Produces: the `/catalog` and `/catalog/$category` routes that Task 3's `<CatalogCard>` links target, and that Task 6's breadcrumb links back to.

- [ ] **Step 1: All-categories listing**

Create `src/routes/catalog/index.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { categories } from "@/content";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CategoryPills } from "@/components/catalog/category-pills";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export const Route = createFileRoute("/catalog/")({
  head: () => ({
    meta: [
      { title: "Catalog — RANAYARA Engineering" },
      {
        name: "description",
        content:
          "Browse RANAYAR's full product catalog: electric vehicles, robotics & automation systems, and electronics manufacturing services.",
      },
      { property: "og:title", content: "Catalog — RANAYARA Engineering" },
      {
        property: "og:description",
        content: "Electric vehicles, robotics and electronics — the full RANAYARA lineup.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ranayar.com/catalog" }],
  }),
  component: CatalogIndex,
});

function CatalogIndex() {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <div className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
          Product Catalog
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Everything RANAYARA builds.
        </h1>
        <div className="reveal mt-10">
          <CategoryPills />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.flatMap((category) =>
            category.items.map((product) => (
              <div key={`${category.slug}-${product.slug}`} className="reveal">
                <CatalogCard categorySlug={category.slug} product={product} />
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
```

Replace `https://ranayar.com` with the site's actual production domain before deploying — this plan uses it as a placeholder consistent with the site's brand name, since no domain has been configured elsewhere in the project yet.

- [ ] **Step 2: Single-category listing**

Create `src/routes/catalog/$category/index.tsx`:

```tsx
import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCategory } from "@/content";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CategoryPills } from "@/components/catalog/category-pills";
import { CatalogBreadcrumb } from "@/components/catalog/breadcrumb";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export const Route = createFileRoute("/catalog/$category/")({
  loader: ({ params }) => {
    const category = getCategory(params.category);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.category.name} — RANAYARA Catalog` },
      { name: "description", content: loaderData?.category.blurb },
      { property: "og:title", content: `${loaderData?.category.name} — RANAYARA Catalog` },
      { property: "og:description", content: loaderData?.category.blurb },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `https://ranayar.com/catalog/${loaderData?.category.slug}` },
    ],
  }),
  component: CategoryListing,
});

function CategoryListing() {
  const { category } = Route.useLoaderData();
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <div className="reveal">
          <CatalogBreadcrumb trail={[{ label: "Catalog", to: "/catalog" }, { label: category.name }]} />
        </div>
        <div className="reveal mb-4 mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
          {category.eyebrow}
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          {category.headline}
        </h1>
        <p className="reveal mt-4 max-w-2xl text-lg text-charcoal">{category.blurb}</p>
        <div className="reveal mt-10">
          <CategoryPills activeCategorySlug={category.slug} />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.items.map((product) => (
            <div key={product.slug} className="reveal">
              <CatalogCard categorySlug={category.slug} product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Regenerate the route tree and verify**

Run: `npm run dev` (the TanStack Router Vite plugin regenerates `src/routeTree.gen.ts` automatically on file changes in `src/routes/`)

Visit `http://localhost:5173/catalog` — confirm the grid renders all 13 products (5 EV + 6 EMS + 2 robotics) with working pills. Visit `http://localhost:5173/catalog/ev` — confirm only the 5 EV products show, and the "EV" pill (labelled with the category's actual `name`, "Electric Vehicles") is highlighted. Visit `http://localhost:5173/catalog/not-a-real-category` — confirm the site's existing 404 page renders (via `notFound()`), not a crash.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: the `Link to="/catalog/$category/$product"` errors from Tasks 3–4 remain (Task 6 resolves them) — no other errors.

- [ ] **Step 5: Commit**

```bash
git add src/routes/catalog/index.tsx src/routes/catalog/\$category/index.tsx src/routeTree.gen.ts
git commit -m "feat: add /catalog and /catalog/\$category listing routes"
```

---

### Task 6: `/catalog/$category/$product` detail route

**Files:**
- Create: `src/routes/catalog/$category/$product.tsx`

**Interfaces:**
- Consumes: `getProduct`, `getRelatedProducts` from Task 1; `<CatalogCard>` from Task 3; `<CatalogBreadcrumb>` from Task 4; `useSmoothScroll` from Task 2; `image` from `@/lib/media`.
- Produces: the route every `<CatalogCard>` and every `<Link to="/catalog/$category/$product">` in Tasks 3–5 was already written against — this task is what makes those type-check.

- [ ] **Step 1: Implement**

Create `src/routes/catalog/$category/$product.tsx`:

```tsx
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowRight, CircuitBoard } from "lucide-react";
import { getProduct, getRelatedProducts } from "@/content";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CatalogBreadcrumb } from "@/components/catalog/breadcrumb";
import { Img } from "@/components/media/img";
import { image } from "@/lib/media";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export const Route = createFileRoute("/catalog/$category/$product")({
  loader: ({ params }) => {
    const found = getProduct(params.category, params.product);
    if (!found) throw notFound();
    return {
      category: found.category,
      product: found.product,
      related: getRelatedProducts(params.category, params.product),
    };
  },
  head: ({ loaderData }) => {
    const { category, product } = loaderData ?? {};
    if (!category || !product) return {};
    const description =
      product.desc ?? product.specs?.join(", ") ?? `${product.name} — ${category.name} by RANAYARA Engineering.`;
    const canonicalUrl = `https://ranayar.com/catalog/${category.slug}/${product.slug}`;
    const primaryImage = product.media[0] ? image(product.media[0].key) : undefined;

    return {
      meta: [
        { title: `${product.name} — RANAYARA ${category.name}` },
        { name: "description", content: description },
        { property: "og:title", content: product.name },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        ...(primaryImage ? [{ property: "og:image", content: primaryImage }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description,
            category: category.name,
            ...(primaryImage ? { image: primaryImage } : {}),
          }),
        },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { category, product, related } = Route.useLoaderData();
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <div className="reveal">
          <CatalogBreadcrumb
            trail={[
              { label: "Catalog", to: "/catalog" },
              { label: category.name, to: "/catalog/$category", params: { category: category.slug } },
              { label: product.name },
            ]}
          />
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="reveal">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-secondary">
              {product.media[0] ? (
                <Img media={product.media[0]} priority className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <CircuitBoard className="h-16 w-16 text-brand/30" />
                </div>
              )}
            </div>
            {product.media.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.media.slice(1).map((m) => (
                  <div key={m.key} className="h-20 w-20 overflow-hidden rounded-xl">
                    <Img media={m} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="reveal">
            {product.tag && (
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
                {product.tag}
              </div>
            )}
            <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              {product.name}
            </h1>
            {product.desc && <p className="mt-6 text-lg text-charcoal">{product.desc}</p>}
            {product.specs && product.specs.length > 0 && (
              <ul className="mt-8 grid grid-cols-2 gap-3">
                {product.specs.map((s) => (
                  <li
                    key={s}
                    className="rounded-xl border border-black/5 bg-secondary px-4 py-3 text-sm text-charcoal"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/"
              hash="contact"
              className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-accent"
            >
              Request specs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="reveal font-display text-2xl font-bold text-ink">
              More from {category.name}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <div key={p.slug} className="reveal">
                  <CatalogCard categorySlug={category.slug} product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

The "Request specs" button uses `<Link to="/" hash="contact">` rather than a plain `href="#contact"`, because the contact form lives on the homepage, not on this route — a same-page anchor would 404. TanStack Router's `hash` prop navigates to `/` and scrolls to the `#contact` element once there.

- [ ] **Step 2: Regenerate the route tree and verify**

Run: `npm run dev`

Visit `http://localhost:5173/catalog/ev/bestiva` — confirm the product's name, tag, specs, and photo render, breadcrumb reads "Catalog › Electric Vehicles › RANAYARA BESTIVA", and "More from Electric Vehicles" shows the other 4 EV products (not BESTIVA itself). Visit `http://localhost:5173/catalog/ems/pcb-assembly` — confirm it renders with the icon placeholder (no photo) and no "specs" grid (EMS items have `desc`, not `specs`). Visit `http://localhost:5173/catalog/ev/not-a-real-product` — confirm the 404 page renders.

View page source (or use `curl http://localhost:5173/catalog/ev/bestiva` against a production build) and confirm a `<script type="application/ld+json">` tag is present containing the product's name and category.

- [ ] **Step 3: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: clean. The `Link to="/catalog/$category/$product"` usages in `CatalogCard` (Task 3) now resolve against this route.

- [ ] **Step 4: Commit**

```bash
git add "src/routes/catalog/\$category/\$product.tsx"
git commit -m "feat: add /catalog/\$category/\$product detail route with JSON-LD"
```

---

### Task 7: Header "Catalog" tab

**Files:**
- Modify: `src/routes/-components/RanayarSite.tsx`

**Interfaces:**
- Consumes: `Link` from `@tanstack/react-router`.
- Produces: nothing consumed downstream — this is the final wiring task.

- [ ] **Step 1: Distinguish real navigation from same-page scrolling in `navLinks`**

Replace the `navLinks` array:

```tsx
  const navLinks = [
    { id: "about", label: "About" },
    { id: "ev", label: "EV" },
    { id: "robotics", label: "Robotics" },
    { id: "ems", label: "Electronics" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
  ];
```

with:

```tsx
  const navLinks: { id: string; label: string; to?: "/catalog" }[] = [
    { id: "about", label: "About" },
    { id: "ev", label: "EV" },
    { id: "robotics", label: "Robotics" },
    { id: "ems", label: "Electronics" },
    { id: "catalog", label: "Catalog", to: "/catalog" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
  ];
```

- [ ] **Step 2: Render `to`-carrying entries as `<Link>`, everything else as the existing scroll button**

There are two places `navLinks.map` renders a button — the desktop `<nav>` and the mobile menu `<div>`. In **both**, replace:

```tsx
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-sm font-medium text-charcoal transition-colors hover:text-brand"
              >
                {l.label}
              </button>
            ))}
```

(desktop nav — exact className may differ slightly from the mobile one; match each site's existing className, only changing the conditional rendering) with:

```tsx
            {navLinks.map((l) =>
              l.to ? (
                <Link
                  key={l.id}
                  to={l.to}
                  className="text-sm font-medium text-charcoal transition-colors hover:text-brand"
                >
                  {l.label}
                </Link>
              ) : (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-sm font-medium text-charcoal transition-colors hover:text-brand"
                >
                  {l.label}
                </button>
              ),
            )}
```

Apply the same pattern to the mobile menu's `navLinks.map`, keeping that block's existing `className` (`border-b border-black/5 py-3 text-left text-sm font-medium text-charcoal`) on both branches, and additionally closing the mobile menu on click for the `Link` branch too (call `setNavOpen(false)` — either via an `onClick` on the `Link`, or by wrapping it exactly as the button does).

- [ ] **Step 3: Add the import**

Add `Link` to `RanayarSite.tsx`'s existing `@tanstack/react-router`... actually there is no existing `@tanstack/react-router` import in this file — add a new one:

```tsx
import { Link } from "@tanstack/react-router";
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run dev
```

Click "Catalog" in the header on both desktop width and mobile width (resize below 768px, open the hamburger menu) — confirm it navigates to `/catalog` and the mobile menu closes after the click. Confirm every other nav item still scrolls within the homepage as before.

- [ ] **Step 5: Commit**

```bash
git add src/routes/-components/RanayarSite.tsx
git commit -m "feat: add Catalog tab to header nav"
```

---

### Task 8: Full verification

- [ ] **Step 1: Full check**

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

All four must pass. `npm run build` should prerender `/`, `/catalog`, `/catalog/ev`, `/catalog/robotics`, `/catalog/ems`, and all 13 product detail pages (TanStack Start's prerender crawls links found in the rendered HTML, so linking every product from the catalog grids is what makes this automatic — no manual prerender route list to maintain).

- [ ] **Step 2: Confirm prerendered output**

```bash
find .output -o -name "*.html" -path "*catalog*" 2>/dev/null | sort
```

Expected: an `index.html` under a `catalog` directory, one per category, and one per product slug.

- [ ] **Step 3: Confirm no console errors on any new page**

```bash
npm run preview
```

Open `/catalog`, `/catalog/ev`, `/catalog/ev/bestiva` in a browser; check DevTools console is clean and the Lenis/GSAP reveal animation runs once per page (not doubled, which would indicate a cleanup bug from Task 2's extraction).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify catalog feature end to end"
```

---

## Follow-up work (not in this plan)

**`sitemap.xml` / `robots.txt`.** Worth adding once the domain is finalized and real product photos exist for every EV/robotics item — a static or generated sitemap listing `/`, `/catalog`, each `/catalog/$category`, and each `/catalog/$category/$product` URL. Deliberately excluded here since the exact production domain isn't configured anywhere in the project yet (this plan placeholders `https://ranayar.com` in canonical URLs — replace it in one pass alongside the sitemap work).

**Multi-image galleries.** The detail page's thumbnail strip (Task 6) already handles `product.media.length > 1` — but no product has more than one photo today. Adding more photos to a product's `media` array in its category file (e.g. `src/content/categories/ev.ts`) is the entire task; no component changes needed.

**EMS photography.** Once EMS gains photos (see the media pipeline's own follow-up note), its catalog cards automatically switch from the icon placeholder to `<Img>` — no code change, since `CatalogCard` already branches on `product.media[0]` being present.
