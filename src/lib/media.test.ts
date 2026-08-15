import { describe, expect, it } from "vitest";
import { hasImage, image, listImages, VIDEO } from "./media";

/**
 * These tests exercise the resolver itself, so they run against a dedicated
 * 1x1 fixture rather than real product photography. That keeps them green
 * independently of which assets happen to be exported — the "do the referenced
 * images actually exist" question belongs to src/content/index.test.ts.
 */
const FIXTURE = "__fixtures__/test-pixel.webp";

describe("image()", () => {
  it("resolves a real key to a build URL", () => {
    expect(image(FIXTURE)).toMatch(/test-pixel/);
  });

  it("throws a descriptive error for a missing key", () => {
    expect(() => image("products/ev/does-not-exist.webp")).toThrowError(
      /Missing image "products\/ev\/does-not-exist\.webp"/,
    );
  });

  it("names the expected path in the error so the fix is obvious", () => {
    expect(() => image("nope.webp")).toThrowError(/src\/assets\/images\/nope\.webp/);
  });

  it("lists known images in the error, so a typo is easy to spot", () => {
    expect(() => image("nope.webp")).toThrowError(/test-pixel\.webp/);
  });
});

describe("hasImage()", () => {
  it("is true for a real key and false for a missing one", () => {
    expect(hasImage(FIXTURE)).toBe(true);
    expect(hasImage("products/ev/does-not-exist.webp")).toBe(false);
  });
});

describe("listImages()", () => {
  it("returns keys relative to the image root", () => {
    expect(listImages()).toContain(FIXTURE);
  });

  it("filters by prefix", () => {
    const fixtures = listImages("__fixtures__/");
    expect(fixtures.length).toBeGreaterThan(0);
    expect(fixtures.every((k) => k.startsWith("__fixtures__/"))).toBe(true);
  });

  it("returns keys sorted, so output is stable", () => {
    const all = listImages();
    expect(all).toEqual([...all].sort());
  });
});

describe("VIDEO", () => {
  it("points at public/ paths, not bundled modules", () => {
    expect(VIDEO.heroMp4).toBe("/assets/video/hero-v1.mp4");
  });

  it("carries a version in every public/ filename", () => {
    for (const [name, path] of Object.entries(VIDEO)) {
      expect(path, `${name} must be versioned`).toMatch(/-v\d+[.-]/);
    }
  });
});
