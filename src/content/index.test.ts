import { describe, expect, it } from "vitest";
import { allMedia, categories, getCategory, getProduct, getRelatedProducts } from "./index";
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
  // references a photo they forgot to export, and names the exact files.
  it("references only images that exist on disk", () => {
    const missing = allMedia()
      .filter((m) => !hasImage(m.key))
      .map((m) => m.key);
    expect(missing, `missing files:\n  ${missing.join("\n  ")}\n`).toEqual([]);
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
