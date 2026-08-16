import { createFileRoute } from "@tanstack/react-router";
import { categories } from "@/content";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CategoryPills } from "@/components/catalog/category-pills";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { hasImage, image } from "@/lib/media";
import { canonicalUrl, SITE } from "@/lib/site";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

const HERO_IMAGE_KEY = "site/catalogBG.webp";

export const Route = createFileRoute("/catalog/")({
  head: () => ({
    meta: [
      { title: `Catalog — ${SITE.name}` },
      {
        name: "description",
        content: "Browse RANAYARA's full EV catalog: electric bikes, cargo and passenger vehicles.",
      },
      { property: "og:title", content: `Catalog — ${SITE.name}` },
      {
        property: "og:description",
        content: "The full RANAYARA electric vehicle lineup.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalUrl("/catalog") }],
  }),
  component: CatalogIndex,
});

function CatalogIndex() {
  useSmoothScroll();
  const heroHasImage = hasImage(HERO_IMAGE_KEY);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative flex min-h-[60vh] items-end overflow-hidden bg-ink text-white">
        {heroHasImage ? (
          <img
            src={image(HERO_IMAGE_KEY)}
            alt=""
            width={1717}
            height={916}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-brand/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-16 pt-36 sm:px-8">
          <div className="reveal mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
            Product Catalog
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Everything RANAYARA builds.
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <div className="reveal">
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
