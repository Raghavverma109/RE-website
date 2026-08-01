import type { ImgHTMLAttributes } from "react";
import type { ImageRef } from "@/content/types";
import { image } from "@/lib/media";
import { cn } from "@/lib/utils";

type ImgProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height" | "loading" | "decoding"
> & {
  media: ImageRef;
  /**
   * Set on above-the-fold images ONLY. Loads eagerly at high fetch priority.
   * Marking everything priority is the same as marking nothing.
   */
  priority?: boolean;
};

/**
 * The one way this site renders a photo.
 *
 * Every performance rule lives here so no call site has to remember it:
 *   - width/height + aspect-ratio        -> zero layout shift
 *   - loading="lazy" unless priority     -> below-the-fold images cost nothing
 *   - fetchPriority="high" when priority -> hero media wins the bandwidth race
 *   - src resolved through image()       -> fingerprinted URL, throws on typo
 */
export function Img({ media, priority = false, className, style, ...rest }: ImgProps) {
  return (
    <img
      src={image(media.key)}
      alt={media.alt}
      width={media.width}
      height={media.height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={cn("max-w-full", className)}
      style={{ aspectRatio: `${media.width} / ${media.height}`, ...style }}
      {...rest}
    />
  );
}
