import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxItem = { src: string; alt: string };

type LightboxProps = {
  items: LightboxItem[];
  /** Index of the open image, or null when closed. */
  index: number | null;
  onClose: () => void;
  /** Called with a wrapped index. */
  onNavigate: (index: number) => void;
};

/**
 * Full-screen image viewer shared by the homepage teaser and the gallery page.
 *
 * Navigation wraps in both directions, so the last image steps forward to the
 * first — a dead-ended arrow at the edge of a 60-photo set is just a click that
 * does nothing.
 */
export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const open = index !== null && items.length > 0;

  const step = (delta: number) => {
    if (index === null || items.length === 0) return;
    onNavigate((index + delta + items.length) % items.length);
  };
  const stepRef = useRef(step);
  stepRef.current = step;

  // Lenis drives the page from wheel events on the window; locking the body
  // keeps what's behind the overlay from creeping while it's open. Keyed on
  // `open` alone so stepping between photos doesn't unlock and relock.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") stepRef.current(1);
      if (e.key === "ArrowLeft") stepRef.current(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Re-stated rather than reusing `open` so TypeScript narrows `index` to a number.
  if (index === null) return null;
  const item = items[index];
  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[100] grid place-items-center bg-ink/95 p-4 backdrop-blur sm:p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
      >
        <X className="h-6 w-6" />
      </button>

      {items.length > 1 && (
        <>
          <LightboxArrow side="left" onClick={() => step(-1)} />
          <LightboxArrow side="right" onClick={() => step(1)} />
        </>
      )}

      {/* Stop propagation so clicking the photo itself doesn't dismiss. */}
      <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={item.src}
          alt={item.alt}
          className="mx-auto max-h-[78vh] max-w-full rounded-xl object-contain shadow-2xl"
        />
        <figcaption className="mt-4 text-center text-sm text-white/60">
          {item.alt}
          <span className="ml-3 text-white/35">
            {index + 1} / {items.length}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

function LightboxArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={`absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 ${
        side === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6"
      }`}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}
