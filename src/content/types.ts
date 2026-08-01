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
