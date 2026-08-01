import type { Category } from "../types";

/**
 * Photography lives in src/assets/images/products/ems/, one sub-folder per
 * product. Those folder names carry spaces and an ampersand because that is how
 * they were exported — the keys below match the files on disk exactly. Every
 * other category uses flat kebab-case names; if these are ever renamed to match,
 * the keys here have to move with them.
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
      media: [
        {
          key: "products/ems/PCB Assembly/PCB8.webp",
          alt: "RE Electronics power control board and SMPS power board, component side",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ems/PCB Assembly/PCB5.webp",
          alt: "Multilayer board shown solder side and component side",
          width: 1402,
          height: 1122,
        },
        {
          key: "products/ems/PCB Assembly/PCB10.webp",
          alt: "Power control board with bulk capacitors and toroidal chokes",
          width: 1151,
          height: 1366,
        },
        {
          key: "products/ems/PCB Assembly/PCB4.webp",
          alt: "FWSOC-10 power board seated in an aluminium assembly pallet",
          width: 1122,
          height: 1402,
        },
        {
          key: "products/ems/PCB Assembly/PCB9.webp",
          alt: "Four-up board panel loaded in a conformal coating fixture",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ems/PCB Assembly/PCB6.webp",
          alt: "Green driver boards with transformers held in black test fixtures",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ems/PCB Assembly/PCB2.webp",
          alt: "Populated control boards staged at an open in-circuit test fixture",
          width: 1254,
          height: 1254,
        },
        {
          key: "products/ems/PCB Assembly/PCB7.webp",
          alt: "Precision dispensing needle positioned over a machined part on the line",
          width: 1086,
          height: 1448,
        },
        {
          key: "products/ems/PCB Assembly/PCB3.webp",
          alt: "Twin-nozzle dispensing station running over circular workholding plates",
          width: 1122,
          height: 1402,
        },
        {
          key: "products/ems/PCB Assembly/PCB1.webp",
          alt: "Assembled ceiling speaker, rear view with terminal block and tapped 8-ohm transformer",
          width: 1122,
          height: 1402,
        },
      ],
    },
    {
      slug: "smt-manufacturing",
      name: "SMT Manufacturing",
      desc: "High-throughput surface mount lines.",
      media: [
        {
          key: "products/ems/SMT Manufacturing/SMT1.webp",
          alt: "SMT stencil frame and board panel set up for solder paste printing",
          width: 1536,
          height: 1024,
        },
        {
          key: "products/ems/SMT Manufacturing/SMT3.webp",
          alt: "Stainless routing fixture holding a six-up panel of circular boards",
          width: 1536,
          height: 1024,
        },
        {
          key: "products/ems/SMT Manufacturing/SMT5.webp",
          alt: "Gantry depaneling machine with fixture plates staged below",
          width: 1122,
          height: 1402,
        },
        {
          key: "products/ems/SMT Manufacturing/SMT4.webp",
          alt: "Stack of machined aluminium four-cavity SMT fixtures",
          width: 1086,
          height: 1448,
        },
        {
          key: "products/ems/SMT Manufacturing/SMT2.webp",
          alt: "Machined SMT board carriers, shown stacked and individually",
          width: 1536,
          height: 1024,
        },
      ],
    },
    {
      slug: "wave-soldering",
      name: "Wave Soldering",
      desc: "Reliable through-hole joints at scale.",
      media: [
        {
          key: "products/ems/Wave Soldering/WS3.webp",
          alt: "Twin-head automatic soldering machine with fume extraction",
          width: 1086,
          height: 1448,
        },
        {
          key: "products/ems/Wave Soldering/WS1.webp",
          alt: "Machined aluminium wave-solder carrier with hinged top plate, three views",
          width: 1536,
          height: 1024,
        },
        {
          key: "products/ems/Wave Soldering/WS2.webp",
          alt: "Anodised wave-solder pallet on its base plate, three views",
          width: 1536,
          height: 1024,
        },
        {
          key: "products/ems/Wave Soldering/WS4.webp",
          alt: "Milled aluminium solder pallet with hinged clamp bar",
          width: 1209,
          height: 1300,
        },
      ],
    },
    {
      slug: "jigs-and-fixtures",
      name: "Jigs & Fixtures",
      desc: "Custom tooling for repeatable quality.",
      media: [
        {
          key: "products/ems/Jigs & Fixtures/fixture1.webp",
          alt: "Assembly fixture holding a telematics board in its housing",
          width: 1433,
          height: 1098,
        },
        {
          key: "products/ems/Jigs & Fixtures/fixture5.webp",
          alt: "Fixture-02 screw-gun station, front, back, left and right views",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ems/Jigs & Fixtures/fixture2.webp",
          alt: "Toggle-clamp press fixture, front, back, left and right views",
          width: 1402,
          height: 1122,
        },
        {
          key: "products/ems/Jigs & Fixtures/fixture6.webp",
          alt: "CAD model of a casting checking fixture with toggle clamps and slide pins",
          width: 1402,
          height: 1122,
        },
        {
          key: "products/ems/Jigs & Fixtures/fixture4.webp",
          alt: "Casting checking fixture on the shop floor alongside its CAD model",
          width: 1402,
          height: 1122,
        },
        {
          key: "products/ems/Jigs & Fixtures/fixture3.webp",
          alt: "Six-step diagram of the screw-gun fixture cycle, from loading the board to removing the finished part",
          width: 1535,
          height: 1024,
        },
      ],
    },
    {
      slug: "wave-pallets",
      name: "Wave Pallets",
      desc: "Engineered pallets for wave processes.",
      media: [
        {
          key: "products/ems/Wave Pallets/WP1.webp",
          alt: "Green composite wave-solder pallets, loaded and empty, four views",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ems/Wave Pallets/WP3.webp",
          alt: "Populated board clamped into a black wave-solder pallet",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ems/Wave Pallets/WP4.webp",
          alt: "Board seated in a green composite pallet with clamp screws around the edge",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ems/Wave Pallets/WP5.webp",
          alt: "Two wave-solder pallets side by side, each holding a different board",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ems/Wave Pallets/WP2.webp",
          alt: "Composite wave-solder masks in black retaining frames, four views",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ems/Wave Pallets/WP6.webp",
          alt: "Stacked multi-cavity wave-solder pallets in high-temperature composite",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/ems/Wave Pallets/WP7.webp",
          alt: "Range of wave-solder pallets and masks laid out on a workbench",
          width: 1448,
          height: 1086,
        },
      ],
    },
    {
      slug: "ssd-production",
      name: "SSD Production",
      desc: "Storage assembly with tested reliability.",
      media: [
        {
          key: "products/ems/SSD Production/SSD1.webp",
          alt: "Eight-position automated cover-plate test station",
          width: 1086,
          height: 1448,
        },
        {
          key: "products/ems/SSD Production/SSD3.webp",
          alt: "S.KFW50C-A cover-plate test stand, front and three-quarter views",
          width: 1402,
          height: 1122,
        },
        {
          key: "products/ems/SSD Production/SSD5.webp",
          alt: "M201-BOT cover-plate inspection fixture with vacuum gauge",
          width: 1086,
          height: 1448,
        },
        {
          key: "products/ems/SSD Production/SSD4.webp",
          alt: "Benchtop dispensing robot with an orange part fixture, two views",
          width: 1402,
          height: 1122,
        },
        {
          key: "products/ems/SSD Production/SSD2.webp",
          alt: "Orange tooling fixture mounted on a programmable dispensing station",
          width: 1086,
          height: 1448,
        },
      ],
    },
  ],
};
