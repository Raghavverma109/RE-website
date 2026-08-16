import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Autoplay, EffectFade, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import "swiper/css";
import "swiper/css/effect-fade";

import { allMedia, mediaByCategory } from "@/content";
import type { ImageRef } from "@/content/types";
import { GalleryMasonry } from "@/components/media/gallery-masonry";
import { Lightbox, type LightboxItem } from "@/components/media/lightbox";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { hasImage, image } from "@/lib/media";
import { canonicalUrl, SITE } from "@/lib/site";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

const GALLERY_HERO_IMAGE_KEY = "site/galleryHero.webp";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: `Gallery — ${SITE.name}` },
      {
        name: "description",
        content: "Inside the RANAYARA floor: our electric vehicle lineup, in photographs.",
      },
      { property: "og:title", content: `Gallery — ${SITE.name}` },
      {
        property: "og:description",
        content: "Photographs from the RANAYARA electric vehicle design and manufacturing floor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/gallery") }],
  }),
  component: GalleryPage,
});

const toLightboxItems = (media: ImageRef[]): LightboxItem[] =>
  media.map((m) => ({ src: image(m.key), alt: m.alt }));

function GalleryPage() {
  useSmoothScroll();

  const groups = useMemo(mediaByCategory, []);
  const everything = useMemo(allMedia, []);

  const [filter, setFilter] = useState("all");
  const [viewer, setViewer] = useState<{ items: LightboxItem[]; index: number } | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? everything : (groups.find((g) => g.slug === filter)?.media ?? [])),
    [filter, groups, everything],
  );

  const openViewer = (media: ImageRef[], index: number) =>
    setViewer({ items: toLightboxItems(media), index });

  return (
    <div className="min-h-screen bg-background text-ink">
      <ScrollProgress />
      <SiteHeader />

      <GalleryHero count={everything.length} />

      {/* FEATURED SLIDER */}
      <section className="overflow-hidden bg-ink pt-16 text-white">
        <div className="mx-auto mb-10 flex max-w-[1320px] flex-wrap items-end justify-between gap-4 px-5 sm:px-8">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              Featured
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              One shot from every build.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-white/50">
            Drag, swipe or use the arrow keys. Tap any frame to open it full size.
          </p>
        </div>
        <FeaturedSlider media={everything} onSelect={(i) => openViewer(everything, i)} />
      </section>

      {/* Marks where the dark hero+slider zone ends, so the header knows how
          long to stay transparent — see SiteHeader's `header-transparent-until`. */}
      <div id="header-transparent-until" aria-hidden />

      {/* FULL GRID */}
      <section id="all" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 md:py-32">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
              The full set
            </div>
            <h2 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Every photograph.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
              All
              <Count>{everything.length}</Count>
            </FilterPill>
            {groups.map((g) => (
              <FilterPill key={g.slug} active={filter === g.slug} onClick={() => setFilter(g.slug)}>
                {g.name}
                <Count>{g.media.length}</Count>
              </FilterPill>
            ))}
          </div>
        </div>

        <div className="mt-12">
          {/* Keyed by filter so switching replays the staggered entrance rather
              than morphing tiles between two unrelated sets of photos. */}
          <GalleryMasonry key={filter} media={visible} onSelect={(i) => openViewer(visible, i)} />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/5 bg-secondary py-20">
        <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-6 px-5 sm:px-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Want to see a line like this running yours?
            </h2>
            <p className="mt-2 text-charcoal">
              Book a facility walkthrough or request a spec sheet.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              hash="contact"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
            >
              Enquire now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Browse the catalog
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />

      <Lightbox
        items={viewer?.items ?? []}
        index={viewer?.index ?? null}
        onClose={() => setViewer(null)}
        onNavigate={(index) => setViewer((v) => (v ? { ...v, index } : v))}
      />
    </div>
  );
}

/**
 * A hairline bar across the top of the viewport that fills as the page scrolls.
 *
 * Written straight to the DOM node rather than held in state — a value updating
 * on every scroll frame would re-render the whole gallery sixty times a second.
 */
function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent">
      <div
        ref={barRef}
        className="h-full origin-left scale-x-0 bg-brand-accent"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}

/** Dark opening panel with a slow parallax drift on the backdrop. */
function GalleryHero({ count }: { count: number }) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const heroHasImage = hasImage(GALLERY_HERO_IMAGE_KEY);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [gsapMod, stMod] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !backdropRef.current) return;
      const gsap = gsapMod.default;
      gsap.registerPlugin(stMod.ScrollTrigger);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Travels ±8% of the backdrop's own height. The backdrop is 120% of the
      // section with 10% of overscan on each side, so 9.6% of travel can never
      // uncover an edge — animating 0 → +18% would have opened a gap at the top.
      const tween = gsap.fromTo(
        backdropRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: backdropRef.current.parentElement,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <section className="relative flex min-h-[68vh] items-end overflow-hidden bg-ink text-white">
      <div ref={backdropRef} className="absolute inset-0 -top-[10%] h-[120%]">
        {heroHasImage ? (
          <img
            src={image(GALLERY_HERO_IMAGE_KEY)}
            alt=""
            width={1537}
            height={1023}
            fetchPriority="high"
            className="h-full w-full object-cover opacity-65"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ink via-ink to-brand/40" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/70 to-brand/60" />
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-16 pt-36 sm:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-6xl md:text-7xl">
          Inside our floor.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/70">
          {count} photographs from the RANAYARA design and manufacturing floor — every vehicle we
          build, as it actually looks.
        </p>
      </div>
    </section>
  );
}

function FeaturedSlider({
  media,
  onSelect,
}: {
  media: ImageRef[];
  onSelect: (index: number) => void;
}) {
  const swiperRef = useRef<SwiperClass | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      swiperRef.current?.autoplay?.stop();
    }
  }, []);

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, EffectFade, Keyboard]}
        onSwiper={(s) => (swiperRef.current = s)}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        keyboard={{ enabled: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      >
        {media.map((m, i) => (
          <SwiperSlide key={m.key}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              className="group relative block h-[56vh] min-h-[320px] w-full sm:h-[70vh] md:h-screen"
            >
              <img
                src={image(m.key)}
                alt={m.alt}
                width={m.width}
                height={m.height}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent p-6 pt-24 text-left">
                <span className="line-clamp-1 text-xs font-medium text-white/80">{m.alt}</span>
              </span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute bottom-6 right-6 z-10 flex gap-3">
        <SliderArrow side="left" onClick={() => swiperRef.current?.slidePrev()} />
        <SliderArrow side="right" onClick={() => swiperRef.current?.slideNext()} />
      </div>
    </div>
  );
}

function SliderArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-brand-accent hover:bg-brand-accent"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
        active
          ? "border-brand bg-brand text-white shadow-sm"
          : "border-black/10 bg-white text-charcoal hover:border-brand/40 hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return <span className="text-xs opacity-60">{children}</span>;
}
