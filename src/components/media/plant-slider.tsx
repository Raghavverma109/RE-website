import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Autoplay, EffectFade, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper/types";
import "swiper/css";
import "swiper/css/effect-fade";

import { image, listImages } from "@/lib/media";

const PLANT_PREFIX = "site/Plant/";

/**
 * Facility slider for the homepage — every image dropped into
 * src/assets/images/site/Plant/ shows up here automatically via listImages(),
 * no manual wiring needed.
 */
export function PlantSlider() {
  const swiperRef = useRef<SwiperClass | null>(null);
  const photos = listImages(PLANT_PREFIX);

  if (photos.length === 0) return null;

  return (
    <div className="relative w-full">
      <Swiper
        modules={[Autoplay, EffectFade, Keyboard]}
        onSwiper={(s) => (swiperRef.current = s)}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        keyboard={{ enabled: true }}
        autoplay={{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        className="aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]"
      >
        {photos.map((key, i) => (
          <SwiperSlide key={key}>
            <img
              src={image(key)}
              alt={`RANAYARA manufacturing facility, view ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/60 to-transparent" />
      <div className="absolute bottom-6 right-5 flex gap-3 sm:right-8">
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
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:border-brand-accent hover:bg-brand-accent"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
