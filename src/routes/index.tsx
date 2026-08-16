import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import RanayarSite from "./-components/RanayarSite";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} — Electric Vehicles, Built in India` },
      { name: "description", content: "Vertically integrated EV manufacturing: electric bikes, cargo and passenger vehicles, engineered and built in-house from battery to charge port." },
      { property: "og:title", content: SITE.name },
      { property: "og:description", content: SITE.tagline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <RanayarSite />;
}
