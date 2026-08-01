# Images

Everything here is resolved through `src/lib/media.ts` and fingerprinted by Vite
at build time. Reference an image by its path relative to this folder:

```ts
image("products/ev/bestiva.webp")
```

A typo throws at build/dev time with the list of valid keys — it will not ship a
broken image.

Prefer the `<Img>` component over a raw `<img>`; it handles lazy-loading,
fetch priority and layout stability for you:

```tsx
<Img media={product.media[0]} />                 // below the fold
<Img media={product.media[0]} priority />        // above the fold
```

## Where things go — only two real folders

| Folder | Contents |
|---|---|
| `products/<category>/` | One folder per category in `src/content/categories/`. This is the folder meant to keep growing. |
| `site/` | Everything else: logo, gallery/facility photos, background textures. Flat — don't pre-split into `site/logos/`, `site/gallery/` etc. until there are enough files in one to actually need it. |
| `__fixtures__/` | Test-only. A 1×1 pixel used by `src/lib/media.test.ts`. Not for site content. |

That's the whole list. If you find yourself wanting a third top-level bucket,
ask whether it's really "not a product" content (→ `site/`) or a new product
line (→ a new folder under `products/`).

## Rules

- WebP for photos, SVG for flat art. No PNG/JPEG in this folder.
- Lowercase, hyphenated, descriptive: `team-office.webp`, not `IMG_4821.webp`.
- Resize to the largest size the image actually renders at — see
  `docs/media-workflow.md` for the sizing table.
- Originals stay in `assets-source/` (gitignored). Only exports live here.
- Every image needs real `width`/`height` in its `ImageRef`. Get them with
  `node scripts/image-dimensions.mjs`.

## Adding a category

1. `mkdir src/assets/images/products/<slug>` and drop the photos in
2. Copy `src/content/categories/ev.ts` to `<slug>.ts` and edit it
3. Import and append it to the `registry` array in `src/content/index.ts`

Nothing else changes. The gallery, nav and section rendering all read the registry.

## Video and fonts are NOT here

They live in `public/assets/` — large streaming media gains nothing from the
bundler and needs a stable URL for preloading. Because those files are not
auto-fingerprinted, they carry a version in the filename (`hero-v1.mp4`). See the
header comment in `src/lib/media.ts`.
