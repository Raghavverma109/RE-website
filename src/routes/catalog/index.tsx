import { createFileRoute } from "@tanstack/react-router";
import { categories } from "@/content";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CategoryPills } from "@/components/catalog/category-pills";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export const Route = createFileRoute("/catalog/")({
  head: () => ({
    meta: [
      { title: "Catalog — RANAYARA Engineering" },
      {
        name: "description",
        content: "Browse RANAYARA's full EV catalog: electric bikes, cargo and passenger vehicles.",
      },
      { property: "og:title", content: "Catalog — RANAYARA Engineering" },
      {
        property: "og:description",
        content: "The full RANAYARA electric vehicle lineup.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ranayar.com/catalog" }],
  }),
  component: CatalogIndex,
});

function CatalogIndex() {
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <div className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
          Product Catalog
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Everything RANAYARA builds.
        </h1>
        <div className="reveal mt-10">
          <CategoryPills />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.flatMap((category) =>
            category.items.map((product) => (
              <div key={`${category.slug}-${product.slug}`} className="reveal">
                <CatalogCard categorySlug={category.slug} product={product} />
              </div>
            )),
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
