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

const imageModules = import.meta.glob("/src/assets/images/**/*.{webp,avif,svg,png,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

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
 * Raw-served media in public/. Paths are stable and carry their own version —
 * see this file's header comment before changing one.
 */
export const VIDEO = {
  heroMp4: "/assets/video/hero-v1.mp4",
} as const;
