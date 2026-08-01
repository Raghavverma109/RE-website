import { createFileRoute } from "@tanstack/react-router";
import RanayarSite from "./-components/RanayarSite";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RANAYARA Engineering — EVs, Robotics & Electronics" },
      { name: "description", content: "Vertically integrated engineering: electric vehicles, robotic automation systems, and precision electronics manufacturing." },
      { property: "og:title", content: "RANAYARA Engineering" },
      { property: "og:description", content: "Electric mobility, robotics and electronics — engineered in-house." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <RanayarSite />;
}
