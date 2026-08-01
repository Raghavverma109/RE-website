# Media Asset Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the remote Lovable CDN asset pointers with a self-hosted, build-optimized media pipeline organized around a category registry that scales to N product categories without touching component code.

**Architecture:** Media splits across two roots by physical need — images live in `src/assets/images/` where Vite fingerprints them (making a 1-year immutable cache header safe), and large streaming media lives in `public/assets/` where it is served raw with a stable URL. A `import.meta.glob` manifest in `src/lib/media.ts` resolves image keys to hashed URLs and throws loudly on a missing file. A content layer in `src/content/` describes categories and products as data; components consume the registry and never hardcode "there are three categories." Two presentational components — `<Img>` and `<HeroVideo>` — enforce the performance rules (lazy/eager, intrinsic dimensions, poster-first, connection-aware) so no call site has to remember them.

**Tech Stack:** TanStack Start 1.x (React 19, Vite 8, Nitro), TypeScript 5.8 strict, Tailwind CSS v4, Vitest 3 (added by this plan), ffmpeg + Squoosh/Sharp for asset prep.

## Global Constraints

- **Node/tooling:** bun or npm — repo has both `bun.lock` and `package-lock.json`. Use `npm` commands throughout; substitute `bun` if that is your daily driver.
- **Import alias:** `@/` maps to `./src/` (`tsconfig.json` + `vite.config.ts`). Always use it — never relative `../../`.
- **TypeScript is `strict: true`.** No `any` in committed code except the one documented `NetworkInformation` cast in Task 4.
- **Filenames:** lowercase, hyphenated, descriptive. `team-office.webp`, not `TeamOffice.webp` or `img_01.webp`.
- **Image format:** WebP only. No JPEG/PNG fallback markup — WebP is baseline in every browser since 2020 and a `<picture>` fallback would be dead weight. SVG is allowed for icons/logos.
- **Every `<img>` must carry `width` and `height`.** This is enforced structurally by the `ImageRef` type, not by discipline.
- **The hero video is decorative.** It carries `aria-hidden="true"`, has no audio track, and the poster image uses `alt=""`.
- **Versioned filenames in `public/`:** files under `public/assets/` are served `immutable` and are NOT auto-fingerprinted, so they carry their version in the name from day one (`hero-v1.mp4`). Replacing one means shipping `hero-v2.mp4` and updating `src/lib/media.ts` — never overwrite in place. The `v1` in the name is the reminder.
- **Commit after every task.** Each task ends with a working tree.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `src/lib/media.ts` | The only place that knows where media physically lives. Resolves image keys → fingerprinted URLs; exports video/poster constants. |
| `src/lib/media.test.ts` | Proves the resolver fingerprints, throws on typos, and lists by prefix. |
| `src/content/types.ts` | `ImageRef`, `Product`, `Category`. The shape contract for all content. |
| `src/content/categories/ev.ts` | EV product data. One file = one category. |
| `src/content/categories/ems.ts` | EMS service data. |
| `src/content/categories/robotics.ts` | Robotics & automation data. |
| `src/content/index.ts` | The registry — the single file listing categories. Exports `categories`, `getCategory`, `allMedia`. |
| `src/content/index.test.ts` | Proves ordering, slug uniqueness, and that every referenced image file exists on disk. |
| `src/components/media/img.tsx` | `<Img>` — the reusable optimized-image pattern. |
| `src/components/media/hero-video.tsx` | `<HeroVideo>` — poster-first, dual-source, connection-aware. |
| `src/hooks/use-hero-video-enabled.ts` | Decides whether the video is worth loading for this visitor. |
| `scripts/image-dimensions.mjs` | Prints intrinsic dimensions of every image, for filling in `ImageRef`. |
| `public/_headers` | Long cache headers (Netlify / Cloudflare Pages format). |
| `src/assets/images/README.md` | The folder rules, in the folder they apply to. |
| `docs/media-workflow.md` | Asset prep: ffmpeg/HandBrake/Squoosh commands, sizing table, CDN note. |

**Modified:**

| Path | Change |
|---|---|
| `src/routes/-components/RanayarSite.tsx` | Swap 9 `.asset.json` imports for the content registry; hero markup → `<HeroVideo>`; product/gallery images → `<Img>`; derive gallery instead of re-listing. |
| `src/routes/__root.tsx:83-92` | Add poster preload link. |
| `package.json` | Add `vitest`, `test` script. |
| `.gitignore` | Ignore `assets-source/`. |
| `vite.config.ts` | Add Vitest config block. |

**Deleted:** all 9 `src/assets/*.asset.json` files (Task 5).

**Explicitly out of scope:** splitting the 884-line `RanayarSite.tsx` into section components. It is a real maintainability problem and deserves its own plan — bundling it into a media refactor would make both harder to review. See "Follow-up work" at the end.

---

### Task 0: Repository setup and source media acquisition

Nothing in this plan can be verified until real image and video files exist on disk. The `.asset.json` descriptors point at host-relative Lovable paths (`/__l5e/assets-v1/<uuid>/ev-1.png`) with no domain, so they cannot be fetched from a checkout.

**Files:**
- Create: `assets-source/images/.gitkeep`, `assets-source/videos/.gitkeep`
- Create: `src/assets/images/{products/ev,products/ems,products/robotics,site}/.gitkeep`
- Create: `public/assets/video/.gitkeep`, `public/assets/fonts/.gitkeep`
- Modify: `.gitignore`

- [ ] **Step 1: Initialize git** (this directory is not yet a repository)

```bash
git init
git add -A
git commit -m "chore: initial commit of existing site"
```

- [ ] **Step 2: Create the folder tree**

```bash
mkdir -p assets-source/images assets-source/videos
mkdir -p src/assets/images/{products/ev,products/ems,products/robotics,site}
mkdir -p public/assets/video public/assets/fonts

find assets-source src/assets/images public/assets -type d -exec touch {}/.gitkeep \;
```

- [ ] **Step 3: Ignore the source originals**

Append to `.gitignore`:

```gitignore
# Original/unoptimized media. Keep these in cloud storage, not git —
# a 19MB mp4 in history is permanent. Only optimized exports are committed.
assets-source/
!assets-source/**/.gitkeep
```

- [ ] **Step 4: Export the original media out of Lovable**

