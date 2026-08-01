# Media Workflow

How to get a photo or video from a camera into this site.

## The two-root rule

| What | Where | Why |
|---|---|---|
| Images | `src/assets/images/` | Vite fingerprints the filename, so a 1-year cache header is safe |
| Video, fonts | `public/assets/` | Served raw at a stable URL; needed for `<link rel="preload">` |
| Originals | `assets-source/` | Gitignored. A 19 MB mp4 in git history is permanent |

Inside `src/assets/images/`, there are only two folders that ever hold real
content: `products/<category>/` (grows as you add product lines) and `site/`
(logo, gallery, backgrounds — everything that isn't a specific product, kept
flat rather than pre-split). See `src/assets/images/README.md` for the full rule.

## Why a 1-year cache is safe

Three cache policies, and the third is what makes the other two work:

| What | Policy |
|---|---|
| `index.html` | never cached |
| `bestiva-a3f9c1.webp` | 1 year, immutable |
| `hero-v1.mp4` | 1 year, immutable |

Because the HTML is never cached, it always names the *current* filenames. Replace
a photo and it rebuilds as `bestiva-7d1b40.webp`; a returning visitor fetches fresh
HTML, sees a URL their browser has never held, and downloads it. The stale copy in
their cache is simply never requested again.

"Cache for a year" therefore never means "show stale content for a year." It means
"this exact URL will never contain different bytes" — true by construction when the
hash is in the name.

The one file without an automatic hash is the video, which is why it is called
`hero-v1.mp4`. See "Replacing a video later" below.

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
| Logo | 40px | **96** (`site/`) |

These are estimates read off the Tailwind classes. Re-measure with DevTools
(right-click → Inspect, read the rendered box width at a 1440px viewport) if you
change a layout.

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

**ffmpeg**, if `@squoosh/cli` chokes on your Node version:

```bash
ffmpeg -i assets-source/images/ev-1.png -vf "scale=800:-2" \
  -c:v libwebp -quality 80 \
  src/assets/images/products/ev/rafander-motiva.webp
```

**Sharp** if you want it scripted:

```bash
npm install -D sharp
node -e "require('sharp')('in.png').resize({width:800}).webp({quality:80}).toFile('out.webp')"
```

Quality 80 is the right default. Go to 85 for images with fine detail or text;
drop to 70 for anything behind an overlay.

### 3. Name it and register it

Lowercase, hyphenated, descriptive. Then add an `ImageRef` to the relevant file in
`src/content/categories/` with the **real** intrinsic dimensions:

```bash
npm install -D sharp
node scripts/image-dimensions.mjs
```

Guessing these reintroduces the layout shift they exist to prevent. The category
files currently hold placeholder values (800×600, 1200×800) — replace them.

### 4. Check your work

```bash
npm test
```

`src/content/index.test.ts` fails and names any image referenced in a category file
that does not exist on disk. That failure list is your to-do.

## Video

Target: **under 4 MB**. The hero renders at 40% opacity under a gradient, so it can
be compressed far harder than a video anyone actually watches.

**HandBrake** (GUI, <https://handbrake.fr>) — preset "Web > Gmail Large 3 Minutes
720p30", then: Video tab → RF 30; Audio tab → remove all tracks; Video tab → check
"Web Optimized".

**ffmpeg** (what the code assumes):

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

# Poster — frame 1, so the still matches what the video opens on
ffmpeg -i public/assets/video/hero-v1.mp4 \
  -vframes 1 -vf "scale=1920:-2" -c:v libwebp -quality 82 \
  public/assets/video/hero-v1-poster.webp
```

All three files live together in one `public/assets/video/` folder — they're
encoded from the same source and always replaced as a set, so there's no reason
to split them into subfolders.

What the flags do:

- `-an` drops audio. The hero is muted; the track is pure waste.
- `-movflags +faststart` moves the index to the front so playback starts before the
  file finishes downloading. Skipping this is the single most common hero video
  mistake.
- `-crf 30` / `-crf 36` are the quality dials. Higher = smaller = worse. Raise these
  before you lower the resolution.
- `fps=30` — drop to 24 for another easy 20%.

Still over 4 MB? Use `scale=1280:-2` and `-crf 34`. Behind the overlay it is
indistinguishable.

### Cross-browser playback

The `<source>` order in `src/components/media/hero-video.tsx` is WebM first, MP4
second. Browsers take the first one they can decode:

| Browser | Gets |
|---|---|
| Chrome, Edge, Firefox, Android | `hero-v1.webm` (VP9, ~30% smaller) |
| Safari (macOS/iOS), anything older | `hero-v1.mp4` (H.264, universal) |

This is why both files exist. Never ship WebM alone — Safari's VP9 support depends
on OS version and you would be gambling on your visitors' hardware. H.264 in MP4
plays everywhere and always has.

### Replacing a video later

`public/` files are not auto-fingerprinted and are served `immutable` for a year, so
**the version lives in the filename**. To ship new footage:

1. Encode to `hero-v2.mp4`, `hero-v2.webm`, `hero-v2-poster.webp`
2. Bump the three paths in `VIDEO` in `src/lib/media.ts`
3. Update the preload `href` in `src/routes/__root.tsx`
4. Deploy, then delete the `v1` files once the deploy is live

Every visitor gets the new video on their next page load, because `hero-v2.mp4` is a
URL their browser has never seen. Overwriting `hero-v1.mp4` in place would instead
leave returning visitors on the cached old copy for up to a year — exactly what the
version number prevents.

## Fonts

`public/assets/fonts/`. The site currently loads Space Grotesk and Inter from Google
Fonts (`src/routes/__root.tsx`). To self-host: download WOFF2, add `@font-face` to
`src/styles.css` with `font-display: swap`, drop the two `preconnect` links and the
Google stylesheet link, and preload the one font that renders in the hero.

## CDN

There is no CDN in front of this site today.

Note that `src/server.ts` exports a `fetch(request, env, ctx)` handler — the
Cloudflare Workers signature — and `.gitignore` lists `.wrangler/`. That is the
Lovable template: Lovable hosts on Cloudflare Workers. So the site is behind
Cloudflare's edge *right now*, via Lovable's account, and that goes away the moment
you move off their hosting.

**If you deploy to Netlify, Vercel, or Cloudflare Pages:** edge caching is included.
`public/_headers` (or `vercel.json`) is the only configuration. Skip the rest of this
section.

**If you deploy to a single origin server (VPS, one IP):** Cloudflare's free tier is
worth adding. Free plan is $0 with **unmetered bandwidth**, which is the benefit that
matters — a first-time visit costs ~4.5 MB here, and metered hosts typically include
100 GB/month (~22,000 first-time visitors).

1. Add the domain at Cloudflare, switch nameservers at your registrar
2. Set the site's DNS record to **Proxied** (orange cloud)
3. Speed → Optimization → enable Brotli
4. Caching → Configuration → Browser Cache TTL → **"Respect Existing Headers"**

Step 4 matters: without it Cloudflare overrides `public/_headers` and the long
caching silently does not happen.

Do **not** enable Auto Minify or Rocket Loader — both interfere with Vite's hashed
output and the hydration bundle.

### Other hosts' header syntax

- **Vercel** — `vercel.json` `headers` array, same values as `public/_headers`.
- **nginx** —
  ```nginx
  location ~* \.(webp|avif|mp4|webm|woff2)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
  ```
- **Node/Nitro standalone** — `routeRules` in the Nitro config, e.g.
  `{ "/assets/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } } }`.
  Verify the option is threaded through the `tanstackStart()` Vite plugin before
  relying on it; if it is not, put a reverse proxy in front instead.
