import type { Category } from "../types";

/**
 * No photography for this category yet — every item has `media: []`, which is a
 * valid state. When photos exist, drop them in src/assets/images/products/ems/
 * and fill in the arrays; the gallery and section rendering pick them up with
 * no other change.
 */
export const ems: Category = {
  id: "ems",
  slug: "ems",
  name: "Electronics Manufacturing",
  eyebrow: "EMS",
  headline: "PCB, SMT and precision electronics under one roof.",
  blurb:
    "End-to-end electronics manufacturing services, from board assembly to tested storage products.",
  order: 20,
  items: [
    {
      slug: "pcb-assembly",
      name: "PCB Assembly",
      desc: "Multilayer boards, precision assembly.",
      media: [],
    },
    {
      slug: "smt-manufacturing",
      name: "SMT Manufacturing",
      desc: "High-throughput surface mount lines.",
      media: [],
    },
    {
      slug: "wave-soldering",
      name: "Wave Soldering",
      desc: "Reliable through-hole joints at scale.",
      media: [],
    },
    {
      slug: "jigs-and-fixtures",
      name: "Jigs & Fixtures",
      desc: "Custom tooling for repeatable quality.",
      media: [],
    },
    {
      slug: "wave-pallets",
      name: "Wave Pallets",
      desc: "Engineered pallets for wave processes.",
      media: [],
    },
    {
      slug: "ssd-production",
      name: "SSD Production",
      desc: "Storage assembly with tested reliability.",
      media: [],
    },
  ],
};