Open the Lovable project preview and save each asset. The `original_filename` field in each `src/assets/*.asset.json` gives you the name to look for; the `url` field is the path to append to your Lovable preview origin. Nine files:

| Save as | Source descriptor | Size |
|---|---|---|
| `assets-source/videos/hero-original.mp4` | `hero-video.mp4.asset.json` | 19.3 MB |
| `assets-source/images/ev-1.png` | `ev-1.png.asset.json` | 440 KB |
| `assets-source/images/ev-2.png` … `ev-5.png` | `ev-2..5.png.asset.json` | — |
| `assets-source/images/robotics-1.jpg`, `robotics-2.jpg` | `robotics-1/2.jpg.asset.json` | — |
| `assets-source/images/ra-logo.png` | `ra-logo.png.asset.json` | — |

- [ ] **Step 5: Verify the originals landed**

```bash
ls -la assets-source/images assets-source/videos
```

Expected: 8 images and 1 video. **Do not proceed past this step without them** — Tasks 1–5 verify against real files.

- [ ] **Step 6: Commit**

```bash
git add .gitignore assets-source src/assets public/assets
git commit -m "chore: scaffold media folder structure"
```

---

### Task 1: Media resolver

**Files:**
- Create: `src/lib/media.ts`
- Create: `src/lib/media.test.ts`
- Modify: `package.json`, `vite.config.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `image(key: string): string`, `hasImage(key: string): boolean`, `listImages(prefix?: string): string[]`, `VIDEO: { heroWebm: string; heroMp4: string; heroPoster: string }`. Keys are paths relative to `src/assets/images/`, e.g. `"products/ev/rafander-motiva.webp"`.

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest@^3
```

Add to `package.json` `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Add the Vitest config block**

In `vite.config.ts`, add a `test` key to the `defineConfig` object, as a sibling of `server`:

```ts
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
```

Change the import on line 1 so the `test` key type-checks:

```ts
import { defineConfig } from "vitest/config";
```

- [ ] **Step 3: Add one real fixture image so the glob is non-empty**

The resolver test needs at least one real file. Produce it from a source original (full sizing guidance lands in Task 7's doc; this one command is enough for now):

```bash
npx --yes @squoosh/cli --webp '{"quality":80}' \
  --resize '{"enabled":true,"width":800}' \
  -d src/assets/images/products/ev \
  assets-source/images/ev-1.png

mv src/assets/images/products/ev/ev-1.webp \
   src/assets/images/products/ev/rafander-motiva.webp
```

If `@squoosh/cli` fails on your Node version, use the ffmpeg equivalent:

```bash
ffmpeg -i assets-source/images/ev-1.png -vf "scale=800:-2" -c:v libwebp -quality 80 \
  src/assets/images/products/ev/rafander-motiva.webp
```

- [ ] **Step 4: Write the failing test**

Create `src/lib/media.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { hasImage, image, listImages, VIDEO } from "./media";

describe("image()", () => {
  it("resolves a real key to a build URL", () => {
    const url = image("products/ev/rafander-motiva.webp");
    expect(url).toMatch(/rafander-motiva.*\.webp$/);
  });

  it("throws a descriptive error for a missing key", () => {
    expect(() => image("products/ev/does-not-exist.webp")).toThrowError(
      /Missing image "products\/ev\/does-not-exist\.webp"/,
    );
  });

  it("names the expected path in the error so the fix is obvious", () => {
    expect(() => image("nope.webp")).toThrowError(
      /src\/assets\/images\/nope\.webp/,
    );
  });
});

describe("hasImage()", () => {
  it("is true for a real key and false for a missing one", () => {
    expect(hasImage("products/ev/rafander-motiva.webp")).toBe(true);
    expect(hasImage("products/ev/does-not-exist.webp")).toBe(false);
  });
});

describe("listImages()", () => {
  it("returns keys relative to the image root", () => {
    expect(listImages()).toContain("products/ev/rafander-motiva.webp");
  });

  it("filters by prefix", () => {
    const evOnly = listImages("products/ev/");
    expect(evOnly.length).toBeGreaterThan(0);
    expect(evOnly.every((k) => k.startsWith("products/ev/"))).toBe(true);
  });
});

