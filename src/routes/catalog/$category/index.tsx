import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCategory } from "@/content";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CategoryPills } from "@/components/catalog/category-pills";
import { CatalogBreadcrumb } from "@/components/catalog/breadcrumb";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { canonicalUrl } from "@/lib/site";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export const Route = createFileRoute("/catalog/$category/")({
  loader: ({ params }) => {
    const category = getCategory(params.category);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.category.name} — RANAYARA Catalog` },
      { name: "description", content: loaderData?.category.blurb },
      { property: "og:title", content: `${loaderData?.category.name} — RANAYARA Catalog` },
      { property: "og:description", content: loaderData?.category.blurb },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonicalUrl(`/catalog/${loaderData?.category.slug}`) }],
  }),
  component: CategoryListing,
});

function CategoryListing() {
  const { category } = Route.useLoaderData();
  useSmoothScroll();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <div className="reveal">
          <CatalogBreadcrumb
            trail={[{ label: "Catalog", to: "/catalog" }, { label: category.name }]}
          />
        </div>
        <div className="reveal mb-4 mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
          {category.eyebrow}
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          {category.headline}
        </h1>
        <p className="reveal mt-4 max-w-2xl text-lg text-charcoal">{category.blurb}</p>
        <div className="reveal mt-10">
          <CategoryPills activeCategorySlug={category.slug} />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.items.map((product) => (
            <div key={product.slug} className="reveal">
              <CatalogCard categorySlug={category.slug} product={product} />
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
