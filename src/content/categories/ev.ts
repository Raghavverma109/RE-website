import type { Category } from "../types";

/** Product copy lifted verbatim from the pre-refactor RanayarSite.tsx. */
export const ev: Category = {
  id: "ev",
  slug: "ev",
  name: "Electric Vehicles",
  eyebrow: "Electric Mobility",
  headline: "Built for Indian roads, engineered for range.",
  blurb:
    "A full line of electric two-, three- and cargo vehicles, designed and manufactured in-house.",
  order: 10,
  items: [
    {
      slug: "rafander-motiva",
      name: "RAFANDER Motiva",
      tag: "Electric Scooter",
      specs: ["Range 90 km", "Top speed 65 km/h", "Removable Li-ion", "Zero emissions"],
      media: [
        {
          key: "products/ev/rafander-motiva.webp",
          alt: "RAFANDER Motiva electric scooter, side profile",
          width: 1393,
          height: 1129,
        },
      ],
    },
    {
      slug: "rafander",
      name: "RAFANDER",
      tag: "Electric Bike",
      specs: ["Range 110 km", "Fast charge 3.5 h", "LED signature light", "Digital cluster"],
      media: [
        {
          key: "products/ev/rafander.webp",
          alt: "RAFANDER electric bike, side profile",
          width: 1402,
          height: 1122,
        },
        {
          key: "products/ev/rafander1.webp",
          alt: "RAFANDER electric bike, alternate angle",
          width: 1306,
          height: 1204,
        },
        {
          key: "products/ev/rafander2.webp",
          alt: "RAFANDER electric bike, detail view",
          width: 1402,
          height: 1122,
        },
      ],
    },
    {
      slug: "e-cart-loader",
      name: "E-Cart Loader",
      tag: "Cargo EV",
      specs: ["500 kg payload", "Range 100 km", "Heavy-duty chassis", "Reverse assist"],
      media: [
        {
          key: "products/ev/e-cart-loader.webp",
          alt: "E-Cart Loader cargo electric vehicle with flatbed",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ev/e-cart-loader1.webp",
          alt: "E-Cart Loader cargo electric vehicle, alternate angle",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ev/e-cart-loader2.webp",
          alt: "E-Cart Loader cargo electric vehicle, loaded flatbed",
          width: 1402,
          height: 1122,
        },
        {
          key: "products/ev/e-cart-loader3.webp",
          alt: "E-Cart Loader cargo electric vehicle, rear view",
          width: 1536,
          height: 1024,
        },
      ],
    },
    {
      slug: "e-lion",
      name: "RANAYARA E-Lion",
      tag: "Performance EV",
      specs: ["Peak 8 kW motor", "Sport chassis", "Regenerative brakes", "Alloy wheels"],
      media: [
        {
          key: "products/ev/e-lion.webp",
          alt: "RANAYARA E-Lion performance electric vehicle",
          width: 1402,
          height: 1122,
        },
      ],
    },
    {
      slug: "bestiva",
      name: "RANAYARA BESTIVA",
      tag: "Passenger E-Auto",
      specs: ["4+1 seater", "Range 140 km", "Fleet-ready", "Low TCO"],
      media: [
        {
          key: "products/ev/bestiva.webp",
          alt: "RANAYARA BESTIVA passenger electric auto rickshaw",
          width: 1535,
          height: 1024,
        },
        {
          key: "products/ev/bestiva1.webp",
          alt: "RANAYARA BESTIVA passenger electric auto rickshaw, alternate angle",
          width: 1274,
          height: 1235,
        },
        {
          key: "products/ev/bestiva2.webp",
          alt: "RANAYARA BESTIVA passenger electric auto rickshaw, interior view",
          width: 1535,
          height: 1025,
        },
      ],
    },
  ],
};
