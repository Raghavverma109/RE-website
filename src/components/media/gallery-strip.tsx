import type { CSSProperties } from "react";
import type { ImageRef } from "@/content/types";
import { image } from "@/lib/media";

type GalleryStripProps = {
  media: ImageRef[];
  /** Receives the index into `media` of the clicked photo. */
  onSelect?: (index: number) => void;
};

/**
 * Two rows of photos drifting in opposite directions — the homepage's gallery
 * teaser.
 *
 * Deliberately not the masonry grid. Masonry preloads every image before it can
 * lay anything out, which on the homepage meant ~60 downloads competing with
 * the hero video. This shows a curated dozen, lazily, and sends anyone who
 * wants the rest to /gallery.
 */
export function GalleryStrip({ media, onSelect }: GalleryStripProps) {
  const half = Math.ceil(media.length / 2);
  const rows = [media.slice(0, half), media.slice(half)];

  return (
    <div className="space-y-4">
      {rows.map((row, rowIndex) =>
        row.length === 0 ? null : (
          <MarqueeRow
            key={rowIndex}
            media={row}
            offset={rowIndex === 0 ? 0 : half}
            reverse={rowIndex === 1}
            durationSeconds={rowIndex === 0 ? 48 : 62}
            onSelect={onSelect}
          />
        ),
      )}
    </div>
  );
}

function MarqueeRow({
  media,
  offset,
  reverse,
  durationSeconds,
  onSelect,
}: {
  media: ImageRef[];
  offset: number;
  reverse: boolean;
  durationSeconds: number;
  onSelect?: (index: number) => void;
}) {
  return (
    <div
      className="gallery-marquee no-scrollbar [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]"
      style={
        {
          "--marquee-duration": `${durationSeconds}s`,
          "--marquee-direction": reverse ? "reverse" : "normal",
        } as CSSProperties
      }
    >
      <div className="gallery-marquee__track">
        {/* The list twice: the copy is what makes the loop seamless, and it's
            aria-hidden so screen readers announce each photo once. */}
        {[...media, ...media].map((m, i) => {
          const isClone = i >= media.length;
          return (
            <button
              key={i}
              type="button"
              tabIndex={isClone ? -1 : 0}
              aria-hidden={isClone || undefined}
              onClick={() => onSelect?.(offset + (i % media.length))}
              className="group relative mr-4 block h-40 w-60 shrink-0 overflow-hidden rounded-2xl bg-secondary sm:h-52 sm:w-80"
            >
              <img
                src={image(m.key)}
                alt={isClone ? "" : m.alt}
                width={m.width}
                height={m.height}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/20" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
