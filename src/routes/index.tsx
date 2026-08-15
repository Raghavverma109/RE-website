import { createFileRoute } from "@tanstack/react-router";
import RanayarSite from "./-components/RanayarSite";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RANAYARA Engineering — Electric Vehicles, Built in India" },
      { name: "description", content: "Vertically integrated EV manufacturing: electric bikes, cargo and passenger vehicles, engineered and built in-house from battery to charge port." },
      { property: "og:title", content: "RANAYARA Engineering" },
      { property: "og:description", content: "Electric mobility, engineered and built in-house." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <RanayarSite />;
}
