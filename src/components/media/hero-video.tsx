import { useHeroVideoEnabled } from "@/hooks/use-hero-video-enabled";
import { VIDEO } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Decorative full-bleed hero background.
 *
 * The poster <img> is always rendered and always visible underneath — it is the
 * LCP candidate and it paints on the server render. The <video> mounts on top
 * only once useHeroVideoEnabled() approves, so visitors who never qualify never
 * pay for it.
 *
 * Source order is WebM then MP4: Chrome/Edge/Firefox/Android take the smaller
 * VP9 file, Safari falls through to H.264. Both must exist.
 *
 * aria-hidden + empty alt: this is atmosphere, not content. Screen readers get
 * the <h1> instead.
 */
export function HeroVideo({ className }: { className?: string }) {
  const enabled = useHeroVideoEnabled();

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <img
        src={VIDEO.heroPoster}
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {enabled && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={VIDEO.heroPoster}
        >
          <source src={VIDEO.heroWebm} type="video/webm" />
          <source src={VIDEO.heroMp4} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