describe("VIDEO", () => {
  it("points at public/ paths, not bundled modules", () => {
    expect(VIDEO.heroMp4).toBe("/assets/video/hero-v1.mp4");
    expect(VIDEO.heroWebm).toBe("/assets/video/hero-v1.webm");
    expect(VIDEO.heroPoster).toBe("/assets/video/hero-v1-poster.webp");
  });

  it("carries a version in every public/ filename", () => {
    for (const [name, path] of Object.entries(VIDEO)) {
      expect(path, `${name} must be versioned`).toMatch(/-v\d+[.-]/);
    }
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./media"`.

- [ ] **Step 6: Write the implementation**

Create `src/lib/media.ts`:

```ts
/**
 * The single source of truth for where media physically lives.
 *
 * Two roots, on purpose:
 *
 *   src/assets/images/  — resolved through Vite, so filenames are content-hashed
 *                         at build time. That fingerprint is what makes a 1-year
 *                         immutable cache header safe: change the file, change
 *                         the URL. Reference these via image().
 *
 *   public/assets/      — served raw at a stable path. Large streaming media
 *                         gains nothing from the bundler and needs a fixed URL
 *                         for <link rel="preload"> and HTTP range requests.
 *                         Reference these via the VIDEO constants.
 *
 * Because public/ files are NOT auto-fingerprinted, they carry a version in the
 * filename instead (hero-v1.mp4). Shipping new footage means adding hero-v2.mp4
 * and bumping VIDEO below — never overwriting in place, which would leave
 * returning visitors on the cached old copy for a year.
 */

const IMAGE_ROOT = "/src/assets/images/";

const imageModules = import.meta.glob(
  "/src/assets/images/**/*.{webp,avif,svg,png,jpg,jpeg}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

/** Every known image key, relative to src/assets/images/. */
const keys = Object.keys(imageModules)
  .map((path) => path.slice(IMAGE_ROOT.length))
  .sort();

/**
 * Resolve an image key to its built URL.
 *
 * Throws rather than returning a broken path — a typo should stop the build or
 * blow up in dev, not ship a silent 404 to production.
 *
 * @param key path relative to src/assets/images/, e.g. "products/ev/motiva.webp"
 */
export function image(key: string): string {
  const url = imageModules[IMAGE_ROOT + key];
  if (!url) {
    throw new Error(
      `[media] Missing image "${key}".\n` +
        `  Expected a file at src/assets/images/${key}\n` +
        `  Known images:\n${keys.map((k) => `    - ${k}`).join("\n")}`,
    );
  }
  return url;
}

/** Non-throwing existence check. Useful in tests and optional-media branches. */
export function hasImage(key: string): boolean {
  return IMAGE_ROOT + key in imageModules;
}

/** All image keys, optionally filtered by folder prefix (e.g. "products/ev/"). */
export function listImages(prefix = ""): string[] {
  return keys.filter((k) => k.startsWith(prefix));
}

/**
 * Raw-served media in public/. Paths are stable and unfingerprinted —
 * see the rename rule in this file's header before changing one.
 */
export const VIDEO = {
  heroWebm: "/assets/video/hero-v1.webm",
  heroMp4: "/assets/video/hero-v1.mp4",
  heroPoster: "/assets/video/hero-v1-poster.webp",
} as const;
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — 8 tests.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/lib/media.ts src/lib/media.test.ts src/assets/images/products/ev/rafander-motiva.webp
git commit -m "feat: add fingerprinted media resolver with fail-loud missing-key errors"
```

---

### Task 2: Content layer

**Files:**
- Create: `src/content/types.ts`, `src/content/categories/{ev,ems,robotics}.ts`, `src/content/index.ts`
- Create: `src/content/index.test.ts`

**Interfaces:**
- Consumes: `hasImage` from `@/lib/media` (test only).
- Produces:
  - `type ImageRef = { key: string; alt: string; width: number; height: number }`
  - `type Product = { slug: string; name: string; tag?: string; desc?: string; specs?: string[]; media: ImageRef[] }`
  - `type Category = { id: string; slug: string; name: string; eyebrow: string; headline: string; blurb: string; order: number; items: Product[] }`
  - `categories: Category[]` (sorted by `order`), `getCategory(slug): Category | undefined`, `allMedia(): ImageRef[]`

- [ ] **Step 1: Write the types**

Create `src/content/types.ts`:

```ts
/**
 * A reference to an image, not the image itself.
 *
 * width/height are the INTRINSIC pixel dimensions of the file on disk. They are
 * required — not optional — because <img> without them causes cumulative layout
 * shift, and making the type enforce it removes the chance to forget.
 */
export type ImageRef = {
  /** Path relative to src/assets/images/, e.g. "products/ev/motiva.webp" */
  key: string;
  /** Empty string only for genuinely decorative images. */
  alt: string;
  width: number;
  height: number;
};

/**
 * One sellable thing. Deliberately loose: EV entries carry specs and a photo,
 * EMS service entries carry a description and (today) no photo at all. One type
 * with optional fields means EMS gains images later by dropping files in a
 * folder rather than by reshaping the data.
 */
export type Product = {
  /** URL-safe, unique within its category. */
  slug: string;
  name: string;
  /** Short badge text, e.g. "Electric Scooter". */
  tag?: string;
  /** One-line description. Used where specs aren't meaningful. */
  desc?: string;
  specs?: string[];
  /** May be empty. First entry is the card/primary image. */
  media: ImageRef[];
};

/**
 * A product family. Adding a category = add a file in ./categories/ and one
 * line in ./index.ts. Nothing else in the codebase counts categories.
 */
export type Category = {
  id: string;
  /** Also the DOM id used by the scroll-to nav in RanayarSite. */
  slug: string;
  name: string;
  /** Small uppercase label above the headline. */
  eyebrow: string;
  headline: string;
  blurb: string;
  /** Display order, ascending. Leave gaps (10, 20, 30) to insert later. */
  order: number;
  items: Product[];
};
```

- [ ] **Step 2: Write the EV category**

Create `src/content/categories/ev.ts`. Content is lifted verbatim from `RanayarSite.tsx:32-61`. **The `width`/`height` values below assume you exported each product image at 800px wide, 4:3** — correct them in Step 6 after measuring the real files.

```ts
import type { Category } from "../types";

export const ev: Category = {
  id: "ev",
  slug: "ev",
  name: "Electric Vehicles",
  eyebrow: "Electric Mobility",
  headline: "Built for Indian roads, engineered for range.",
  blurb:
    "A full line of electric two-, three- and cargo vehicles, designed and manufactured in-house.",
  order: 10,
  items: [
    {
      slug: "rafander-motiva",
      name: "RAFANDER Motiva",
      tag: "Electric Scooter",
      specs: ["Range 90 km", "Top speed 65 km/h", "Removable Li-ion", "Zero emissions"],
      media: [
        {
          key: "products/ev/rafander-motiva.webp",
          alt: "RAFANDER Motiva electric scooter, side profile",
          width: 800,
          height: 600,
        },
      ],
    },
    {
      slug: "rafander",
      name: "RAFANDER",
      tag: "Electric Bike",
      specs: ["Range 110 km", "Fast charge 3.5 h", "LED signature light", "Digital cluster"],
      media: [
        {
          key: "products/ev/rafander.webp",
          alt: "RAFANDER electric bike, side profile",
          width: 800,
          height: 600,
        },
      ],
    },
    {
      slug: "e-cart-loader",
      name: "E-Cart Loader",
      tag: "Cargo EV",
      specs: ["500 kg payload", "Range 100 km", "Heavy-duty chassis", "Reverse assist"],
      media: [
        {
          key: "products/ev/e-cart-loader.webp",
          alt: "E-Cart Loader cargo electric vehicle with flatbed",
          width: 800,
          height: 600,
        },
      ],
    },
    {
      slug: "e-lion",
      name: "RANAYARA E-Lion",
      tag: "Performance EV",
      specs: ["Peak 8 kW motor", "Sport chassis", "Regenerative brakes", "Alloy wheels"],
      media: [
        {
          key: "products/ev/e-lion.webp",
          alt: "RANAYARA E-Lion performance electric vehicle",
          width: 800,
          height: 600,
        },
      ],
    },
    {
      slug: "bestiva",
      name: "RANAYARA BESTIVA",
      tag: "Passenger E-Auto",
      specs: ["4+1 seater", "Range 140 km", "Fleet-ready", "Low TCO"],
      media: [
        {
          key: "products/ev/bestiva.webp",
          alt: "RANAYARA BESTIVA passenger electric auto rickshaw",
          width: 800,
          height: 600,
        },
      ],
    },
  ],
};
```

- [ ] **Step 3: Write the EMS category**

Create `src/content/categories/ems.ts`. Content from `RanayarSite.tsx:62-69`. Note `media: []` — this category has no photography yet, and that is a valid state.

```ts
import type { Category } from "../types";

export const ems: Category = {
  id: "ems",
  slug: "ems",
  name: "Electronics Manufacturing",
  eyebrow: "EMS",
  headline: "PCB, SMT and precision electronics under one roof.",
  blurb:
    "End-to-end electronics manufacturing services, from board assembly to tested storage products.",
  order: 20,
  items: [
    {
      slug: "pcb-assembly",
      name: "PCB Assembly",
      desc: "Multilayer boards, precision assembly.",
      media: [],
    },
    {
      slug: "smt-manufacturing",
      name: "SMT Manufacturing",
      desc: "High-throughput surface mount lines.",
      media: [],
    },
    {
      slug: "wave-soldering",
      name: "Wave Soldering",
      desc: "Reliable through-hole joints at scale.",
      media: [],
    },
    {
      slug: "jigs-and-fixtures",
      name: "Jigs & Fixtures",
      desc: "Custom tooling for repeatable quality.",
      media: [],
    },
    {
      slug: "wave-pallets",
      name: "Wave Pallets",
      desc: "Engineered pallets for wave processes.",
      media: [],
    },
    {
      slug: "ssd-production",
      name: "SSD Production",
      desc: "Storage assembly with tested reliability.",
      media: [],
    },
  ],
};
```

- [ ] **Step 4: Write the Robotics category**

Create `src/content/categories/robotics.ts`. The two robotics images are currently loose in the JSX at `RanayarSite.tsx:519`; this gives them a home.

```ts
import type { Category } from "../types";

export const robotics: Category = {
  id: "robotics",
  slug: "robotics",
  name: "Robotics & Automation",
  eyebrow: "Robotics & Automation",
  headline: "Robotic cells engineered for uptime.",
  blurb:
    "Custom robotic welding cells, pick-and-place stations and automated lines built around your process.",
  order: 30,
  items: [
    {
      slug: "robotic-welding-cell",
      name: "Robotic Welding Cell",
      desc: "Enclosed six-axis welding cells with fixture integration.",
      media: [
        {
          key: "products/robotics/weld-cell.webp",
          alt: "Six-axis robotic welding cell in operation",
          width: 1200,
          height: 800,
        },
      ],
    },
    {
      slug: "pick-and-place",
      name: "Pick & Place Station",
      desc: "High-cycle handling stations with vision-guided placement.",
      media: [
        {
          key: "products/robotics/pick-place.webp",
          alt: "Vision-guided robotic pick and place station",
          width: 1200,
          height: 800,
        },
      ],
    },
  ],
};
```

- [ ] **Step 5: Write the registry**

Create `src/content/index.ts`:

```ts
import type { Category, ImageRef } from "./types";
import { ev } from "./categories/ev";
import { ems } from "./categories/ems";
import { robotics } from "./categories/robotics";

/**
 * THE list of categories. Adding a fourth means:
 *   1. src/assets/images/products/<slug>/  — drop the photos in
 *   2. src/content/categories/<slug>.ts    — copy an existing file, edit it
 *   3. import + append here
 * Nothing else in the codebase needs to change.
 */
const registry: Category[] = [ev, ems, robotics];

/** Categories in display order. */
export const categories: Category[] = [...registry].sort((a, b) => a.order - b.order);

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/**
 * Every image referenced by every product, in category order.
 *
 * The gallery is DERIVED from this rather than maintained as a second list —
 * the previous hardcoded array meant adding a product silently left it out of
 * the gallery.
 */
export function allMedia(): ImageRef[] {
  return categories.flatMap((c) => c.items).flatMap((i) => i.media);
}

export type { Category, ImageRef, Product } from "./types";
```

- [ ] **Step 6: Export the remaining product images and fix the dimensions**

You now need 6 more WebP files. Export each from `assets-source/images/` (see `docs/media-workflow.md`, written in Task 7, for the full command set — or use Squoosh's web UI):

| Source | Destination | Target width |
|---|---|---|
| `ev-1.png` | `src/assets/images/products/ev/rafander-motiva.webp` | 800 (done in Task 1) |
| `ev-4.png` | `src/assets/images/products/ev/rafander.webp` | 800 |
| `ev-2.png` | `src/assets/images/products/ev/e-cart-loader.webp` | 800 |
| `ev-3.png` | `src/assets/images/products/ev/e-lion.webp` | 800 |
| `ev-5.png` | `src/assets/images/products/ev/bestiva.webp` | 800 |
| `robotics-1.jpg` | `src/assets/images/products/robotics/weld-cell.webp` | 1200 |
| `robotics-2.jpg` | `src/assets/images/products/robotics/pick-place.webp` | 1200 |
| `ra-logo.png` | `src/assets/images/site/ra-logo.webp` | 96 |

Then read the real dimensions. Create `scripts/image-dimensions.mjs`:

```js
// Prints "<key> <width>x<height>" for every image, ready to paste into
// the ImageRef entries in src/content/categories/.
import { readdirSync } from "node:fs";
import { join, posix, sep } from "node:path";
import sharp from "sharp";

const ROOT = "src/assets/images";

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const files = walk(ROOT).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));

for (const file of files) {
  const { width, height } = await sharp(file).metadata();
  const key = file.slice(ROOT.length + 1).split(sep).join(posix.sep);
  console.log(`${key}  ${width}x${height}`);
}
```

Run it:

```bash
npm install -D sharp
node scripts/image-dimensions.mjs
```

Paste the real numbers into the `width`/`height` fields. **Do not guess** — wrong values reintroduce the layout shift these fields exist to prevent.

- [ ] **Step 7: Write the failing test**

Create `src/content/index.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { allMedia, categories, getCategory } from "./index";
import { hasImage } from "@/lib/media";

describe("categories", () => {
  it("is sorted by order", () => {
    const orders = categories.map((c) => c.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("has unique slugs", () => {
    const slugs = categories.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique product slugs within each category", () => {
    for (const c of categories) {
      const slugs = c.items.map((i) => i.slug);
      expect(new Set(slugs).size, `duplicate slug in "${c.slug}"`).toBe(slugs.length);
    }
  });
});

describe("getCategory", () => {
  it("finds a category by slug", () => {
    expect(getCategory("ev")?.name).toBe("Electric Vehicles");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getCategory("nope")).toBeUndefined();
  });
});

describe("allMedia", () => {
  it("collects images across every category", () => {
    expect(allMedia().length).toBeGreaterThan(0);
  });

  // This is the test that earns its keep: it fails the moment someone
  // references a photo they forgot to export.
  it("references only images that exist on disk", () => {
    const missing = allMedia().filter((m) => !hasImage(m.key)).map((m) => m.key);
    expect(missing, `missing files: ${missing.join(", ")}`).toEqual([]);
  });

  it("gives every image a non-zero intrinsic size", () => {
    for (const m of allMedia()) {
      expect(m.width, m.key).toBeGreaterThan(0);
      expect(m.height, m.key).toBeGreaterThan(0);
    }
  });

  it("gives every image alt text", () => {
    for (const m of allMedia()) {
      expect(m.alt.length, `empty alt on ${m.key}`).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 8: Run the test**

Run: `npm test`
Expected: PASS — all content tests green. If `references only images that exist on disk` fails, it will name the exact missing file; go export it.

- [ ] **Step 9: Commit**

```bash
git add src/content src/assets/images scripts/image-dimensions.mjs package.json package-lock.json
git commit -m "feat: add category content registry with derived gallery media"
```

---

### Task 3: The `<Img>` component

**Files:**
- Create: `src/components/media/img.tsx`

**Interfaces:**
- Consumes: `image()` from `@/lib/media`, `ImageRef` from `@/content/types`, `cn` from `@/lib/utils`.
- Produces: `<Img media={ImageRef} priority?: boolean sizes?: string className?: string />`

- [ ] **Step 1: Write the component**

Create `src/components/media/img.tsx`:

```tsx
import type { ImgHTMLAttributes } from "react";
import type { ImageRef } from "@/content/types";
import { image } from "@/lib/media";
import { cn } from "@/lib/utils";

type ImgProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height" | "loading" | "decoding"
> & {
  media: ImageRef;
  /**
   * Set on above-the-fold images ONLY. Loads eagerly at high fetch priority.
   * Marking everything priority is the same as marking nothing.
   */
  priority?: boolean;
};

/**
 * The one way this site renders a photo.
 *
 * Every performance rule lives here so no call site has to remember it:
 *   - width/height + aspect-ratio        -> zero layout shift
 *   - loading="lazy" unless priority     -> below-the-fold images cost nothing
 *   - fetchPriority="high" when priority -> hero media wins the bandwidth race
 *   - src resolved through image()       -> fingerprinted URL, throws on typo
 */
export function Img({ media, priority = false, className, style, ...rest }: ImgProps) {
  return (
    <img
      src={image(media.key)}
      alt={media.alt}
      width={media.width}
      height={media.height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={cn("max-w-full", className)}
      style={{ aspectRatio: `${media.width} / ${media.height}`, ...style }}
      {...rest}
    />
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (If `fetchPriority` errors, confirm `@types/react` is v19 — it is in `package.json`.)

- [ ] **Step 3: Commit**

```bash
git add src/components/media/img.tsx
git commit -m "feat: add Img component enforcing lazy-loading and layout stability"
```

---

### Task 4: Hero video

**Files:**
- Create: `src/hooks/use-hero-video-enabled.ts`
- Create: `src/components/media/hero-video.tsx`
- Modify: `src/routes/__root.tsx:83-92`

**Interfaces:**
- Consumes: `VIDEO` from `@/lib/media`, `cn` from `@/lib/utils`.
- Produces: `useHeroVideoEnabled(): boolean`, `<HeroVideo className?: string />`

- [ ] **Step 1: Produce the video files**

Three commands. See `docs/media-workflow.md` (Task 7) for the reasoning and tuning knobs.

```bash
# MP4 — universal fallback. faststart puts the index first so playback can begin
# before the whole file arrives. -an strips audio (the hero is muted anyway).
ffmpeg -i assets-source/videos/hero-original.mp4 \
  -vf "scale=1920:-2,fps=30" -an \
  -c:v libx264 -profile:v high -crf 30 -preset slow -pix_fmt yuv420p \
  -movflags +faststart \
  public/assets/video/hero-v1.mp4

# WebM/VP9 — ~30% smaller, served first to browsers that take it.
ffmpeg -i assets-source/videos/hero-original.mp4 \
  -vf "scale=1920:-2,fps=30" -an \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
  public/assets/video/hero-v1.webm

# Poster — frame 1, so the still matches what the video opens on.
ffmpeg -i public/assets/video/hero-v1.mp4 \
  -vframes 1 -vf "scale=1920:-2" -c:v libwebp -quality 82 \
  public/assets/video/hero-v1-poster.webp
```

The `-v1` is not decoration. These files sit in `public/`, which the build does not
fingerprint, and they are served with a 1-year `immutable` header. The version in
the filename is what makes that safe: new footage ships as `hero-v2.*` at a URL no
browser has ever seen, so every visitor gets it on their next page load.

- [ ] **Step 2: Verify the sizes**

```bash
ls -lh public/assets/video/
```

Expected: `hero-v1.mp4` ≤ 4 MB, `hero-v1.webm` smaller still, `hero-v1-poster.webp` ≤ 200 KB.

If the mp4 is over 4 MB, re-run with `-vf "scale=1280:-2,fps=24"` and `-crf 34`. The hero renders at `opacity-40` under a gradient overlay — nobody will see the difference, and 1280px upscaled is invisible behind that treatment.

- [ ] **Step 3: Write the preference hook**

Create `src/hooks/use-hero-video-enabled.ts`:

```ts
import { useEffect, useState } from "react";

/** Not in lib.dom yet — Chromium-only, feature-detected below. */
type NetworkInformation = { saveData?: boolean; effectiveType?: string };

const SLOW = new Set(["slow-2g", "2g", "3g"]);
const MOBILE_BREAKPOINT = 768;

/**
 * Whether this visitor should get the video at all.
 *
 * Returns false on the server and on first client paint, so the poster is what
 * renders immediately — something is on screen before a single video byte is
 * requested. The video only mounts after this flips true on the client.
 *
 * Declines for: reduced-motion users, narrow viewports, Data Saver, and
 * 3g-or-worse connections. The video is decorative; none of these visitors
 * lose anything but the download.
 */
export function useHeroVideoEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < MOBILE_BREAKPOINT) return;

    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && SLOW.has(conn.effectiveType)) return;

    setEnabled(true);
  }, []);

  return enabled;
}
```

- [ ] **Step 4: Write the HeroVideo component**

Create `src/components/media/hero-video.tsx`:

```tsx
import { useHeroVideoEnabled } from "@/hooks/use-hero-video-enabled";
import { VIDEO } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Decorative full-bleed hero background.
 *
 * The poster <img> is always rendered and always visible underneath — it is the
 * LCP candidate and it paints on the server render. The <video> mounts on top
 * only once useHeroVideoEnabled() approves, so visitors who never qualify never
 * pay for it.
 *
 * aria-hidden + empty alt: this is atmosphere, not content. Screen readers get
 * the <h1> instead.
 */
export function HeroVideo({ className }: { className?: string }) {
  const enabled = useHeroVideoEnabled();

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <img
        src={VIDEO.heroPoster}
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {enabled && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={VIDEO.heroPoster}
        >
          <source src={VIDEO.heroWebm} type="video/webm" />
          <source src={VIDEO.heroMp4} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Preload the poster**

In `src/routes/__root.tsx`, inside the `links: [...]` array (currently lines 83–92), add as the **first** entry — before the stylesheet, so it starts downloading in the very first bytes of `<head>`:

```ts
      {
        rel: "preload",
        as: "image",
        href: "/assets/video/hero-v1-poster.webp",
        type: "image/webp",
      },
```

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev`, open `http://localhost:5173`

Check, in DevTools:
- Network tab: `hero-v1-poster.webp` requested early; `hero-v1.webm` requested only after.
- Safari specifically: confirm it plays. Safari falls back to `hero-v1.mp4` if it
  declines VP9 — check the Network tab shows the `.mp4` fetched, not a failed `.webm`.
- Resize the window below 768px and hard-reload: **no** video request at all, poster only.
- DevTools → Network → throttle to "Slow 3G", hard-reload: no video request.
- Elements tab: the `<video>` element is absent, not merely hidden, when declined.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/use-hero-video-enabled.ts src/components/media/hero-video.tsx src/routes/__root.tsx public/assets/videos
git commit -m "feat: add poster-first, connection-aware hero video"
```

---

### Task 5: Rewire RanayarSite and delete the Lovable pointers

**Files:**
- Modify: `src/routes/-components/RanayarSite.tsx`
- Delete: `src/assets/*.asset.json` (9 files)

**Interfaces:**
- Consumes: `categories`, `getCategory`, `allMedia` from `@/content`; `<Img>`, `<HeroVideo>`; `image` from `@/lib/media`.
- Produces: nothing consumed downstream.

- [ ] **Step 1: Replace the imports**

Delete lines 23–31 (the nine `.asset.json` imports) and put in their place:

```tsx
import { allMedia, getCategory } from "@/content";
import { Img } from "@/components/media/img";
import { HeroVideo } from "@/components/media/hero-video";
import { image } from "@/lib/media";
```

- [ ] **Step 2: Delete the local data arrays**

Remove the `evProducts` array (lines 32–61) and the `emsItems` array (lines 62–69) entirely. Leave `capabilities`, `testimonials`, and `partners` alone — those are page copy, not product media, and moving them is out of scope.

- [ ] **Step 3: Point the render sites at the registry**

Inside `RanayarSite()`, near the other top-of-function declarations, add:

```tsx
  const evCategory = getCategory("ev");
  const emsCategory = getCategory("ems");
  const roboticsCategory = getCategory("robotics");
```

Then update each consumer:

- Anywhere the old code mapped `evProducts`, map `evCategory?.items ?? []`. Each item's card image becomes:

```tsx
  {product.media[0] && (
    <Img media={product.media[0]} className="h-full w-full object-cover" />
  )}
```

- Anywhere the old code mapped `emsItems`, map `emsCategory?.items ?? []` and read `item.name` / `item.desc` in place of the old `title` / `desc`.

- [ ] **Step 4: Replace the hero video block**

Replace the `<video>` element at lines 322–331 with:

```tsx
        <HeroVideo className="opacity-40" />
```

The `opacity-40` and the sibling gradient overlay `<div>` on line 332 stay exactly as they are.

- [ ] **Step 5: Replace the robotics feature image**

At line 519, swap the raw `<img src={robotics1.url} …>` for:

```tsx
            {roboticsCategory?.items[0]?.media[0] && (
              <Img
                media={roboticsCategory.items[0].media[0]}
                className="h-full w-full object-cover"
              />
            )}
```

- [ ] **Step 6: Derive the gallery**

Replace line 149:

```tsx
  const galleryItems = [ev1.url, ev4.url, robotics1.url, ev2.url, robotics2.url, ev3.url, ev5.url];
```

with:

```tsx
  // Derived, not maintained — a new product appears here automatically.
  const galleryItems = allMedia();
```

`galleryItems` now holds `ImageRef` objects rather than URL strings. Two knock-on edits:

- Gallery tiles render `<Img media={item} />` instead of `<img src={item} />`.
- The lightbox state is `useState<string | null>` (line 147) and is set from a gallery click. Change the setter call to `setLightbox(image(item.key))` so it still receives a URL string, and leave the lightbox `<img>` rendering as-is.

- [ ] **Step 7: Replace the logo references**

Lines 267 and 830 use `logoAsset.url`. Add to the top-of-function declarations:

```tsx
  const logoSrc = image("site/ra-logo.webp");
```

and use `src={logoSrc}` at both sites. Add `width={40} height={40}` to both `<img>` tags — they render at `h-10 w-10`.

- [ ] **Step 8: Delete the Lovable descriptors**

```bash
rm src/assets/*.asset.json
```

- [ ] **Step 9: Verify**

```bash
npx tsc --noEmit
npm test
npm run build
```

Expected: clean type-check, green tests, successful build. A `[media] Missing image "…"` thrown during build means a file from Task 2 Step 6 was never exported — the message names it.

Then `npm run dev` and confirm in the browser: hero poster paints instantly, every product card shows its photo, the gallery contains all 7 images, both logos render, no console errors, no 404s in the Network tab.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "refactor: consume content registry, drop Lovable CDN asset pointers"
```

---

### Task 6: Cache headers and CDN

**Files:**
- Create: `public/_headers`
- Create: `src/assets/images/README.md`

- [ ] **Step 1: Find the built asset path**

```bash
npm run build
find .output -type d -name assets | head
```

Note the public-facing prefix for hashed build assets (commonly `/assets/` or `/_build/assets/`). You need it for the next step.

- [ ] **Step 2: Write the headers file**

Create `public/_headers`. This format is read by Netlify and Cloudflare Pages; on other hosts it is an inert text file, and the equivalents are noted below.

```
# Fingerprinted build output — filename changes when content changes,
# so this can be cached forever with no staleness risk.
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/_build/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Raw media in public/. Not auto-fingerprinted — safe to cache forever because
# every filename carries its own version (hero-v1.mp4). New footage ships as
# hero-v2.* at a new URL. See the header comment in src/lib/media.ts.
/assets/videos/*
  Cache-Control: public, max-age=31536000, immutable

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

# HTML must revalidate or deploys never reach anyone.
/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

Adjust the first two blocks to match what Step 1 reported; delete whichever does not exist.

**If you deploy somewhere else:**

- **Vercel** — use `vercel.json` `headers`, same values.
- **nginx** — `location ~* \.(webp|avif|mp4|webm|woff2)$ { add_header Cache-Control "public, max-age=31536000, immutable"; }`
- **Node/Nitro standalone** — `routeRules` in the Nitro config, e.g. `{ "/assets/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } } }`. Verify the option is threaded through the `tanstackStart()` Vite plugin before relying on it; if it is not, put a reverse proxy in front instead.

- [ ] **Step 3: Write the folder rules where they apply**

Create `src/assets/images/README.md`:

```markdown
# Images

Everything here is resolved through `src/lib/media.ts` and fingerprinted by Vite
at build time. Reference an image by its path relative to this folder:

    image("products/ev/bestiva.webp")

A typo throws at build/dev time with the list of valid keys — it will not ship a
broken image.

## Where things go

| Folder | Contents |
|---|---|
| `hero/` | Above-the-fold imagery other than the video poster |
| `products/<category>/` | One folder per category in `src/content/categories/` |
| `site/` | Logo, gallery/facility photos, backgrounds — everything that isn't a specific product. Kept flat rather than pre-split into subfolders. |

## Rules

- WebP for photos, SVG for flat art. No PNG/JPEG in this folder.
- Lowercase, hyphenated, descriptive: `team-office.webp`, not `IMG_4821.webp`.
- Resize to the largest size the image actually renders at — see
  `docs/media-workflow.md` for the sizing table.
- Originals stay in `assets-source/` (gitignored). Only exports live here.

## Adding a category

1. `mkdir src/assets/images/products/<slug>` and drop the photos in
2. Copy `src/content/categories/ev.ts` to `<slug>.ts` and edit it
3. Import and append it to the `registry` array in `src/content/index.ts`

Nothing else changes. The gallery, nav and section rendering all read the registry.

## Videos and fonts are NOT here

They live in `public/assets/` — large streaming media gains nothing from the
bundler and needs a stable URL for preloading and range requests. See the header
comment in `src/lib/media.ts`.
```

- [ ] **Step 4: Verify the headers are actually served**

Deploy to a preview URL, then:

```bash
curl -sI https://<your-preview-url>/assets/video/hero-v1.mp4 | grep -i cache-control
```

Expected: `cache-control: public, max-age=31536000, immutable`

If the header is absent, the host does not read `_headers` — use the platform equivalent from Step 2.

- [ ] **Step 5: Commit**

```bash
git add public/_headers src/assets/images/README.md
git commit -m "chore: add long-lived cache headers and asset folder documentation"
```

---

### Task 7: Asset preparation guide

**Files:**
- Create: `docs/media-workflow.md`

- [ ] **Step 1: Measure the real display sizes**

Before writing the sizing table, confirm the numbers. Run `npm run dev`, open DevTools, and for each image right-click → Inspect and read the rendered box width at a 1440px viewport. Multiply by 2 for retina. Record the actual figures; the table below carries my estimates from reading the Tailwind classes, and yours may differ.

- [ ] **Step 2: Write the guide**

Create `docs/media-workflow.md`:

````markdown
# Media Workflow

How to get a photo or video from a camera into this site.

## The two-root rule

| What | Where | Why |
|---|---|---|
| Images | `src/assets/images/` | Vite fingerprints the filename, so a 1-year cache header is safe |
| Videos, fonts | `public/assets/` | Served raw at a stable URL; needed for preload and range requests |
| Originals | `assets-source/` | Gitignored. A 19 MB mp4 in git history is permanent |

## Images

### 1. Pick the target width

Export at the largest size the image actually renders at, times 2 for retina.
Bigger than that is bytes nobody sees.

| Used as | Renders at | Export width |
|---|---|---|
| Product card | ~400px | **800** |
| Robotics feature | ~600px | **1200** |
| Gallery tile | ~600px | **1200** |
| Hero poster | full-bleed | **1920** |
| Logo | 40px | **96** |

Re-measure with DevTools if you change a layout.

### 2. Convert

**Squoosh** (<https://squoosh.app>) — drag in, pick WebP, quality 80, set width,
download. Best for one-offs; you see the quality tradeoff live.

**CLI** for batches:

```bash
npx --yes @squoosh/cli --webp '{"quality":80}' \
  --resize '{"enabled":true,"width":800}' \
  -d src/assets/images/products/ev \
  assets-source/images/*.png
```

**Sharp** if you want it scripted:

```bash
npm install -D sharp
node -e "require('sharp')('in.png').resize({width:800}).webp({quality:80}).toFile('out.webp')"
```

Quality 80 is the right default. Go to 85 for images with fine detail or text;
drop to 70 for anything behind an overlay.

### 3. Name it and register it

Lowercase, hyphenated, descriptive. Then add an `ImageRef` to the relevant file
in `src/content/categories/` with the **real** intrinsic dimensions:

```bash
node -e "require('sharp')('src/assets/images/products/ev/bestiva.webp').metadata().then(m=>console.log(m.width,m.height))"
```

Guessing these reintroduces the layout shift they exist to prevent.

## Video

Target: **under 4 MB**. The hero renders at 40% opacity under a gradient, so it
can be compressed far harder than a video anyone actually watches.

**HandBrake** (GUI, <https://handbrake.fr>) — preset "Web > Gmail Large 3 Minutes
720p30", then: Video tab → RF 30; Audio tab → remove all tracks; Video tab →
check "Web Optimized".

**ffmpeg** (what the build assumes):

```bash
# MP4 — universal fallback
ffmpeg -i assets-source/videos/hero-original.mp4 \
  -vf "scale=1920:-2,fps=30" -an \
  -c:v libx264 -profile:v high -crf 30 -preset slow -pix_fmt yuv420p \
  -movflags +faststart \
  public/assets/video/hero-v1.mp4

# WebM/VP9 — ~30% smaller, offered first
ffmpeg -i assets-source/videos/hero-original.mp4 \
  -vf "scale=1920:-2,fps=30" -an \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
  public/assets/video/hero-v1.webm

# Poster — frame 1
ffmpeg -i public/assets/video/hero-v1.mp4 \
  -vframes 1 -vf "scale=1920:-2" -c:v libwebp -quality 82 \
  public/assets/video/hero-v1-poster.webp
```

What the flags do:

- `-an` drops audio. The hero is muted; the track is pure waste.
- `-movflags +faststart` moves the index to the front so playback starts before
  the file finishes downloading. Skipping this is the single most common hero
  video mistake.
- `-crf 30` / `-crf 36` are the quality dials. Higher = smaller = worse. Raise
  them before you lower the resolution.
- `fps=30` — drop to 24 for another easy 20%.

Still over 4 MB? Use `scale=1280:-2` and `-crf 34`. Behind the overlay it is
indistinguishable.

### Replacing a video later

`public/` files are not auto-fingerprinted and are served `immutable` for a year,
so **the version lives in the filename**. To ship new footage:

1. Encode to `hero-v2.mp4`, `hero-v2.webm`, `hero-v2-poster.webp`
2. Bump the three paths in `VIDEO` in `src/lib/media.ts`
3. Deploy, then delete the `v1` files once the deploy is live

Every visitor gets the new video on their next page load, because `hero-v2.mp4` is
a URL their browser has never seen. Overwriting `hero-v1.mp4` in place instead would
leave returning visitors on the cached old copy for up to a year — that is exactly
what the version number exists to prevent.

### Cross-browser playback

The `<source>` order in `hero-video.tsx` is WebM first, MP4 second. Browsers take
the first one they can decode:

| Browser | Gets |
|---|---|
| Chrome, Edge, Firefox, Android | `hero-v1.webm` (VP9, ~30% smaller) |
| Safari (macOS/iOS), anything older | `hero-v1.mp4` (H.264, universal) |

This is why both files exist. Never ship WebM alone — Safari's VP9 support depends
on OS version and you would be gambling on your visitors' hardware. H.264 in MP4
plays everywhere and always has.

## Fonts

`public/assets/fonts/`. The site currently loads Space Grotesk and Inter from
Google Fonts (`src/routes/__root.tsx`). To self-host: download WOFF2, add
`@font-face` to `src/styles.css` with `font-display: swap`, drop the two
`preconnect` links and the Google stylesheet link, and preload the one font that
renders in the hero.

## CDN

There is no CDN in front of this site today. Static hosts (Netlify, Vercel,
Cloudflare Pages) include edge caching, so if you deploy to one of those you are
already covered and can stop reading.

If you deploy to a single origin server (a VPS, or anything behind one IP),
put **Cloudflare's free tier** in front:

1. Add the domain to Cloudflare, switch the nameservers.
2. Set the DNS record for the site to **Proxied** (orange cloud).
3. Speed → Optimization → enable Brotli.
4. Caching → Configuration → Browser Cache TTL: "Respect Existing Headers" —
   this makes `public/_headers` authoritative rather than being overridden.

That gives edge caching of every `/assets/*` request worldwide, which matters
most for the video: served from your origin it is a 3 MB transfer per visitor
from one location; from the edge it is a local hit.

Do **not** enable Cloudflare's Auto Minify or Rocket Loader — both interfere
with Vite's hashed output and the hydration bundle.
````

- [ ] **Step 3: Commit**

```bash
git add docs/media-workflow.md
git commit -m "docs: add media preparation and CDN guide"
```

---

### Task 8: Final verification

- [ ] **Step 1: Full check**

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

All four must pass.

- [ ] **Step 2: Confirm no Lovable references survive**

```bash
grep -rn "asset.json\|__l5e\|assets-v1" src/ || echo "clean"
```

Expected: `clean`.

- [ ] **Step 3: Confirm every image is lazy except the intended eager ones**

```bash
grep -rn "<img" src/ | grep -v "loading="
```

Expected: only `src/components/media/img.tsx` and `src/components/media/hero-video.tsx`. Any other hit is a raw `<img>` that skipped the `<Img>` component — convert it.

- [ ] **Step 4: Measure**

```bash
npm run build && npm run preview
```

Open the preview URL in an incognito window, run Lighthouse (Performance, Mobile). Record LCP and CLS.

Targets: **LCP under 2.5s**, **CLS under 0.1**. If LCP misses, the poster is the likely culprit — check it is actually preloading and is under 200 KB.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: verify media pipeline end to end"
```

---

## Follow-up work (not in this plan)

**Split `RanayarSite.tsx`.** It is 884 lines holding the header, hero, five content sections, a GSAP horizontal-scroll effect, a testimonial carousel, a gallery lightbox and the footer. Extracting each section into `src/routes/-components/sections/` would make every one of them independently readable and editable. Deliberately excluded here so a media refactor stays reviewable on its own — it deserves its own plan.

**Give EMS photography.** Its six services currently have `media: []`. Once photos exist, drop them in `src/assets/images/products/ems/` and fill in the arrays; the gallery picks them up with no other change.

**Responsive `srcset`.** `<Img>` serves one size to every viewport. If you later export images at multiple widths, adding `srcset`/`sizes` is a change to `img.tsx` alone — no call site moves. Not worth it until you have measured that it matters.
