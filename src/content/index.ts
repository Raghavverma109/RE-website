import type { Category, ImageRef, Product } from "./types";
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

/**
 * One image per product — a cross-section of the whole catalogue.
 *
 * Used where showing every photo would be noise: the homepage gallery teaser
 * and the gallery page's featured slider both want breadth, not depth.
 */
export function featuredMedia(limit = Infinity): ImageRef[] {
  return categories
    .flatMap((c) => c.items)
    .flatMap((i) => (i.media[0] ? [i.media[0]] : []))
    .slice(0, limit);
}

/** Every image grouped by the category it came from — powers the gallery filters. */
export function mediaByCategory(): { slug: string; name: string; media: ImageRef[] }[] {
  return categories
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      media: c.items.flatMap((i) => i.media),
    }))
    .filter((g) => g.media.length > 0);
}

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

export type { Category, ImageRef, Product } from "./types";
