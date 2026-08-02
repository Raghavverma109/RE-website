import { useMemo } from "react";
import type { ImageRef } from "@/content/types";
import { image } from "@/lib/media";
import Masonry, { type MasonryItem } from "./masonry";

const BASE_WIDTH = 400;

type GalleryMasonryProps = {
  /** The photos to lay out, in display order. */
  media: ImageRef[];
  /** Receives the index into `media` of the clicked photo, e.g. to open a lightbox. */
  onSelect?: (index: number) => void;
};

/**
 * A set of images laid out as an animated masonry grid.
 *
 * The caller owns the list so it can filter it, and gets back an index rather
 * than a URL — a lightbox needs to know *where* in the set it is to offer
 * prev/next, which a bare src can't tell it.
 */
export function GalleryMasonry({ media, onSelect }: GalleryMasonryProps) {
  const items = useMemo<MasonryItem[]>(
    () =>
      media.map((m, i) => {
        const src = image(m.key);
        return {
          // Index-suffixed: the same photo may legitimately appear under two
          // products, and Masonry addresses tiles by a unique data-key.
          id: `${m.key}-${i}`,
          img: src,
          url: src,
          height: BASE_WIDTH * (m.height / m.width),
        };
      }),
    [media],
  );

  const indexById = useMemo(() => new Map(items.map((it, i) => [it.id, i])), [items]);

  return (
    <Masonry
      items={items}
      ease="power3.out"
      duration={0.6}
      stagger={0.05}
      animateFrom="bottom"
      scaleOnHover
      hoverScale={0.95}
      blurToFocus
      colorShiftOnHover={false}
      onItemClick={onSelect ? (item) => onSelect(indexById.get(item.id) ?? 0) : undefined}
    />
  );
}
