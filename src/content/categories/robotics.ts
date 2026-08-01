import type { Category } from "../types";

/**
 * The two robotics photos were previously loose <img> tags in the JSX; this
 * gives them a home alongside everything else.
 */
export const robotics: Category = {
  id: "robotics",
  slug: "robotics",
  name: "Robotics & Automation",
  eyebrow: "Robotics & Automation",
  headline: "Robotic cells engineered for uptime.",
  blurb:
    "Custom robotic welding cells, pick-and-place stations and automated lines built around your process.",
  order: 30,
  items: [
    {
      slug: "robotic-welding-cell",
      name: "Robotic Welding Cell",
      desc: "Enclosed six-axis welding cells with fixture integration.",
      media: [
        {
          key: "products/robotics/weld-cell.webp",
          alt: "Six-axis robotic welding cell in operation",
          width: 2730,
          height: 1536,
        },
        {
          key: "products/robotics/machine1.webp",
          alt: "Robotic welding cell, alternate view",
          width: 1395,
          height: 1127,
        },
        {
          key: "products/robotics/machine2.webp",
          alt: "Robotic welding cell, alternate view",
          width: 1402,
          height: 1122,
        },
        {
          key: "products/robotics/machine3.webp",
          alt: "Robotic welding cell, alternate view",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/robotics/machine4.webp",
          alt: "Robotic welding cell, alternate view",
          width: 1470,
          height: 1070,
        },
        {
          key: "products/robotics/machine5.webp",
          alt: "Robotic welding cell, alternate view",
          width: 1472,
          height: 1068,
        },
      ],
    },
    {
      slug: "pick-and-place",
      name: "Pick & Place Station",
      desc: "High-cycle handling stations with vision-guided placement.",
      media: [
        {
          key: "products/robotics/pick-place.webp",
          alt: "Vision-guided robotic pick and place station",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/robotics/machine6.webp",
          alt: "Pick and place station, alternate view",
          width: 1506,
          height: 1044,
        },
        {
          key: "products/robotics/machine7.webp",
          alt: "Pick and place station, alternate view",
          width: 1433,
          height: 1098,
        },
        {
          key: "products/robotics/machine8.webp",
          alt: "Pick and place station, alternate view",
          width: 1101,
          height: 1429,
        },
        {
          key: "products/robotics/machine9.webp",
          alt: "Pick and place station, alternate view",
          width: 1448,
          height: 1086,
        },
        {
          key: "products/robotics/machine10.webp",
          alt: "Pick and place station, alternate view",
          width: 1462,
          height: 1076,
        },
      ],
    },
  ],
};
