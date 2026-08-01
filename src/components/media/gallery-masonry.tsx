import { useMemo } from "react";
import { allMedia } from "@/content";
import { image } from "@/lib/media";
import Masonry, { type MasonryItem } from "./masonry";

const BASE_WIDTH = 400;

type GalleryMasonryProps = {
  /** Called with the resolved image URL on click, e.g. to open a lightbox. */
  onImageClick?: (src: string) => void;
};

/** Every image used across the site's product categories, laid out as a masonry grid. */
export function GalleryMasonry({ onImageClick }: GalleryMasonryProps) {
  const items = useMemo<MasonryItem[]>(
    () =>
      allMedia().map((media) => {
        const src = image(media.key);
        return {
          id: media.key,
          img: src,
          url: src,
          height: BASE_WIDTH * (media.height / media.width),
        };
      }),
    [],
  );

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
      onItemClick={onImageClick ? (item) => onImageClick(item.img) : undefined}
    />
  );
}
